"""The demand model, mixed-integer program, logit search, Monte Carlo and
regret analysis of docs/pricing-study-v2-2026-10-18.md (an ANALYSIS: nothing
in force changes).

Reads docs/pricing-study-v2-input-2026-10-18.json, written by
tests/pricing-study-v2-table.ts studyInput() from the repository's own margin
code, and writes docs/pricing-study-v2-output-2026-10-18.json, which
tests/pricing-study-v2.test.ts checks again with that code (every plan of
every design keeps 60% at full use, and the program's objective equals a
deterministic evaluation written in TypeScript).

    python3 scripts/pricing-study-v2.py

Needs numpy and scipy (scipy.optimize.milp and linprog, HiGHS). Every random
draw comes from one seeded generator, so the output is the same on every run.

The model (every parameter is an assumption stated in MODEL, not a
measurement; no sale has ever been open):

  - a population of creators by monthly sales g (lognormal, three scenarios);
  - each chooses, by multinomial logit, among the competitor plans that can
    serve its needs and Marktmorgen's plans on offer; utility is
    asc - eta * ln(all-in monthly cost + hassle), the all-in cost being the
    subscription, the commission or fee on g, card processing where the fee
    does not include it, and prepaid packs where a plan's figures are too
    small;
  - needs: orders = g / AOV, visits = orders / conversion, and list emails
    = emailsPerOrder * orders for a creator selling at least emailFromUsd;
  - each subscriber churns monthly at floor + (cap - floor) * cost/(cost + g),
    and the profit of one month's cohort is counted over a horizon: the
    subscription's net at the average usage (the repository's unitUnder), the
    commission kept after reserves and tax, and the packs' own net.
"""
import json
import math
import pathlib
import time

import numpy as np
import scipy
from scipy.optimize import Bounds, LinearConstraint, linprog, milp
from scipy.sparse import coo_matrix
from scipy.stats import norm

ROOT = pathlib.Path(__file__).resolve().parent.parent
INPUT = ROOT / "docs/pricing-study-v2-input-2026-10-18.json"
OUTPUT = ROOT / "docs/pricing-study-v2-output-2026-10-18.json"
# The deterministic program's segments split each bin by the logistic difference of two Gumbel errors, into
# probability intervals concentrated in the upper tail (where a small share of buyers lives); each interval is
# represented by the quantile at its probability midpoint and weighted by its probability.
PREF_EDGES = [0, 0.5, 0.8, 0.9, 0.95, 0.975, 0.99, 0.995, 0.998, 0.999, 0.9995, 0.9999, 1]

D = json.loads(INPUT.read_text())
M = D["model"]
CANDS = D["candidates"]
CID = {c["id"]: i for i, c in enumerate(CANDS)}
TEMPLATES = D["templateOrder"]
TODAY = [CID[i] for i in D["todayIds"]]
G = np.array(D["bins"]["middles"], dtype=float)
POPS = {p["id"]: p for p in D["populations"]}
PROC_BPS, PROC_FIXED = D["processing"]["bps"] / 10_000, D["processing"]["fixedCents"] / 100
KEEPS = dict(sizing=D["commissionKeep"]["sizing"], gate=D["commissionKeep"]["mostTax"])
# The reading every net is taken under: "sizing" (the most favorable reading the owner may later confirm, which
# sizes every limit) or "gate" (the most-tax reading of lib/tax-gate.ts). Only the company Monte Carlo is run under
# both; everything else is the sizing reading, and the document says so beside every figure.
READING = ["sizing"]


def keep():
    return KEEPS[READING[0]]
COMPS = D["competitors"]
PACKS = {p["id"]: p for p in D["packs"]}
D_COMMISSIONS = {t: sorted({c["commissionBps"] for c in CANDS if c["template"] == t}) for t in TEMPLATES}
USAGE_KEYS = [0, 15, 30, 60, 100]


def base_params(pop="platform-customers", eta=None, asc=None):
    eta = M["base"]["eta"] if eta is None else eta
    asc = M["base"]["asc"] if asc is None else asc
    return dict(pop=pop, eta=eta, asc=asc, paymentsAsc=M["paymentsAsc"], hassle=M["hassleUsd"],
                aov=M["aovUsd"]["base"], conv=M["conversion"]["base"], epo=M["emailsPerOrder"]["base"],
                usage=M["usage"]["base"], yearly=M["yearlyShare"]["base"], churn=tuple(M["churn"]["base"]), horizon=M["horizon"]["base"],
                weights=np.array(POPS[pop]["weights"], dtype=float))


def interp(table, u):
    pts = [table[f"u{k}"] for k in USAGE_KEYS]
    x = u * 100
    for a, b, na, nb in zip(USAGE_KEYS, USAGE_KEYS[1:], pts, pts[1:]):
        if x <= b:
            return (na + (nb - na) * (x - a) / (b - a)) / 100
    return pts[-1] / 100


def net_at(c, u, yearly):
    """The subscription's net a month, in dollars, at a usage share, interpolated between the levels the margin code
    computed: a share `yearly` of payers on the yearly payment (a twelfth of its net a month), the rest monthly; under
    the reading READING."""
    m, y = ("netMonthCents", "netYearMonthCents") if READING[0] == "sizing" else ("gateNetMonthCents", "gateNetYearMonthCents")
    return (1 - yearly) * interp(c[m], u) + yearly * interp(c[y], u)


def needs(p):
    orders = G / p["aov"]
    visits = orders / p["conv"]
    emails = np.where(G >= M["emailFromUsd"], p["epo"] * orders, 0.0)
    return orders, visits, emails


def competitor_utilities(p):
    """Each competitor's deterministic utility in each bin (-inf where it cannot serve the bin)."""
    orders, _, emails = needs(p)
    rows = []
    for c in COMPS:
        cost = c["monthlyUsd"] + c["feeBps"] / 10_000 * G + c["feeFixedCents"] / 100 * orders
        if not c["includesProcessing"]:
            cost = cost + PROC_BPS * G + PROC_FIXED * orders
        cap = math.inf if c["emailCap"] is None else c["emailCap"]
        ok = emails <= cap
        asc = p["paymentsAsc"] if c["kind"] == "payments" else 0.0
        rows.append(np.where(ok, asc - p["eta"] * np.log(cost + p["hassle"]), -np.inf))
    return np.array(rows)


def pack_cost(over, small, large):
    """The cheapest prepaid packs that cover `over` units: (price $, net $, count)."""
    if over <= 0:
        return 0.0, 0.0, 0
    s, l = PACKS[small], PACKS[large]
    best = None
    for nl in range(0, int(math.ceil(over / l["units"])) + 1):
        rem = over - nl * l["units"]
        ns = max(0, int(math.ceil(rem / s["units"])))
        price = nl * l["priceCents"] + ns * s["priceCents"]
        if best is None or price < best[0]:
            nk = "netCents" if READING[0] == "sizing" else "gateNetCents"
            best = (price, nl * l[nk] + ns * s[nk], nl + ns)
    return best[0] / 100, best[1] / 100, best[2]


_ours_cache = {}


def ours(j, p, with_packs):
    """For candidate j: all-in cost, monthly profit, and feasibility in each bin."""
    key = (j, with_packs, p["aov"], p["conv"], p["epo"], p["usage"], p["yearly"], READING[0])
    if key in _ours_cache:
        return _ours_cache[key]
    c = CANDS[j]
    f = c["figures"]
    orders, visits, emails = needs(p)
    comm = c["commissionBps"] / 10_000
    cost = c["monthCents"] / 100 + comm * G + PROC_BPS * G + PROC_FIXED * orders
    prof = np.full(len(G), net_at(c, p["usage"], p["yearly"])) + keep() * comm * G
    ok = np.ones(len(G), dtype=bool)
    head = np.full(len(G), c["headroomMonthCents"] / 100)
    for b in range(len(G)):
        extra_cost, extra_net, count = 0.0, 0.0, 0
        for need, cap, small, large, allowed in (
            (visits[b], f["visits"], "visits", "visits-x4", True),
            (orders[b], f["orders"], "orders", "orders-x4", True),
            (emails[b], f["listEmails"], "list-email", "list-email-x4", f["listEmails"] > 0),
        ):
            if need <= cap:
                continue
            if not with_packs or not allowed:
                ok[b] = False
                break
            pc, pn, n = pack_cost(need - cap, small, large)
            extra_cost, extra_net, count = extra_cost + pc, extra_net + pn, count + n
        if ok[b] and count > M["maxPacks"]:
            ok[b] = False
        cost[b] += extra_cost
        prof[b] += extra_net
        head[b] += extra_net - 0.6 * extra_cost
    out = (cost, prof, ok)
    _ours_cache[key] = out
    _head_cache[key] = head
    return out


_head_cache = {}


def headroom(j, p, with_packs):
    """What one subscriber of candidate j leaves above 60% of its revenue a month at full use, in each bin: the plan's own room (headroomMonthCents) and the room of the packs it buys there, each at full use; the commission counted as zero."""
    ours(j, p, with_packs)
    return _head_cache[(j, with_packs, p["aov"], p["conv"], p["epo"], p["usage"], p["yearly"], READING[0])]


def cash_path(net, new_per_month, fixed, months, churn):
    """The slow-growth cash path of tests/pricing-study-v2-table.ts cashPath(): (first month the month's cash covers the fixed costs, lowest cumulative cash)."""
    payers, cum, trough, be = 0.0, 0.0, 0.0, None
    for t in range(1, months + 1):
        payers = payers * (1 - churn) + new_per_month
        flow = payers * net - fixed
        cum += flow
        trough = min(trough, cum)
        if be is None and flow >= 0:
            be = t
    return be, trough


def revenue_by_sales(design, with_packs, p):
    """What one subscriber pays Marktmorgen a month (the subscription, the commission and prepaid packs; not card processing), by sales bin, averaged over the plans chosen; None where nobody subscribes."""
    if not design:
        return [None] * len(G)
    orders = G / p["aov"]
    inc = comp_inclusive(p)
    V, R = [], []
    for j in design:
        cost, _, ok = ours(j, p, with_packs)
        V.append(np.where(ok, p["asc"] - p["eta"] * np.log(cost + p["hassle"]), -np.inf))
        R.append(cost - PROC_BPS * G - PROC_FIXED * orders)
    V, R = np.array(V), np.array(R)
    m = np.maximum(V.max(axis=0), inc)
    P = np.exp(V - m) / (np.exp(V - m).sum(axis=0) + np.exp(inc - m))
    tot = P.sum(axis=0)
    return [float((P[:, b] * R[:, b]).sum() / tot[b]) if tot[b] > 1e-12 else None for b in range(len(G))]


def anti_stan(r):
    """The owner's "não cometer o erro do stan" (18 October 2026), as tests/pricing-study-v2-table.ts antiStan() reads it."""
    A = M["antiStan"]
    entry = min(CANDS[j]["monthCents"] for j in r["plans"]) / 100
    affordable = entry <= A["entryShareOfMedian"] * POPS[A["population"]]["medianUsd"]
    rev = [x for x in r["revenueBySales"] if x is not None]
    grows = r["packs"] and len(r["plans"]) >= A["minPlans"] and len(rev) >= 2 and rev[-1] >= A["growthRatio"] * rev[0]
    return affordable, grows


def lifetime(cost, p):
    cf, cc = p["churn"]
    churn = cf + (cc - cf) * cost / (cost + G + 1e-9)
    return (1 - (1 - churn) ** p["horizon"]) / churn


def logsumexp_rows(u):
    m = np.max(u, axis=0)
    m = np.where(np.isfinite(m), m, 0.0)
    return m + np.log(np.sum(np.exp(u - m), axis=0))


_comp_cache = {}


def comp_inclusive(p):
    key = (p["eta"], p["hassle"], p["paymentsAsc"], p["aov"], p["conv"], p["epo"])
    if key not in _comp_cache:
        _comp_cache[key] = logsumexp_rows(competitor_utilities(p))
    return _comp_cache[key]


def evaluate(design, with_packs, p, detail=False):
    """Logit profit of a design: dollars over the horizon per 1,000 creators of the population choosing a platform."""
    w = p["weights"]
    inc = comp_inclusive(p)
    vs, profs, lts, costs = [], [], [], []
    for j in design:
        cost, prof, ok = ours(j, p, with_packs)
        vs.append(np.where(ok, p["asc"] - p["eta"] * np.log(cost + p["hassle"]), -np.inf))
        profs.append(prof)
        lts.append(lifetime(cost, p))
        costs.append(cost)
    if not design:
        return (0.0, 0.0, 0.0) if detail else 0.0
    V = np.array(vs)
    m = np.maximum(np.max(V, axis=0), inc)
    ev = np.exp(V - m)
    denom = ev.sum(axis=0) + np.exp(inc - m)
    P = ev / denom
    profit = 1000 * float(np.sum(w * np.sum(P * np.array(lts) * np.array(profs), axis=0)))
    if not detail:
        return profit
    subs = 1000 * float(np.sum(w * P.sum(axis=0)))
    comm = 0.0
    for k, j in enumerate(design):
        comm += 1000 * float(np.sum(w * P[k] * lts[k] * keep() * CANDS[j]["commissionBps"] / 10_000 * G))
    return profit, subs, (comm / profit if profit > 0 else 0.0)


# ------------------------------------------------------------- the mixed-integer program

def segments(p):
    """Deterministic segments: each bin split into the preference intervals of PREF_EDGES."""
    inc = comp_inclusive(p)
    segs = []
    for b in range(len(G)):
        for lo, hi in zip(PREF_EDGES, PREF_EDGES[1:]):
            q = (lo + hi) / 2
            segs.append((b, math.log(q / (1 - q)), p["weights"][b] * (hi - lo), inc[b]))
    return segs


def deterministic_table(p, with_packs):
    """For every segment and candidate: whether it buys the candidate when offered alone, its all-in cost and its profit."""
    segs = segments(p)
    buy, cost, prof = np.zeros((len(segs), len(CANDS)), dtype=bool), np.zeros((len(segs), len(CANDS))), np.zeros((len(segs), len(CANDS)))
    for j in range(len(CANDS)):
        cj, pj, ok = ours(j, p, with_packs)
        lt = lifetime(cj, p)
        for s, (b, xi, w, inc) in enumerate(segs):
            u = p["asc"] - p["eta"] * math.log(cj[b] + p["hassle"]) + xi
            buy[s, j] = bool(ok[b]) and u >= inc
            cost[s, j] = cj[b]
            prof[s, j] = 1000 * w * lt[b] * pj[b]
    return segs, buy, cost, prof


def deterministic_value(design, buy, cost, prof):
    """Each segment buys the cheapest offered candidate it would buy (ties to the lower index)."""
    total = 0.0
    for s in range(buy.shape[0]):
        best = None
        for j in sorted(design):
            if buy[s, j] and (best is None or cost[s, j] < cost[s, best]):
                best = j
        if best is not None:
            total += prof[s, best]
    return total


def solve_milp(p, k, with_packs, admissible_only):
    segs, buy, cost, prof = deterministic_table(p, with_packs)
    n_c = len(CANDS)
    pairs = [(s, j) for s in range(len(segs)) for j in range(n_c) if buy[s, j]]
    nx = len(pairs)
    n = n_c + nx
    c = np.zeros(n)
    for t, (s, j) in enumerate(pairs):
        c[n_c + t] = -prof[s, j]
    # Ties (a plan nobody in the model buys earns the same at any price) go to today's price and to no commission.
    for j, cand in enumerate(CANDS):
        today = next((CANDS[x]["monthCents"] for x in TODAY if CANDS[x]["template"] == cand["template"]), None)
        c[j] += 1e-7 * (abs(cand["monthCents"] - today) if today is not None else cand["monthCents"]) + 1e-7 * cand["commissionBps"]
    rows, lo, hi = [], [], []

    def add(coeffs, low, high):
        rows.append(coeffs)
        lo.append(low)
        hi.append(high)

    by_seg = {}
    for t, (s, j) in enumerate(pairs):
        by_seg.setdefault(s, []).append((t, j))
        add({n_c + t: 1, j: -1}, -np.inf, 0)  # x <= y
    for s, items in by_seg.items():
        add({n_c + t: 1 for t, _ in items}, -np.inf, 1)
        for t, j in items:
            cheaper = [kk for _, kk in items if cost[s, kk] < cost[s, j] or (cost[s, kk] == cost[s, j] and kk < j)]
            if cheaper:
                coeffs = {kk: 1 for kk in cheaper}
                coeffs[n_c + t] = coeffs.get(n_c + t, 0) + 5
                add(coeffs, -np.inf, 5)
    for tpl in TEMPLATES:
        idx = [j for j in range(n_c) if CANDS[j]["template"] == tpl]
        need = 1 if (admissible_only and D["templates"][tpl]["today"]) else 0
        add({j: 1 for j in idx}, need, 1)
    add({j: 1 for j in range(n_c)}, k, k)
    ri, ci, vals = [], [], []
    for r, coeffs in enumerate(rows):
        for kk, v in coeffs.items():
            ri.append(r)
            ci.append(kk)
            vals.append(v)
    A = coo_matrix((vals, (ri, ci)), shape=(len(rows), n)).tocsr()
    t0 = time.time()
    res = milp(c, constraints=LinearConstraint(A, lo, hi), integrality=np.ones(n), bounds=Bounds(0, 1), options={"time_limit": 600, "mip_rel_gap": 0})
    seconds = time.time() - t0
    chosen = sorted(j for j in range(n_c) if res.x is not None and res.x[j] > 0.5)
    value = deterministic_value(chosen, buy, cost, prof) if chosen else 0.0
    return dict(status=str(res.message), objective=-res.fun if res.x is not None else None, value=value, plans=chosen, seconds=seconds), (buy, cost, prof)


def brute_force(k, buy, cost, prof, admissible_only):
    """Every design of one or two plans, for the certificate the program is checked against."""
    import itertools
    best = 0.0
    for combo in itertools.combinations(range(len(CANDS)), k):
        tpls = [CANDS[j]["template"] for j in combo]
        if len(set(tpls)) < k:
            continue
        if admissible_only and not all(t in tpls for t in TEMPLATES if D["templates"][t]["today"]):
            continue
        best = max(best, deterministic_value(list(combo), buy, cost, prof))
    return best


# ------------------------------------------------------------- the logit search

def local_search(design, with_packs, p, admissible_only, k, exclude=()):
    """Coordinate ascent on the logit profit: replace one plan at a time by any candidate of a template not otherwise offered (and not excluded)."""
    design = sorted(design)
    best = evaluate(design, with_packs, p)
    improved = True
    while improved:
        improved = False
        for pos in range(len(design)):
            others = [d for i, d in enumerate(design) if i != pos]
            used = {CANDS[d]["template"] for d in others}
            for j in range(len(CANDS)):
                tpl = CANDS[j]["template"]
                if tpl in used or tpl in exclude or j == design[pos]:
                    continue
                trial = sorted(others + [j])
                if admissible_only and not all(t in {CANDS[x]["template"] for x in trial} for t in TEMPLATES if D["templates"][t]["today"]):
                    continue
                v = evaluate(trial, with_packs, p)
                if v > best + 1e-9:
                    best, design, improved = v, trial, True
                    break
            if improved:
                break
    return design, best



# ------------------------------------------------------------- the company over 60 months

CO = M["company"]
NB = len(G)
NT = len(TEMPLATES)
TPL_INDEX = {t: i for i, t in enumerate(TEMPLATES)}
BASE_NAMED = np.array([math.inf if c["minimumBase"]["named"] is None else c["minimumBase"]["named"] for c in CANDS], dtype=float)
BASE_HIGH = np.array([math.inf if c["minimumBase"]["withUnreviewed"] is None else c["minimumBase"]["withUnreviewed"] for c in CANDS], dtype=float)
NAMED_FIXED_USD = D["namedFixedMonthlyCents"] / 100


def design_matrix(design_list):
    """Designs as an (n, templates) matrix of indexes into the candidates they use (-1 where the template is not offered), those candidates, and the designs' pack flags."""
    Dm = np.full((len(design_list), NT), -1, dtype=int)
    pk = np.zeros(len(design_list), dtype=int)
    for i, (plans, with_packs) in enumerate(design_list):
        for j in plans:
            t = TPL_INDEX[CANDS[j]["template"]]
            assert Dm[i, t] < 0, "one plan per template"
            Dm[i, t] = j
        pk[i] = 1 if with_packs else 0
    used = sorted(set(int(x) for x in Dm.flat if x >= 0))
    pos = {j: i for i, j in enumerate(used)}
    Dc = np.vectorize(lambda x: pos[x] if x >= 0 else -1, otypes=[int])(Dm) if Dm.size else Dm
    return Dc, pk, used


def ramp_weights(ramp):
    a = np.arange(1, CO["months"] + 1)
    w = np.minimum(1.0, a / ramp)
    return w.sum(), w / w.sum()


def candidate_tables(p, used):
    """For the candidates `used` and both pack settings, by bin: utility, profit a month, room above 60% a month, monthly churn."""
    nC = len(used)
    V = np.full((2, nC, NB), -np.inf)
    PR = np.zeros((2, nC, NB))
    H = np.zeros((2, nC, NB))
    C = np.zeros((2, nC, NB))
    cf, cc = p["churn"]
    for k, with_packs in enumerate((False, True)):
        for i, j in enumerate(used):
            cost, prof, ok = ours(j, p, with_packs)
            V[k, i] = np.where(ok, p["asc"] - p["eta"] * np.log(cost + p["hassle"]), -np.inf)
            PR[k, i] = prof
            H[k, i] = headroom(j, p, with_packs)
            C[k, i] = cf + (cc - cf) * cost / (cost + G + 1e-9)
    return V, PR, H, C


def stay_moments(C, wt):
    """For a monthly churn c and arrival months weighted wt (months 1..T): the probability an arrival is still a payer at month T, and the first two moments of the months it pays, for those still there and for those gone."""
    T = CO["months"]
    a = np.arange(1, T + 1)
    A = T + 1 - a                      # months from arrival to T, inclusive
    r = 1.0 - C[..., None]             # (..., 1)
    surv = r ** (T - a)                # P(still there at T | arrived at a)
    q = (wt * surv).sum(-1)
    s1 = (wt * surv * A).sum(-1)
    s2 = (wt * surv * A * A).sum(-1)
    m = np.arange(1, T + 1)
    pm = r ** (m - 1) * C[..., None]   # P(pays exactly m months), m = 1..T
    c1 = np.concatenate([np.zeros(C.shape + (1,)), np.cumsum(m * pm, -1)], -1)
    c2 = np.concatenate([np.zeros(C.shape + (1,)), np.cumsum(m * m * pm, -1)], -1)
    g1 = (wt * c1[..., A - 1]).sum(-1)  # E[M; gone]: sum over m < A
    g2 = (wt * c2[..., A - 1]).sum(-1)
    qs = np.maximum(q, 1e-300)
    qg = np.maximum(1 - q, 1e-300)
    ems, emg = s1 / qs, g1 / qg
    return q, ems, np.maximum(s2 / qs - ems ** 2, 0.0), emg, np.maximum(g2 / qg - emg ** 2, 0.0)


def poisson_inverse(u, lam):
    """The Poisson quantile at u, element by element: exact by summing the mass for lam <= 30, the normal approximation above (common random numbers across designs)."""
    n = np.zeros(lam.shape)
    big = lam > 30
    if big.any():
        n[big] = np.maximum(0.0, np.floor(lam[big] + np.sqrt(lam[big]) * norm.ppf(u[big]) + 0.5))
    idx = np.flatnonzero(~big)
    if idx.size:
        lm, uu = lam.flat[idx], u.flat[idx]
        pk = np.exp(-lm)
        F = pk.copy()
        out = np.zeros(idx.size)
        act = np.flatnonzero(uu > F)
        k = 0
        while act.size and k < 200:
            k += 1
            pk[act] *= lm[act] / k
            F[act] += pk[act]
            out[act] += 1
            act = act[uu[act] > F[act]]
        n.flat[idx] = out
    return n


def company_draw(p, reach, ramp, fixed_usd, Dm, pk, used, U, simulate=True, trough=False):
    """One draw: for every design, the expected 60-month cash, and (simulate) one realization: cash, whether month 60's
    room above 60% covers the fixed costs; with `trough`, also the lowest cumulative cash of the draw's expected month
    by month path (the arrivals and churn of its own parameters, without the Poisson noise), at most 0: what the owner
    must carry before the company pays for itself."""
    V, PR, H, C = candidate_tables(p, used)
    inc = comp_inclusive(p)
    wsum, wt = ramp_weights(ramp)
    q, ems, vms, emg, vmg = stay_moments(C, wt)
    m = np.maximum(V.max(axis=(0, 1)), inc)
    E = np.exp(V - m)
    Ein = np.exp(inc - m)
    safe = np.maximum(Dm, 0)
    mask = (Dm >= 0)[..., None]
    k = pk[:, None]
    Ed = np.where(mask, E[k, safe], 0.0)
    P = Ed / (Ed.sum(axis=1, keepdims=True) + Ein)
    lam = reach * wsum * p["weights"] * P
    g = lambda X: X[k, safe]
    pr, hh, qq, e1, v1, e2, v2 = g(PR), g(H), g(q), g(ems), g(vms), g(emg), g(vmg)
    T = CO["months"]
    expected = (lam * pr * (qq * e1 + (1 - qq) * e2)).sum(axis=(1, 2)) - T * fixed_usd
    payers60 = (lam * qq).sum(axis=(1, 2))
    room60 = (lam * qq * hh).sum(axis=(1, 2))
    if not simulate:
        return expected, payers60, room60
    Us, Ug, Z = U
    ns = poisson_inverse(np.broadcast_to(Us, lam.shape).copy(), lam * qq)
    ng = poisson_inverse(np.broadcast_to(Ug, lam.shape).copy(), lam * (1 - qq))
    n = ns + ng
    months_paid = np.clip(ns * e1 + ng * e2 + np.sqrt(ns * v1 + ng * v2) * Z, n, T * n)
    cash = (pr * months_paid * mask).sum(axis=(1, 2)) - T * fixed_usd
    room = (ns * hh * mask).sum(axis=(1, 2))
    if not trough:
        return expected, cash, room >= fixed_usd
    r = 1.0 - g(C)
    arrive = lam * mask
    payers = np.zeros(lam.shape)
    cum = np.zeros(lam.shape[0])
    low = np.zeros(lam.shape[0])
    for month in range(T):
        payers = payers * r + arrive * wt[month]
        cum += (pr * payers).sum(axis=(1, 2)) - fixed_usd
        low = np.minimum(low, cum)
    return expected, cash, room >= fixed_usd, low


def draw_params(rng):
    """Every parameter of one Monte Carlo draw (the demand model's ranges, and the company's)."""
    pop_ids = list(POPS)
    pop = POPS[pop_ids[rng.integers(len(pop_ids))]]
    sigma = pop["sigma"] * rng.uniform(*M["mc"]["sigmaScale"])
    edges = [e if e is not None else math.inf for e in D["bins"]["edges"]]
    cdf = [0.0 if e <= 0 else (1.0 if math.isinf(e) else float(norm.cdf((math.log(e) - pop["mu"]) / sigma))) for e in edges]
    R = M["mc"]
    lu = lambda k: float(np.exp(rng.uniform(math.log(R[k][0]), math.log(R[k][1]))))
    p = dict(pop=pop["id"], eta=rng.uniform(*R["eta"]), asc=rng.uniform(*R["asc"]), paymentsAsc=rng.uniform(*R["paymentsAsc"]), hassle=rng.uniform(*R["hassleUsd"]),
             aov=lu("aovUsd"), conv=lu("conversion"), epo=lu("emailsPerOrder"), usage=rng.uniform(*R["usage"]),
             churn=(rng.uniform(*R["churnFloor"]), rng.uniform(*R["churnCap"])), horizon=M["horizon"]["base"], weights=np.diff(cdf),
             yearly=rng.uniform(M["yearlyShare"]["low"], M["yearlyShare"]["high"]))
    reach = float(np.exp(rng.uniform(math.log(CO["reach"]["low"]), math.log(CO["reach"]["high"]))))
    ramp = rng.uniform(CO["rampMonths"]["low"], CO["rampMonths"]["high"])
    fixed = NAMED_FIXED_USD + rng.uniform(CO["unreviewedFixedCents"]["low"], CO["unreviewedFixedCents"]["high"]) / 100
    U = (rng.random((NT, NB)), rng.random((NT, NB)), rng.standard_normal((NT, NB)))
    return p, reach, ramp, fixed, U


def company_rows(design_list, seed, start, stop, reading="sizing", trough=False):
    """Draws start..stop-1 of the company's Monte Carlo for every design: the seeded generator is replayed through the
    earlier draws (draw_params takes the same numbers whatever is done with them), and `used`, the logit normalizer's
    set of candidates, is always the whole design list's, so a range computed alone equals the same range of one run."""
    Dm, pk, used = design_matrix(design_list)
    rng = np.random.default_rng(seed)
    for _ in range(start):
        draw_params(rng)
    n, k = len(design_list), stop - start
    edges = np.exp(np.linspace(math.log(CO["reach"]["low"]), math.log(CO["reach"]["high"]), 4))
    rows = dict(start=start, stop=stop, e=np.zeros((k, n)), cash=np.zeros((k, n), dtype=np.float32), neg=np.zeros((k, n), dtype=bool),
                consol=np.zeros((k, n), dtype=bool), band=np.zeros(k, dtype=int), trough=np.zeros((k, n), dtype=np.float32) if trough else None)
    saved = READING[0]
    READING[0] = reading
    try:
        for t in range(k):
            p, reach, ramp, fixed, U = draw_params(rng)
            rows["band"][t] = min(2, int(np.searchsorted(edges, reach, side="right") - 1))
            _ours_cache.clear()
            _head_cache.clear()
            _comp_cache.clear()
            res = company_draw(p, reach, ramp, fixed, Dm, pk, used, U, trough=trough)
            e, c, consol = res[:3]
            rows["e"][t] = e
            rows["cash"][t] = c
            rows["neg"][t] = c < 0
            rows["consol"][t] = consol
            if trough:
                rows["trough"][t] = res[3]
    finally:
        READING[0] = saved
        _ours_cache.clear()
        _head_cache.clear()
    return rows


def company_summarize(chunks, n, draws):
    """The Monte Carlo's figures from its draws, accumulated in draw order (the chunks of company_rows, in any order)."""
    chunks = sorted(chunks, key=lambda r: r["start"])
    assert [r["start"] for r in chunks] == [0] + [r["stop"] for r in chunks[:-1]] and chunks[-1]["stop"] == draws, "draws missing or repeated"
    E, cash, NEG, CONS = (np.concatenate([r[x] for r in chunks]) for x in ("e", "cash", "neg", "consol"))
    BAND = np.concatenate([r["band"] for r in chunks])
    exp_sum = np.zeros(n)
    lose_cash = np.zeros(n)
    not_consol = np.zeros(n)
    lose = np.zeros(n)
    edges = np.exp(np.linspace(math.log(CO["reach"]["low"]), math.log(CO["reach"]["high"]), 4))
    band_lose = np.zeros((3, n))
    band_n = np.zeros(3)
    for t in range(draws):
        exp_sum += E[t]
        lose_cash += NEG[t]
        not_consol += ~CONS[t]
        lose += NEG[t] | ~CONS[t]
        band_lose[BAND[t]] += NEG[t] | ~CONS[t]
        band_n[BAND[t]] += 1
    out = []
    pct = np.percentile(cash, [5, 50, 95], axis=0)
    mean = cash.mean(axis=0, dtype=np.float64)
    TR = np.concatenate([r["trough"] for r in chunks]) if chunks[0].get("trough") is not None else None
    if TR is not None:
        tpct = np.percentile(TR, [5, 50], axis=0)
        tdeep = {x: (TR < -x).mean(axis=0) for x in TROUGH_LEVELS}
    for i in range(n):
        pl = lose[i] / draws
        row = dict(draws=draws, expected=float(exp_sum[i] / draws), simulatedMean=float(mean[i]), p5=float(pct[0, i]), p50=float(pct[1, i]), p95=float(pct[2, i]),
                   pLoss=float(pl), pCashLoss=float(lose_cash[i] / draws), pNotConsolidated=float(not_consol[i] / draws), se=float(math.sqrt(max(pl * (1 - pl), 1e-12) / draws)),
                   pLossByReach=[float(band_lose[k, i] / band_n[k]) if band_n[k] else None for k in range(3)], reachBands=[float(x) for x in edges])
        if TR is not None:
            row.update(troughP5=float(tpct[0, i]), troughP50=float(tpct[1, i]), pTroughBelow={str(x): float(tdeep[x][i]) for x in TROUGH_LEVELS})
        out.append(row)
    return out


class LocalExecutor:
    """Runs the expensive, independent parts in this process. scripts/pricing-study-v2-shard.py replaces it with one that
    splits them across machines (programs by task, Monte Carlos by range of draws) and gives back the same values."""

    def programs(self, tasks, run):
        return [run(t) for t in tasks]

    def draws(self, spec, draws, rows, summarize):
        return summarize([rows(0, draws)])


EXECUTOR = [LocalExecutor()]


# The trough levels reported: the share of draws whose expected path takes cumulative cash below minus each (dollars).
TROUGH_LEVELS = (500, 2_000, 5_000)


def company_monte_carlo(design_list, draws, seed, reading="sizing", trough=False):
    """The company's 60 months for every design, over `draws` draws with common random numbers: expected cash, its percentiles, and the probabilities of each kind of loss (and, with `trough`, the lowest cumulative cash on the way), under `reading`."""
    design_list = [(list(plans), bool(pk)) for plans, pk in design_list]
    spec = ("company", design_list, seed) if (reading, trough) == ("sizing", False) else ("company", design_list, seed, reading, trough)
    return EXECUTOR[0].draws(spec, draws, lambda a, b: company_rows(design_list, seed, a, b, reading, trough),
                             lambda chunks: company_summarize(chunks, len(design_list), draws))


def cohort_rows(pool, seed, start, stop):
    """Draws start..stop-1 of the cohort Monte Carlo: each design's profit in the demand model, the generator replayed through the earlier draws."""
    rng = np.random.default_rng(seed)
    for _ in range(start):
        draw_params(rng)
    out = np.zeros((stop - start, len(pool)))
    for t in range(stop - start):
        p, _, _, _, _ = draw_params(rng)
        _ours_cache.clear()
        _head_cache.clear()
        _comp_cache.clear()
        for i, (plans, packs) in enumerate(pool):
            out[t, i] = evaluate(plans, packs, p)
    return dict(start=start, stop=stop, profit=out)


def cohort_monte_carlo(pool, draws, seed):
    pool = [(list(plans), bool(pk)) for plans, pk in pool]

    def summarize(chunks):
        chunks = sorted(chunks, key=lambda r: r["start"])
        assert [r["start"] for r in chunks] == [0] + [r["stop"] for r in chunks[:-1]] and chunks[-1]["stop"] == draws, "draws missing or repeated"
        return np.concatenate([r["profit"] for r in chunks])
    return EXECUTOR[0].draws(("cohort", pool, seed), draws, lambda a, b: cohort_rows(pool, seed, a, b), summarize)


def worst_reach_needed(design_list):
    """Rule (b) in its worst scenario: reach at its low end, the slowest ramp, the high churn, the whole unreviewed allowance, the named scenario that keeps the fewest payers at month 60. The reach each design needs for its payers at month 60 to be the repository's minimum base (every customer on the least plan), and for the room of its own mix to cover the fixed costs."""
    Dm, pk, used = design_matrix(design_list)
    fixed = NAMED_FIXED_USD + CO["unreviewedFixedCents"]["high"] / 100
    base = np.array([max((BASE_HIGH[j] for j in plans), default=math.inf) for plans, _ in design_list])
    worst_payers = np.full(len(design_list), np.inf)
    worst_room = np.full(len(design_list), np.inf)
    worst_sc = [None] * len(design_list)
    for pop in POPS:
        for eta in M["eta"]:
            for asc in M["asc"]:
                p = dict(base_params(pop, eta, asc), churn=tuple(M["churn"]["high"]))
                _, payers, room = company_draw(p, 1.0, CO["rampMonths"]["high"], fixed, Dm, pk, used, None, simulate=False)
                for i in np.flatnonzero(payers < worst_payers):
                    worst_sc[i] = f"{pop}|eta{eta:g}|asc{asc:g}"
                worst_payers = np.minimum(worst_payers, payers)
                worst_room = np.minimum(worst_room, room)
    need = np.where(worst_payers > 0, base / np.maximum(worst_payers, 1e-300), np.inf)
    need_mix = np.where(worst_room > 0, fixed / np.maximum(worst_room, 1e-300), np.inf)
    return [dict(minimumBase=None if math.isinf(base[i]) else int(base[i]), payers60PerReach=float(worst_payers[i]), reachNeeded=None if not math.isfinite(need[i]) else float(need[i]),
                 reachNeededMix=None if not math.isfinite(need_mix[i]) else float(need_mix[i]), scenario=worst_sc[i],
                 meets=bool(math.isfinite(need[i]) and need[i] <= CO["reach"]["low"])) for i in range(len(design_list))]


def choose(designs, key="final"):
    """The owner's rule on a pool: the lowest probability of loss p*, then the highest expected profit within the tolerance of p* (ties: lower probability of loss, then the id)."""
    pool = [d for d in designs if d["company"].get(key)]
    if not pool:
        return None, None
    pstar = min(d["company"][key]["pLoss"] for d in pool)
    elig = [d for d in pool if d["company"][key]["pLoss"] <= pstar + CO["lossTolerance"] + 1e-12]
    best = min(elig, key=lambda d: (-round(d["company"][key]["expected"], 2), d["company"][key]["pLoss"], d["id"]))
    return best, pstar


def frontier(designs, key="final"):
    """Designs no other beats on both expected profit and probability of loss, from the safest up."""
    pool = sorted([d for d in designs if d["company"].get(key)], key=lambda d: (d["company"][key]["pLoss"], -d["company"][key]["expected"], d["id"]))
    out, best = [], -math.inf
    for d in pool:
        if d["company"][key]["expected"] > best + 1e-9:
            out.append(d)
            best = d["company"][key]["expected"]
    return out


# ------------------------------------------------------------- run

def label_of(design, with_packs):
    parts = []
    for j in sorted(design, key=lambda x: CANDS[x]["monthCents"]):
        c = CANDS[j]
        size = "" if c["size"] == "today" else f" {c['size']}"
        parts.append(f"{c['title'].replace(' (new)', '')}{size} ${c['monthCents'] // 100}" + (f" + {c['commissionBps'] / 100:g}%" if c["commissionBps"] else ""))
    return " · ".join(parts) + (" · packs" if with_packs else "")


def program_tasks(scenarios):
    """The programs' independent tasks, in the order their designs are remembered."""
    tasks = []
    for with_packs in (False, True):
        for admissible_only in (False, True):
            for k in range(1, 6):
                if admissible_only and k < 3:
                    continue
                tasks.append(("base", with_packs, admissible_only, k))
    for sc in scenarios:
        tasks.append(("scenario", sc["id"], sc["population"], sc["eta"], sc["asc"]))
    return tasks


def run_program_task(task):
    """One task: the designs it remembers, in order, and its program's record (base tasks only)."""
    calls = []

    def remember(plans, with_packs, origin):
        calls.append((list(plans), with_packs, origin))

    if task[0] == "base":
        _, with_packs, admissible_only, k = task
        r, tables = solve_milp(base_params(), k, with_packs, admissible_only)
        bf = brute_force(k, *tables, admissible_only) if k <= 2 else None
        rec = dict(k=k, packs=with_packs, admissibleOnly=admissible_only, status=r["status"], objective=round(r["objective"], 6),
                   value=round(r["value"], 6), plans=[CANDS[j]["id"] for j in r["plans"]],
                   bruteForce=None if bf is None else round(bf, 6), seconds=round(r["seconds"], 1))
        remember(r["plans"], with_packs, f"program, base scenario, {k} plans" + (", today's three kept" if admissible_only else ""))
        print(f"  base k={k} packs={with_packs} kept={admissible_only}: {r['seconds']:.0f}s", flush=True)
        return calls, rec

    # The program on a named scenario (today's three kept, packs on), then the logit search from each solution in its own scenario.
    _, sid, population, eta, asc = task
    p = base_params(population, eta, asc)
    for k in (4, 5):
        r, _ = solve_milp(p, k, True, True)
        remember(r["plans"], True, f"program, {sid}, {k} plans")
        ls, _ = local_search(r["plans"], True, p, True, k)
        remember(ls, True, f"logit search, {sid}, {k} plans")
        # The same without the smallest plan (Start): the owner's no-loss rule weighs the lowest net a payer can bring.
        no_start = [j for j in r["plans"] if CANDS[j]["template"] != "start"]
        ls2, _ = local_search(no_start, True, p, True, len(no_start), exclude=("start",))
        remember(ls2, True, f"logit search without Start, {sid}, {len(no_start)} plans")
    ls3, _ = local_search(TODAY, True, p, True, 3, exclude=("start", "growth"))
    remember(ls3, True, f"logit search from today's three, {sid}")
    r, _ = solve_milp(p, 2, True, False)
    remember(r["plans"], True, f"program, {sid}, 2 plans, unrestricted")
    ls, _ = local_search(r["plans"], True, p, False, 2)
    remember(ls, True, f"logit search, {sid}, 2 plans, unrestricted")
    print(f"  {sid} done", flush=True)
    return calls, None


def programs(base, scenarios, remember):
    """The mixed-integer program on the base scenario (every plan count, with and without packs, all designs and admissible ones) and on every named scenario, with the logit search from each solution."""
    milp_runs = []
    for calls, rec in EXECUTOR[0].programs(program_tasks(scenarios), run_program_task):
        for plans, with_packs, origin in calls:
            remember(plans, with_packs, origin)
        if rec is not None:
            milp_runs.append(rec)
    return milp_runs


def main():
    scenarios = []
    for pop in POPS:
        for eta in M["eta"]:
            for asc in M["asc"]:
                scenarios.append(dict(id=f"{pop}|eta{eta:g}|asc{asc:g}", population=pop, eta=eta, asc=asc))
    base = base_params()

    designs = {}

    def remember(plans, with_packs, origin):
        key = (tuple(sorted(plans)), with_packs)
        if key not in designs:
            tpl = {CANDS[j]["template"] for j in plans}
            designs[key] = dict(plans=sorted(plans), packs=with_packs, origin=origin, names=[], admissible=all(t in tpl for t in TEMPLATES if D["templates"][t]["today"]))
        return key

    # Development only: PRICING_STUDY_STAGE_CACHE names a pickle that keeps the programs' designs between runs, and
    # PRICING_STUDY_DRAWS="screen,final" lowers the company draws. The output records both counts, and
    # tests/pricing-study-v2.test.ts fails unless they are the model's.
    import os
    import pickle
    cache = os.environ.get("PRICING_STUDY_STAGE_CACHE")
    if os.environ.get("PRICING_STUDY_DRAWS"):
        a, b = os.environ["PRICING_STUDY_DRAWS"].split(",")
        CO["draws"], CO["finalDraws"] = int(a), int(b)
    if cache and os.path.exists(cache):
        designs_cached, milp_runs = pickle.load(open(cache, "rb"))
        designs.update(designs_cached)
    else:
        milp_runs = programs(base, scenarios, remember)
        if cache:
            pickle.dump((designs, milp_runs), open(cache, "wb"))

    # Named designs for the hypothesis.
    named = {
        "today": (TODAY, False),
        "today + packs": (TODAY, True),
    }
    def find(tpl, dollars, size, bps):
        return CID[f"{tpl}-{dollars}-{size}-c{bps}"]
    named["today + Start $54 + 0%"] = (TODAY + [find("start", 54, "max", 0)], True)
    for dollars in (29, 39, 49):
        for bps in (0, 500, 1000):
            named[f"today + Start ${dollars} + {bps / 100:g}%"] = (TODAY + [find("start", dollars, "max", bps)], True)
    for dollars in (79, 89, 99, 119, 149):
        named[f"today with Store at ${dollars}"] = ([find("creator", dollars, "today", 0), TODAY[1], TODAY[2]], True)
    named["Store $69 + 5% (today's others)"] = ([find("creator", 69, "today", 500), TODAY[1], TODAY[2]], True)
    named["Stan-like: Start $29 + Store $99, 0%"] = ([find("start", 29, "max", 0), find("creator", 99, "today", 0)], False)
    named["single fixed price: Store $69, no packs"] = ([find("creator", 69, "today", 0)], False)
    named["single fixed price: Start $29, no packs"] = ([find("start", 29, "max", 0)], False)
    for name, (plans, pk) in named.items():
        designs[remember(plans, pk, f"named: {name}")]["names"].append(name)

    # The grid the company rule is weighed on: every combination of a Start (none, half size, or the largest size at
    # $29, $49 or $54, the anti-Stan maximum), a Store price, a Growth (none, half size, or the largest at $129 or $199), a Studio price and a Scale
    # price, with packs and no commission (commission variants of the best are added below).
    by_tpl = lambda t: [j for j, c in enumerate(CANDS) if c["template"] == t and c["commissionBps"] == 0]
    starts = [None] + [j for j in by_tpl("start") if CANDS[j]["size"] == "half" or CANDS[j]["monthCents"] in (2_900, 4_900, 5_400)]
    growths = [None] + [j for j in by_tpl("growth") if CANDS[j]["size"] == "half" or CANDS[j]["monthCents"] in (12_900, 19_900)]
    import itertools
    for combo in itertools.product(starts, by_tpl("creator"), growths, by_tpl("pro"), by_tpl("scale")):
        remember([j for j in combo if j is not None], True, "grid for the company rule")

    sc_params = {sc["id"]: base_params(sc["population"], sc["eta"], sc["asc"]) for sc in scenarios}
    results = []
    by_key = {}

    def finish(keys):
        """The cohort profit of each new design in every named scenario, at the base, by horizon, and by sales."""
        for key in keys:
            d = designs[key]
            r = dict(key=key, **d, profit={sid: evaluate(d["plans"], d["packs"], p) for sid, p in sc_params.items()})
            pr, subs, cs = evaluate(r["plans"], r["packs"], base, detail=True)
            r["baseProfit"], r["subs"], r["commShare"] = pr, subs, cs
            r["horizon"] = {str(h): evaluate(r["plans"], r["packs"], dict(base, horizon=h)) for h in M["horizon"]["values"]}
            r["revenueBySales"] = revenue_by_sales(r["plans"], r["packs"], base)
            r["affordable"], r["grows"] = anti_stan(r)
            r["id"] = "|".join(CANDS[j]["id"] for j in r["plans"]) + ("|packs" if r["packs"] else "")
            r["company"] = {}
            results.append(r)
            by_key[key] = r

    finish(list(designs))
    print(f"  {len(results)} designs evaluated in every scenario", flush=True)

    # The company over 60 months: screening, every design on the same draws.
    def screen(rs):
        out = company_monte_carlo([(list(r["plans"]), r["packs"]) for r in rs], CO["draws"], CO["seed"])
        worst = worst_reach_needed([(list(r["plans"]), r["packs"]) for r in rs])
        for r, o, w in zip(rs, out, worst):
            r["company"]["screen"], r["company"]["worst"] = o, w
    screen(results)
    print("  company screening done", flush=True)

    def kept(r):
        return r["admissible"]
    def stan_proof(r):
        return r["affordable"] and r["grows"]
    def no_commission(r):
        return all(CANDS[j]["commissionBps"] == 0 for j in r["plans"])
    def meets_b(r):
        return r["company"]["worst"]["meets"]
    b_feasible = any(meets_b(r) and kept(r) and stan_proof(r) for r in results)
    main_filters = [kept, stan_proof] + ([meets_b] if b_feasible else [])

    def pool(rs, filters):
        return [r for r in rs if all(f(r) for f in filters)]

    # Commission variants of the best designs under the rule: each plan at each share of sales its template allows, one plan at a time,
    # and every plan at once at its smallest share; screened on the same draws.
    seeds = []
    mp = pool(results, main_filters)
    pstar = min(r["company"]["screen"]["pLoss"] for r in mp)
    near = sorted([r for r in mp if r["company"]["screen"]["pLoss"] <= pstar + CO["finalWindow"]], key=lambda r: -r["company"]["screen"]["expected"])[:8]
    seeds = near + sorted(mp, key=lambda r: -r["company"]["screen"]["expected"])[:4]
    before = set(designs)
    for sd in seeds:
        plans = list(sd["plans"])
        for pos, j in enumerate(plans):
            c = CANDS[j]
            for bps in D_COMMISSIONS[c["template"]]:
                if bps == 0:
                    continue
                v = CID.get(f"{c['template']}-{c['monthCents'] // 100}-{c['size']}-c{bps}")
                if v is not None:
                    remember(plans[:pos] + [v] + plans[pos + 1:], sd["packs"], f"commission variant of {sd['id']}")
        allv = [CID.get(f"{CANDS[j]['template']}-{CANDS[j]['monthCents'] // 100}-{CANDS[j]['size']}-c{next((b for b in D_COMMISSIONS[CANDS[j]['template']] if b > 0), 0)}") for j in plans]
        if all(v is not None for v in allv):
            remember(allv, sd["packs"], f"commission variant of {sd['id']}")
    added = [k for k in designs if k not in before]
    first = len(results)
    finish(added)
    screen(results[first:])
    print(f"  {len(added)} commission variants screened", flush=True)

    best_in = {sid: max(r["profit"][sid] for r in results) for sid in sc_params}
    for r in results:
        regrets = {sid: (best_in[sid] - r["profit"][sid]) / best_in[sid] if best_in[sid] > 0 else 0.0 for sid in sc_params}
        r["worstRegret"] = max(regrets.values())
        r["meanRegret"] = float(np.mean(list(regrets.values())))
        r["meanProfit"] = float(np.mean(list(r["profit"].values())))
    admissible = [r for r in results if r["admissible"]]
    regret_best = min(admissible, key=lambda r: (round(r["worstRegret"], 9), -r["meanProfit"]))

    # The pools the rule is applied to: the owner's rules, each relaxed alone, and none.
    POOLS = {
        "recommended": main_filters,
        "withoutCommission": main_filters + [no_commission],
        "withoutKeepingToday": [f for f in main_filters if f is not kept],
        "withoutAntiStan": [f for f in main_filters if f is not stan_proof],
        "withoutRuleB": [kept, stan_proof],
        "none": [],
        "noneWithoutCommission": [no_commission],
    }
    # The designs drawn again: in each pool, those screened within the window of its safest (best expected first) and its screened frontier.
    final_keys = []
    def add_final(r):
        if r["key"] not in final_keys:
            final_keys.append(r["key"])
    for name, filters in POOLS.items():
        pl = pool(results, filters)
        ps_ = min(r["company"]["screen"]["pLoss"] for r in pl)
        for r in sorted([r for r in pl if r["company"]["screen"]["pLoss"] <= ps_ + CO["finalWindow"]], key=lambda r: -r["company"]["screen"]["expected"])[:40]:
            add_final(r)
        for r in frontier(pl, "screen")[:60]:
            add_final(r)
        for r in sorted(pl, key=lambda r: -r["company"]["screen"]["expected"])[:5]:
            add_final(r)
    for r in results:
        if r["names"]:
            add_final(r)
    add_final(regret_best)
    finals = [by_key[k] for k in final_keys]
    fin = company_monte_carlo([(list(r["plans"]), r["packs"]) for r in finals], CO["finalDraws"], CO["finalSeed"], trough=True)
    # The same draws under the gate reading (the most-tax reading of lib/tax-gate.ts): the cash a design would leave if
    # the reading with more tax is the one that holds. No plan keeps 60% there, so nothing is consolidated at 60%.
    fin_gate = company_monte_carlo([(list(r["plans"]), r["packs"]) for r in finals], CO["finalDraws"], CO["finalSeed"], reading="gate", trough=True)
    for r, o, og in zip(finals, fin, fin_gate):
        r["company"]["final"] = o
        r["company"]["gate"] = og
    print(f"  {len(finals)} designs drawn again on {CO['finalDraws']} draws", flush=True)

    choice = {}
    for name, filters in POOLS.items():
        best, ps_ = choose(pool(finals, filters))
        choice[name] = dict(design=best["id"], pStar=ps_)
    rec = by_key[next(r["key"] for r in finals if r["id"] == choice["recommended"]["design"])]
    no_comm = next(r for r in finals if r["id"] == choice["withoutCommission"]["design"])
    main_final = pool(finals, main_filters)
    fr = frontier(main_final)
    nxt = next((r for r in fr if r["company"]["final"]["expected"] > rec["company"]["final"]["expected"] + 1e-9), None)
    # The cheapest check of the rule in TypeScript: the recommendation's expected cash at fixed values, recomputed by the test.
    check_p = base_params()
    check = dict(design=rec["id"], reach=1_000, rampMonths=24, fixedCents=D["namedFixedMonthlyCents"] + 25_000, population="platform-customers")
    Dm_, pk_, used_ = design_matrix([(list(rec["plans"]), rec["packs"])])
    _ours_cache.clear(); _head_cache.clear(); _comp_cache.clear()
    e_, n_, h_ = company_draw(check_p, check["reach"], check["rampMonths"], check["fixedCents"] / 100, Dm_, pk_, used_, None, simulate=False)
    check.update(expectedCashUsd=float(e_[0]), payers60=float(n_[0]), room60Usd=float(h_[0]))

    # Cohort Monte Carlo (the demand model's own profit, for the tables below): the 25 best by mean profit, the recommendation and the named ones.
    ranked = sorted(results, key=lambda r: -r["meanProfit"])
    mc_pool = []
    for r in ranked[:25] + [rec, regret_best, no_comm] + [x for x in results if x["names"]] + ([nxt] if nxt else []):
        if r["key"] not in [x["key"] for x in mc_pool]:
            mc_pool.append(r)
    draws = cohort_monte_carlo([(r["plans"], r["packs"]) for r in mc_pool], M["monteCarloDraws"], M["seed"])
    best_idx = draws.argmax(axis=1)
    mc = {}
    for i, r in enumerate(mc_pool):
        col = draws[:, i]
        mc[r["key"]] = dict(mean=float(col.mean()), p5=float(np.percentile(col, 5)), p50=float(np.percentile(col, 50)), p95=float(np.percentile(col, 95)), probBest=float(np.mean(best_idx == i)))

    # Sensitivity of the recommendation: each parameter at its low and high value, the others at the base.
    _ours_cache.clear()
    _head_cache.clear()
    _comp_cache.clear()
    def at(**kw):
        return evaluate(rec["plans"], rec["packs"], dict(base, **kw))
    b0 = evaluate(rec["plans"], rec["packs"], base)
    sens = [
        dict(parameter=f"price sensitivity eta ({M['eta'][0]:g} / {M['eta'][-1]:g})", low=at(eta=M["eta"][0]), base=b0, high=at(eta=M["eta"][-1])),
        dict(parameter=f"preference for Marktmorgen ({M['asc'][0]:g} / {M['asc'][-1]:g})", low=at(asc=M["asc"][0]), base=b0, high=at(asc=M["asc"][-1])),
        dict(parameter=f"average order value (${M['aovUsd']['low']:g} / ${M['aovUsd']['high']:g})", low=at(aov=M["aovUsd"]["low"]), base=b0, high=at(aov=M["aovUsd"]["high"])),
        dict(parameter=f"conversion per visit ({M['conversion']['low']:.1%} / {M['conversion']['high']:.1%})", low=at(conv=M["conversion"]["low"]), base=b0, high=at(conv=M["conversion"]["high"])),
        dict(parameter=f"average usage of allowances ({M['usage']['low']:.0%} / {M['usage']['high']:.0%})", low=at(usage=M["usage"]["low"]), base=b0, high=at(usage=M["usage"]["high"])),
        dict(parameter=f"yearly payers ({M['yearlyShare']['low']:.0%} / {M['yearlyShare']['high']:.0%})", low=at(yearly=M["yearlyShare"]["low"]), base=b0, high=at(yearly=M["yearlyShare"]["high"])),
        dict(parameter="churn (low / high)", low=at(churn=tuple(M["churn"]["low"])), base=b0, high=at(churn=tuple(M["churn"]["high"]))),
        dict(parameter=f"emails per order ({M['emailsPerOrder']['low']:g} / {M['emailsPerOrder']['high']:g})", low=at(epo=M["emailsPerOrder"]["low"]), base=b0, high=at(epo=M["emailsPerOrder"]["high"])),
        dict(parameter="horizon (12 / 36 months)", low=at(horizon=12), base=b0, high=at(horizon=36)),
        dict(parameter="population (Gumroad sellers / Linktree full-time)", low=at(weights=np.array(POPS["gumroad-sellers"]["weights"])), base=b0, high=at(weights=np.array(POPS["linktree-fulltime"]["weights"]))),
    ]

    # Implied own-price elasticity of each plan of the recommendation: its subscribers when its own price is 1% higher.
    elast = []
    for j in rec["plans"]:
        by = {}
        for sid, p in sc_params.items():
            def subs_of(bump):
                cost, prof, ok = ours(j, p, rec["packs"])
                inc = comp_inclusive(p)
                V = [np.where(ok, p["asc"] - p["eta"] * np.log(cost * bump + p["hassle"]), -np.inf)]
                for o in rec["plans"]:
                    if o != j:
                        c2, _, ok2 = ours(o, p, rec["packs"])
                        V.append(np.where(ok2, p["asc"] - p["eta"] * np.log(c2 + p["hassle"]), -np.inf))
                V = np.array(V)
                m = np.maximum(V.max(axis=0), inc)
                P = np.exp(V[0] - m) / (np.exp(V - m).sum(axis=0) + np.exp(inc - m))
                return float(np.sum(p["weights"] * P))
            q0, q1 = subs_of(1.0), subs_of(1.01)
            by[sid] = round((q1 - q0) / q0 / 0.01, 4) if q0 > 0 else None
        elast.append(dict(plan=CANDS[j]["id"], byScenario=by))

    # The linear program: if the room above a plan's floor were spent on printed figures, the allocation that maximizes the share of competitors' printed lines matched.
    lp_out = []
    for j in rec["plans"]:
        c = CANDS[j]
        if c["template"] not in ("creator", "pro", "scale"):
            continue
        lines = next(x for x in D["lp"] if x["tier"] == c["base"])["lines"]
        room_m = c["lpRoomCents"]["month"]
        room_y = c["lpRoomCents"]["year"]
        room = min(room_m, room_y / 12)
        use = [l for l in lines if l["figure"] > 0 and l["printShare"] > 0]
        if room <= 0 or not use:
            lp_out.append(dict(plan=c["id"], roomCents=round(room, 2), raised=[], status="no room above the floor with the spend floor's room"))
            continue
        cvec = np.array([-l["printShare"] / l["figure"] for l in use])
        A = np.array([[l["unitMonthCents"] for l in use]])
        res = linprog(cvec, A_ub=A, b_ub=[room], bounds=[(0, l["figure"]) for l in use], method="highs")
        raised = [dict(line=l["id"], **{"from": l["figure"], "to": l["figure"] + float(x)}) for l, x in zip(use, res.x) if x > 1e-9]
        lp_out.append(dict(plan=c["id"], roomCents=round(room, 2), raised=raised, status=str(res.message)))

    def rnd(o, k=6):
        return {a: (round(b, k) if isinstance(b, float) else b) for a, b in o.items()} if o else None

    def out_design(r):
        co = r["company"]
        return dict(id=r["id"], label=label_of(r["plans"], r["packs"]),
                    plans=[CANDS[j]["id"] for j in r["plans"]], packs=r["packs"], origin=r["origin"], names=r["names"], admissible=r["admissible"],
                    profitByScenario={k: round(v, 2) for k, v in r["profit"].items()}, meanProfit=round(r["meanProfit"], 2),
                    worstRegret=round(r["worstRegret"], 6), meanRegret=round(r["meanRegret"], 6), commissionShare=round(r["commShare"], 6),
                    subscribersPer1000=round(r["subs"], 4), baseProfit=round(r["baseProfit"], 2),
                    monteCarlo={k: round(v, 4) for k, v in mc[r["key"]].items()} if r["key"] in mc else None,
                    horizon={k: round(v, 2) for k, v in r["horizon"].items()},
                    revenueBySales=[None if x is None else round(x, 4) for x in r["revenueBySales"]],
                    company=dict(screen=rnd(co.get("screen")), final=rnd(co.get("final")), gate=rnd(co.get("gate")), worst=rnd(co.get("worst"))))

    pareto = []
    for admissible_only in (False, True):
        for k in range(1, 6):
            group = [r for r in results if len(r["plans"]) == k and (r["admissible"] or not admissible_only)]
            if not group:
                continue
            best = min(group, key=lambda r: (round(r["worstRegret"], 9), -r["meanProfit"]))
            pareto.append(dict(k=k, admissibleOnly=admissible_only, design=best["id"], meanProfit=round(best["meanProfit"], 2), worstRegret=round(best["worstRegret"], 6)))

    # The designs written out: every design drawn again, the named ones, the programs' and the plan-count table's, and the 15 of least regret.
    milp_ids = {"|".join(sorted(m["plans"], key=lambda i: CID[i])) for m in milp_runs}
    shown = set(final_keys)
    for r in sorted(results, key=lambda r: (round(r["worstRegret"], 9), -r["meanProfit"]))[:15]:
        shown.add(r["key"])
    for r in results:
        if r["names"] or r["id"] in {x["design"] for x in pareto} or "|".join(CANDS[j]["id"] for j in r["plans"]) in milp_ids:
            shown.add(r["key"])
    designs_out = [out_design(r) for r in sorted(results, key=lambda r: (round(r["worstRegret"], 9), -r["meanProfit"])) if r["key"] in shown]
    hyp = []
    for name, (plans, pk) in named.items():
        r = by_key[(tuple(sorted(plans)), pk)]
        hyp.append(dict(design=r["id"], label=name, meanProfit=round(r["meanProfit"], 2), worstRegret=round(r["worstRegret"], 6),
                        commissionShare=round(r["commShare"], 6), subscribersPer1000=round(r["subs"], 4)))
    screened = dict(designs=len(results), draws=CO["draws"], finalDesigns=len(finals), finalDraws=CO["finalDraws"],
                    grid=dict(starts=len(starts), stores=len(by_tpl("creator")), growths=len(growths), studios=len(by_tpl("pro")), scales=len(by_tpl("scale"))),
                    ruleBFeasible=b_feasible,
                    leastReachNeeded=min((r["company"]["worst"]["reachNeeded"] for r in results if r["company"]["worst"]["reachNeeded"] is not None and kept(r) and stan_proof(r)), default=None),
                    leastReachNeededDesign=min((r for r in results if r["company"]["worst"]["reachNeeded"] is not None and kept(r) and stan_proof(r)), key=lambda r: r["company"]["worst"]["reachNeeded"])["id"])
    out = dict(
        solver=f"scipy {scipy.__version__} (milp and linprog, HiGHS); numpy {np.__version__}",
        scenarios=scenarios, milp=milp_runs, designs=designs_out,
        recommended=rec["id"], bestWithoutCommission=no_comm["id"], nextFrontier=nxt["id"] if nxt else None, regretBest=regret_best["id"],
        choice=choice, frontier=[r["id"] for r in fr], screened=screened, companyCheck=check,
        paretoByCount=pareto, hypothesis=hyp, elasticity=elast,
        sensitivity=[{k: (round(v, 2) if isinstance(v, float) else v) for k, v in s.items()} for s in sens], lp=lp_out,
        monteCarloDraws=M["monteCarloDraws"],
    )
    OUTPUT.write_text(json.dumps(out, indent=1) + "\n")
    print(f"Wrote {OUTPUT}: {len(designs_out)} designs, recommended {out['recommended']}")


if __name__ == "__main__":
    main()
