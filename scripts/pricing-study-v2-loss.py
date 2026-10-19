"""The loss stress test of the pricing study v2, with demand (an ANALYSIS:
nothing in force changes; every figure is a MODEL, not a measurement).

    python3 scripts/pricing-study-v2-loss.py --shard i --of n --out FILE
    python3 scripts/pricing-study-v2-loss.py --merge DIR      # joins the shards, writes the .json and .md

What it reads, and from whom:

  - docs/pricing-study-v2-loss-input-2026-10-18.json, written by
    tests/pricing-study-v2-loss-table.ts lossInput() from the repository's own
    margin code: each plan's cash per payment at every usage level under the
    sizing and the gate reading (receivingOf, taxOf), its printed figures,
    the free pool (lib/free-pool-rules.ts, nonPayingWorst) and the designs;
  - the main study's demand model, imported unchanged from
    scripts/pricing-study-v2.py (and its input): its populations, its draw of
    every demand parameter (draw_params: population, price sensitivity,
    preference, AOV, conversion, emails per order, churn range, reach of
    creators choosing a platform, ramp, fixed costs), its multinomial logit
    against the competitors (comp_inclusive, ours: all-in cost with packs
    where a plan's figures are too small), and its churn
    floor + (cap - floor) * cost / (cost + sales).

So arrivals and the plan mix react to price and figures: a cheaper or richer
design brings more payers. On top of the demand model, the company's month
by month bookkeeping over 24 months adds what the demand model does not have:
yearly payers and their renewals, first-payment refunds, pro-rata yearly
refunds, disputes, unpaid renewals, the free pool used up to its caps, and
the fixed costs from month 1. Each payer's profit tax is taken on its own
payment and never offset (conservative). The commission is counted as zero
in the main figures (owner's rule; COMMISSION_LIVE is off) and reported
apart.

Seeds: draw k's demand parameters come from default_rng([SEED, k, 0]) and its
own extras from default_rng([SEED, k, 1]); the events of a block of BLOCK
draws, for one design, from default_rng([SEED, block, design hash]). A shard
is a range of whole blocks, so any shard count gives the same numbers, and
every design and both readings see the same parameters and events (common
random numbers).
"""
import argparse
import hashlib
import importlib.util
import json
import math
import pathlib
import sys
import time

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOSS_INPUT = ROOT / "docs/pricing-study-v2-loss-input-2026-10-18.json"
OUT_JSON = ROOT / "docs/pricing-study-v2-loss-2026-10-18.json"
OUT_MD = ROOT / "docs/pricing-study-v2-loss-2026-10-18.md"

# The main study's demand model, from this repository or (--demand-root DIR) from a pinned copy of it: DIR/scripts/pricing-study-v2.py
# with DIR/docs/pricing-study-v2-input-2026-10-18.json beside it, so a run never mixes a program with an input it was not written for.
DEMAND_ROOT = pathlib.Path(sys.argv[sys.argv.index("--demand-root") + 1]).resolve() if "--demand-root" in sys.argv else ROOT
spec = importlib.util.spec_from_file_location("study", DEMAND_ROOT / "scripts/pricing-study-v2.py")
S = importlib.util.module_from_spec(spec)
spec.loader.exec_module(S)

LI = json.loads(LOSS_INPUT.read_text())
DRAWS = 20_000
BLOCK = 100
SEED = 20_261_018_8
T = 24
G = S.G
NB = S.NB
GRID = np.array(LI["usageGrid"])
READINGS = LI["readings"]
FREE = LI["freePool"]

# Every plan of every design, added to the main study's candidates in memory (its files are not changed) with the
# fields its demand functions read: printed figures, price, commission. Its own net is left at zero there: the cash
# comes from this program's input (the repository's margin code), and only the packs' and the commission's parts of
# the main study's profit are used.
PLAN = {}
for p in LI["plans"]:
    j = len(S.CANDS)
    S.CANDS.append(dict(id=p["key"], template=p["template"], title=p["title"], figures=p["figures"], monthCents=p["demandMonthCents"], commissionBps=p["commissionBps"],
                        headroomMonthCents=0, gateHeadroomMonthCents=0, **{name: {f"u{k}": 0 for k in S.USAGE_KEYS} for name in ("netMonthCents", "netYearMonthCents", "gateNetMonthCents", "gateNetYearMonthCents")}))
    pc = p["perCustomer"]
    def hr(row):
        if "month" in row:
            return min(row["month"]["headroomCents"], math.floor(row["year"]["headroomCents"] / 12))
        return math.floor(row["year"]["headroomCents"] / 12)
    PLAN[p["key"]] = dict(j=j, headroom=dict(sizing=hr(pc["sizing"]), **{r: hr(pc["gate"]) for r in LI["readings"] if r != "sizing"}), **p)
FIELDS = ["payMonth", "payYear", "useMonth", "refundMonth", "refundYear", "disputeMonth", "disputeYear"]
ECON = {r: {k: np.array([[lv[k] for lv in PLAN[key]["econ"][r]["levels"]] for key in PLAN], dtype=np.float64) for k in FIELDS} for r in READINGS}
SPEC_INDEX = {key: i for i, key in enumerate(PLAN)}
MONTH_REV = np.array([PLAN[key]["econ"]["sizing"]["monthRevenue"] for key in PLAN], dtype=np.float64)
MONTH_REV_R = {r: np.array([PLAN[key]["econ"][r]["monthRevenue"] for key in PLAN], dtype=np.float64) for r in READINGS}
YEAR_MONTHS = np.array([PLAN[key]["yearMonths"] for key in PLAN], dtype=np.float64)
YEAR_ONLY = np.array([bool(PLAN[key]["yearOnly"]) for key in PLAN])
DESIGNS = LI["designs"]
BASE_PACKS = {k: dict(v) for k, v in S.PACKS.items()}

# Two demand variants on the same draws: the main study's ranges as they are, and mm-demand's evidence-based ranges
# (docs/research/demand-evidence-v2-2026-10-18.json, sections reach, reachGrowth, ascNewEntrant): reach 30 / 300 /
# 10,000 creators a month (log scale), a linear ramp of 12 / 30 / 60 months, a new brand's preference -1.5 / -0.7 / 0,
# each drawn as a triangular distribution through its low, central and high values (reach in logs). Every series
# behind them is a selected sample, so even the central values likely sit above a new tool's.
# The main study's stresses on its own ranges (coordinator, 18 October 2026): every plan above M["stress"]["aboveCents"]
# a month with no demand ("zero"), or half its logit weight ("half").
VARIANTS = ["lead", "lead-zero499", "lead-half499", "evidence"]
EVIDENCE = dict(reach=(30, 300, 10_000), rampMonths=(12, 30, 60), asc=(-1.5, -0.7, 0.0), source="docs/research/demand-evidence-v2-2026-10-18.json")

# mm-demand's evidence-based ranges (low, central, high) for the events, used by the "evidence" variant as triangular
# distributions (docs/research/demand-evidence-v2-2026-10-18.json: yearlyShare, yearlyRenewal, refundRate,
# involuntaryChurn, disputes). An unpaid renewal is a failed payment that is not recovered.
EVIDENCE_EVENTS = dict(yearlyShare=(0.10, 0.25, 0.45), yearlyRenewal=(0.25, 0.45, 0.65), refundMonthly=(0.02, 0.035, 0.06), refundYearly=(0.03, 0.045, 0.08),
                       dispute=(0.003, 0.006, 0.012), failedPerRenewal=(0.005, 0.01, 0.02), recovered=(0.30, 0.40, 0.55))

A = dict(
    yearlyShare="the main study's draw (its yearlyShare range)", refundFirst=(0.0, 0.10), refundYearProRata=(0.0, 0.05), dispute=(0.001, 0.02), nonPayment=(0.01, 0.08),
    freePoolUse=(0.0, 1.0), usage="uniform over the grid 10%..100%",
)


def design_hash(d):
    return int(hashlib.sha256(d["id"].encode()).hexdigest()[:8], 16)


def pack_table(pack_set):
    """The packs' prices and nets (sizing and gate, both the repository's) for a design's pack set: the main study's unless the design names others."""
    out = {k: dict(v) for k, v in BASE_PACKS.items()}
    for pk in pack_set or []:
        out[pk["id"]] = dict(out.get(pk["id"], {}), **pk)
    for v in out.values():
        if "gateNetCents" not in v:
            raise SystemExit(f"pack {v['id']}: no net under the gate reading")
    return out


def extras(k):
    r = np.random.default_rng([SEED, k, 1])
    x = dict(yearly=None, refund=r.uniform(*A["refundFirst"]), refundYear=r.uniform(*A["refundYearProRata"]),
             dispute=r.uniform(*A["dispute"]), nonPay=r.uniform(*A["nonPayment"]), freeUse=r.uniform(*A["freePoolUse"]), usage=int(r.integers(len(GRID))))
    e = np.random.default_rng([SEED, k, 3])
    tri = lambda t: float(e.triangular(*t))
    E = EVIDENCE_EVENTS
    x.update(evYearly=tri(E["yearlyShare"]), evRenewYear=tri(E["yearlyRenewal"]), evRefund=tri(E["refundMonthly"]), evRefundY=tri(E["refundYearly"]),
             evDispute=tri(E["dispute"]), evNonPay=tri(E["failedPerRenewal"]) * (1 - tri(E["recovered"])))
    return x


def demand_tables(k):
    """Draw k: the main study's demand parameters, and for every design (and reading, for the packs' nets) the arrival rate a month at full
    ramp, the monthly churn, the packs' net and the commission kept per subscriber-month, in each (plan, sales bin) cell."""
    p, reach, ramp, fixed, _U = S.draw_params(np.random.default_rng([SEED, k, 0]))
    ev = np.random.default_rng([SEED, k, 2])
    lr = np.log(EVIDENCE["reach"])
    variant = dict(lead=dict(reach=reach, ramp=ramp, asc=p["asc"]),
                   evidence=dict(reach=float(np.exp(ev.triangular(lr[0], lr[1], lr[2]))), ramp=float(ev.triangular(*EVIDENCE["rampMonths"])), asc=float(ev.triangular(*EVIDENCE["asc"]))))
    S._ours_cache.clear(); S._head_cache.clear(); S._comp_cache.clear()
    inc = S.comp_inclusive(p)
    cf, cc = p["churn"]
    out = {}
    for r in READINGS:
        # The main study's own switch: its packs' nets and its commission kept are taken under this reading.
        S.READING[0] = "sizing" if r == "sizing" else "gate"
        groups = {}
        for d in DESIGNS:
            groups.setdefault(json.dumps(d["packSet"]), []).append(d)
        for key, ds in groups.items():
            S.PACKS.clear(); S.PACKS.update(pack_table(json.loads(key)))
            S._ours_cache.clear(); S._head_cache.clear()
            for d in ds:
                V, PN, CM, C, H = [], [], [], [], []
                above = []
                for pk in d["plans"]:
                    c = PLAN[pk]
                    cost, prof, ok = S.ours(c["j"], p, d["packs"])
                    # What one subscriber leaves above 60% a month at full use: the plan's own (the repository's, under this
                    # reading) and the room of the packs it buys there (the main study's headroom(), the plan's part set to zero).
                    H.append(S.headroom(c["j"], p, d["packs"]) * 100 + c["headroom"][r])
                    above.append(c["demandMonthCents"] > S.M["stress"]["aboveCents"])
                    comm = S.keep() * c["commissionBps"] / 10_000 * G
                    V.append(np.where(ok, -p["eta"] * np.log(cost + p["hassle"]), -np.inf))
                    PN.append(prof - comm)          # the packs' own net (the plan's own net is set to zero above)
                    CM.append(comm)
                    C.append(cf + (cc - cf) * cost / (cost + G + 1e-9))
                V0 = np.array(V)
                above = np.array(above)[:, None]
                for vid in VARIANTS:
                    vv = variant["evidence" if vid == "evidence" else "lead"]
                    V = V0 + vv["asc"]
                    if vid == "lead-zero499":
                        V = np.where(above, -np.inf, V)
                    elif vid == "lead-half499":
                        V = np.where(above, V - math.log(2), V)
                    m = np.maximum(V.max(axis=0), inc)
                    E = np.exp(V - m)
                    P = E / (E.sum(axis=0) + np.exp(inc - m))
                    lam = vv["reach"] * p["weights"] * P        # creators a month, at full ramp, by plan and bin
                    out[(d["id"], r, vid)] = dict(lam=lam.ravel(), churn=np.array(C).ravel(), packs=np.array(PN).ravel() * 100, comm=np.array(CM).ravel() * 100, room=np.array(H).ravel())
    S.PACKS.clear(); S.PACKS.update(BASE_PACKS); S.READING[0] = "sizing"
    x = extras(k)
    x["yearly"] = p["yearly"]      # the main study's own share of yearly payers, drawn with its demand
    return dict(pop=p["pop"], eta=p["eta"], asc=p["asc"], reach=reach, ramp=ramp, ascEvidence=variant["evidence"]["asc"], reachEvidence=variant["evidence"]["reach"], rampEvidence=variant["evidence"]["ramp"],
                fixedCents=fixed * 100, tables=out, **x)


def simulate_block(d, r, v, rows, block):
    """One block of draws, one design, one reading: 24 months of cash and accrual, in cents."""
    rng = np.random.default_rng([SEED, block, design_hash(d)])
    Db = len(rows)
    plans = d["plans"]
    spec_of_cell = np.repeat([SPEC_INDEX[k] for k in plans], NB)
    K = len(spec_of_cell)
    U = np.array([x["usage"] for x in rows])
    E = {f: ECON[r][f][spec_of_cell[None, :], U[:, None]] for f in FIELDS}
    monthRev = MONTH_REV_R[r][spec_of_cell][None, :]
    ym = YEAR_MONTHS[spec_of_cell][None, :]
    tab = [x["tables"][(d["id"], r, v)] for x in rows]
    lam = np.array([t["lam"] for t in tab]); C = np.clip(np.array([t["churn"] for t in tab]), 0, 1)
    PK = np.array([t["packs"] for t in tab]); CM = np.array([t["comm"] for t in tab]); RM = np.array([t["room"] for t in tab])
    col = lambda key: np.array([x[key] for x in rows])[:, None]
    refundYear, freeUse = col("refundYear"), col("freeUse")
    fixed = col("fixedCents")[:, 0]
    if v.startswith("lead"):
        yearly, refund, refundY, dispute, nonPay = col("yearly"), col("refund"), col("refund"), col("dispute"), col("nonPay")
        ramp = col("ramp")[:, 0]
        renewY = (1 - C) ** 12
    else:
        yearly, refund, refundY, dispute, nonPay = col("evYearly"), col("evRefund"), col("evRefundY"), col("evDispute"), col("evNonPay")
        ramp = col("rampEvidence")[:, 0]
        renewY = np.broadcast_to(col("evRenewYear"), C.shape)
    # A plan sold by the year only takes every one of its payers on the yearly payment.
    yearly = np.where(YEAR_ONLY[spec_of_cell][None, :], 1.0, yearly)
    M = np.zeros((Db, K), dtype=np.int64)
    Y = np.zeros((Db, K, 12), dtype=np.int64)
    ring = np.zeros((Db, T + 12))
    cash = np.zeros((Db, T)); acc = np.zeros((Db, T)); comm = np.zeros((Db, T)); payers = np.zeros((Db, T))
    ages = np.arange(1, 12)[None, None, :]
    for t in range(T):
        f = np.zeros((Db, K))      # cash by cell this month, yearly payments excluded from the accrual
        fy = np.zeros((Db, K))     # yearly payments charged this month
        # Monthly payers renew: they leave at their churn; a renewal is unpaid (one month of use in the grace) or disputed or paid.
        stay = rng.binomial(M, 1 - C)
        unpaid = rng.binomial(stay, nonPay)
        paid = stay - unpaid
        disp = rng.binomial(paid, dispute)
        f += -unpaid * E["useMonth"] + disp * E["disputeMonth"] + (paid - disp) * E["payMonth"]
        M = paid - disp
        # Yearly payers grow a month older; mid-year, some ask for the months not started back (months used kept at the monthly price).
        renewing = Y[:, :, 11].copy()
        Y[:, :, 1:] = Y[:, :, :-1]; Y[:, :, 0] = 0
        back = rng.binomial(Y[:, :, 1:], (refundYear / 11)[:, :, None])
        f += -(back * np.maximum(0, ym[:, :, None] - ages) * monthRev[:, :, None]).sum(2)
        Y[:, :, 1:] -= back
        f += -Y[:, :, 1:].sum(2) * E["useMonth"]
        n = rng.binomial(renewing, renewY)
        u2 = rng.binomial(n, nonPay); f += -u2 * E["useMonth"]; n -= u2
        d2 = rng.binomial(n, dispute); f += d2 * E["disputeYear"]; n -= d2
        fy += n * E["payYear"]; f += -n * E["useMonth"]
        Y[:, :, 0] = n
        # New payers: the demand model's rate at this month of the ramp.
        N = rng.poisson(lam * np.minimum(1.0, (t + 1) / ramp)[:, None])
        ny = rng.binomial(N, yearly); nm = N - ny
        rm = rng.binomial(nm, refund); nm -= rm
        dm = rng.binomial(nm, dispute); nm -= dm
        f += rm * E["refundMonth"] + dm * E["disputeMonth"] + nm * E["payMonth"]
        M += nm
        ry = rng.binomial(ny, refundY); ny -= ry
        dy = rng.binomial(ny, dispute); ny -= dy
        f += ry * E["refundYear"] + dy * E["disputeYear"] - ny * E["useMonth"]
        fy += ny * E["payYear"]
        Y[:, :, 0] += ny
        active = M + Y.sum(2)
        f += active * PK
        base = active.sum(1)
        # The pool's ten base places are in the main study's fixed costs (at their worst, every month); the places the paying base adds are here.
        company = -np.ceil(freeUse[:, 0] * np.floor(base / FREE["paidPerFree"]) * FREE["worstCents"]) - fixed
        cash[:, t] = f.sum(1) + fy.sum(1) + company
        for kk in range(12):
            ring[:, t + kk] += fy.sum(1) / 12
        acc[:, t] = f.sum(1) + company + ring[:, t]
        comm[:, t] = (active * CM).sum(1)
        payers[:, t] = base
    # At month 24: does the paying customers' room above 60% (full use, commission zero) cover the month's fixed costs? (The main study's
    # "60% consolidated".)
    consolidated = (active * RM).sum(1) >= fixed
    return cash, acc, comm, payers, consolidated


def run_shard(i, n, out_path):
    blocks = DRAWS // BLOCK
    mine = [b for b in range(blocks) if b % n == i]
    t0 = time.time()
    res = {f"{d['id']}|{r}|{v}": {k: [] for k in ("draw", "cum6", "cum12", "cum24", "cum24Comm", "m6", "m12", "m24", "a6", "a12", "a24", "minMonth", "late", "lateAcc", "payers24", "minAcc", "trough", "troughMonth", "below60")} for d in DESIGNS for r in READINGS for v in VARIANTS}
    meta = {k: [] for k in ("draw", "pop", "eta", "asc", "reach", "ramp", "ascEvidence", "reachEvidence", "rampEvidence", "fixedCents", "yearly", "refund", "refundYear", "dispute", "nonPay", "freeUse", "usage",
                                "evYearly", "evRenewYear", "evRefund", "evRefundY", "evDispute", "evNonPay")}
    for b in mine:
        rows = [demand_tables(k) for k in range(b * BLOCK, (b + 1) * BLOCK)]
        for k, x in zip(range(b * BLOCK, (b + 1) * BLOCK), rows):
            meta["draw"].append(k)
            for key in list(meta)[1:]:
                v = x[key]
                meta[key].append(v if isinstance(v, str) else round(float(v), 6))
        for d in DESIGNS:
            for r in READINGS:
              for v in VARIANTS:
                cash, acc, comm, payers, consolidated = simulate_block(d, r, v, rows, b)
                cum = cash.cumsum(1)
                o = res[f"{d['id']}|{r}|{v}"]
                o["draw"] += list(range(b * BLOCK, (b + 1) * BLOCK))
                for name, arr in (("cum6", cum[:, 5]), ("cum12", cum[:, 11]), ("cum24", cum[:, 23]), ("cum24Comm", cum[:, 23] + comm.sum(1)),
                                  ("m6", cash[:, 5]), ("m12", cash[:, 11]), ("m24", cash[:, 23]), ("a6", acc[:, 5]), ("a12", acc[:, 11]), ("a24", acc[:, 23]),
                                  ("minMonth", cash.min(1)), ("minAcc", acc.min(1))):
                    o[name] += [int(round(v / 100)) for v in arr]      # dollars
                o["late"] += [int(v) for v in (cash[:, 12:] < 0).any(1)]
                o["lateAcc"] += [int(v) for v in (acc[:, 12:] < 0).any(1)]
                o["payers24"] += [int(v) for v in payers[:, 23]]
                low = np.minimum(cum.min(1), 0.0)
                o["trough"] += [int(round(v / 100)) for v in low]
                o["troughMonth"] += [int(m) + 1 if lv < 0 else 0 for m, lv in zip(cum.argmin(1), low)]
                o["below60"] += [int(not c) for c in consolidated]
        print(f"block {b} done, {time.time() - t0:.0f}s", flush=True, file=sys.stderr)
    pathlib.Path(out_path).write_text(json.dumps(dict(shard=i, of=n, blocks=mine, seed=SEED, draws=DRAWS, block=BLOCK, meta=meta, results=res)))


# ------------------------------------------------------------- merge

def wilson(k, n):
    z = 1.959964
    if not n:
        return [0.0, 0.0]
    p = k / n
    den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [max(0.0, c - h), min(1.0, c + h)]


def summarize(R, n, reach, pops, meta):
    pr = lambda mask: dict(p=float(mask.mean()), ci95=wilson(int(mask.sum()), n))
    q = lambda x, a: float(np.percentile(x, a))
    bands = [30, 100, 300, 1000, 3000, 10000.0001]
    out = dict(
        draws=n,
        expectedProfit24=float(R["cum24"].mean()), expectedProfit24WithCommission=float(R["cum24Comm"].mean()),
        probCumulativeLoss={str(m): pr(R[f"cum{m}"] < 0) for m in (6, 12, 24)},
        probCumulativeLossWithCommission24=pr(R["cum24Comm"] < 0),
        probMonthLoss=dict(cash={str(m): pr(R[f"m{m}"] < 0) for m in (6, 12, 24)}, accrual={str(m): pr(R[f"a{m}"] < 0) for m in (6, 12, 24)},
                           anyMonth13to24Cash=pr(R["late"] > 0), anyMonth13to24Accrual=pr(R["lateAcc"] > 0)),
        cumulative24=dict(min=float(R["cum24"].min()), p1=q(R["cum24"], 1), p5=q(R["cum24"], 5), p50=q(R["cum24"], 50), p95=q(R["cum24"], 95)),
        cumulative12=dict(p1=q(R["cum12"], 1), p5=q(R["cum12"], 5), p50=q(R["cum12"], 50)),
        cumulative6=dict(p1=q(R["cum6"], 1), p5=q(R["cum6"], 5), p50=q(R["cum6"], 50)),
        worstMonth=dict(p1Cash=q(R["minMonth"], 1), p1Accrual=q(R["minAcc"], 1)),
        payers24=dict(mean=float(R["payers24"].mean()), p5=q(R["payers24"], 5), p50=q(R["payers24"], 50), p95=q(R["payers24"], 95)),
        probBelow60Consolidated24=pr(R["below60"] > 0),
        probEitherLoss24=pr((R["cum24"] < 0) | (R["below60"] > 0)),
        trough=dict(probBelowZero=pr(R["trough"] < 0), p1=q(R["trough"], 1), p5=q(R["trough"], 5), p50=q(R["trough"], 50),
                    medianMonthWhenBelow=float(np.median(R["troughMonth"][R["trough"] < 0])) if (R["trough"] < 0).any() else None),
        byReach=[], byPopulation={},
    )
    for lo, hi in zip(bands, bands[1:]):
        sel = (reach >= lo) & (reach < hi)
        out["byReach"].append(dict(fromReach=lo, toReach=round(hi), draws=int(sel.sum()),
                                   probCumulativeLoss24=float((R["cum24"][sel] < 0).mean()) if sel.any() else None,
                                   expectedProfit24=float(R["cum24"][sel].mean()) if sel.any() else None))
    for pop in sorted(set(pops)):
        sel = pops == pop
        out["byPopulation"][pop] = dict(draws=int(sel.sum()), probCumulativeLoss24=float((R["cum24"][sel] < 0).mean()), expectedProfit24=float(R["cum24"][sel].mean()))
    loss = R["cum24"] < 0
    drivers = []
    for name, x in meta.items():
        o = np.argsort(x, kind="stable")
        f = n // 5
        lo_, hi_ = float(loss[o[:f]].mean()), float(loss[o[-f:]].mean())
        drivers.append(dict(input=name, lossBottomFifth=lo_, lossTopFifth=hi_, spread=hi_ - lo_))
    out["drivers"] = sorted(drivers, key=lambda x: -abs(x["spread"]))
    return out


def merge(directory):
    shards = [json.loads(f.read_text()) for f in sorted(pathlib.Path(directory).glob("*.json"))]
    draws = shards[0]["draws"]
    covered = sorted(b for s in shards for b in s["blocks"])
    assert covered == list(range(draws // BLOCK)), f"blocks missing or doubled: {len(covered)} of {draws // BLOCK}"
    meta = {k: sum((s["meta"][k] for s in shards), []) for k in shards[0]["meta"]}
    order = np.argsort(meta["draw"])
    meta = {k: [v[i] for i in order] for k, v in meta.items()}
    pops = np.array(meta["pop"])
    common = ("eta", "fixedCents", "refundYear", "freeUse", "usage")
    lead_meta = dict(reach="reach", ramp="ramp", asc="asc", yearly="yearly", refund="refund", dispute="dispute", nonPay="nonPay")
    variant_meta = {"lead-zero499": lead_meta, "lead-half499": lead_meta}
    variant_meta |= dict(lead=dict(reach="reach", ramp="ramp", asc="asc", yearly="yearly", refund="refund", dispute="dispute", nonPay="nonPay"),
                        evidence=dict(reach="reachEvidence", ramp="rampEvidence", asc="ascEvidence", yearly="evYearly", refund="evRefund", dispute="evDispute", nonPay="evNonPay", renewYear="evRenewYear"))
    stats = {}
    for key in shards[0]["results"]:
        idx = np.argsort(sum((s["results"][key]["draw"] for s in shards), []))
        R = {k: np.array(sum((s["results"][key][k] for s in shards), []))[idx] for k in shards[0]["results"][key] if k != "draw"}
        v = key.split("|")[2]
        vm = variant_meta[v]
        drv = {name: np.array(meta[col], dtype=float) for name, col in vm.items()}
        drv.update({name: np.array(meta[name], dtype=float) for name in common})
        stats[key] = summarize(R, len(R["cum24"]), np.array(meta[vm["reach"]], dtype=float), pops, drv)
    designs = []
    for d in DESIGNS:
        designs.append(dict(d, perCustomer=[PLAN[k]["perCustomer"] for k in d["plans"]],
                            minimumBase={kind: max_none([PLAN[k]["base"][kind] for k in d["plans"]]) for kind in ("named", "withUnreviewed")},
                            results={r: {v: stats[f"{d['id']}|{r}|{v}"] for v in VARIANTS} for r in READINGS}))
    for r in READINGS:
        for v in VARIANTS:
            pool = sorted(designs, key=lambda x: (x["results"][r][v]["probCumulativeLoss"]["24"]["p"], -x["results"][r][v]["expectedProfit24"], x["id"]))
            best = -math.inf
            for x in pool:
                on = x["results"][r][v]["expectedProfit24"] > best + 1e-9
                x["results"][r][v]["onFrontier"] = on
                if on:
                    best = x["results"][r][v]["expectedProfit24"]
    out = dict(
        label="MODEL, not a measurement: Marktmorgen has never been on sale. Per-customer cash is the repository's own margin code (tests/pricing-study-v2-loss-table.ts lossInput); arrivals and plan mix are the main study's demand model (scripts/pricing-study-v2.py), imported unchanged; the company's 24 months are this program's seeded bookkeeping.",
        version=2, seed=SEED, draws=draws, block=BLOCK, months=T, variants=VARIANTS, evidenceVariant=EVIDENCE,
        demandModel=dict(source="scripts/pricing-study-v2.py draw_params, comp_inclusive, ours; churn floor + (cap - floor) * cost / (cost + sales)", company=S.CO,
                         model={k: S.M[k] for k in ("eta", "asc", "aovUsd", "conversion", "emailsPerOrder", "churn", "hassleUsd", "paymentsAsc")}),
        companyAssumptions=A, freePool=FREE, namedFixedMonthlyCents=LI["namedFixedMonthlyCents"], readings=READINGS,
        code=["tests/pricing-study-v2-loss-table.ts", "scripts/pricing-study-v2-loss.mjs", "scripts/pricing-study-v2-loss.py"],
        inputs=["docs/pricing-study-v2-loss-input-2026-10-18.json", "docs/pricing-study-v2-loss-designs-2026-10-18.json", "docs/pricing-study-v2-input-2026-10-18.json (the main study's)"],
        designs=designs,
    )
    OUT_JSON.write_text(json.dumps(out, indent=1) + "\n")
    OUT_MD.write_text(render(out))
    print(f"wrote {OUT_JSON} and {OUT_MD}")


def max_none(xs):
    return None if any(x is None for x in xs) else max(xs)


def render(out):
    L = []
    P = lambda x: "—" if x is None else f"{x * 100:.1f}%"
    D = lambda x: "—" if x is None else f"{'−' if x < 0 else ''}${abs(round(x)):,}"
    C = lambda c: "—" if c is None else f"${c / 100:,.2f}".replace(".00", "")
    VN = {"lead-zero499": "the main study's demand ranges, stress: no demand for any plan above $499 a month",
          "lead-half499": "the main study's demand ranges, stress: half the demand for any plan above $499 a month"}
    VN |= dict(lead="the main study's demand ranges (central population gumroad-sellers, as the lead's model draws it)", evidence="mm-demand's evidence-based ranges (reach 30/300/10,000, ramp 12/30/60 months, preference −1.5/−0.7/0)")
    gate = [r for r in out["readings"] if r != "sizing"][0]
    L += ["# Pricing study v2: the loss stress test with demand, 18 October 2026", "",
          "<!-- Generated by `python3 scripts/pricing-study-v2-loss.py --merge <shards>`; its input by `node scripts/pricing-study-v2-loss.mjs input` (tests/pricing-study-v2-loss-table.ts). -->", "",
          "**Every figure here is a MODEL, not a measurement.** Marktmorgen has never been on sale; nothing in force changes. Per-customer cash is the repository's own margin code (lib/receiving-costs.ts `receivingOf`, `taxOf`, `unitUnder`; the worst month of tests/plan-cost-registry.ts; lib/customer-base-rules.ts). **Arrivals and the plan mix come from the main study's demand model** (scripts/pricing-study-v2.py, imported unchanged: three populations of creators by sales, a multinomial logit against every competitor plan read, price sensitivity, a preference for Marktmorgen, AOV, conversion, a churn that rises with what the plan costs against the creator's sales, reach and ramp), so a cheaper or richer design brings more payers and a dearer one fewer. On top, the company's 24 months add yearly payers and renewals, first-payment and pro-rata refunds, disputes, unpaid renewals, the free pool up to its caps and the fixed costs from month 1.", "",
          f"{out['draws']:,} draws per design, reading and demand variant (seed {out['seed']}); every design, reading and variant sees the same parameters and events (common random numbers). Two demand variants: **{VN['lead']}**, and **{VN['evidence']}** (docs/research/demand-evidence-v2-2026-10-18.json; its series are selected samples, so even its central values likely sit above a new tool's). The commission is counted as zero except in the column that says otherwise; prepaid packs are in (prepaid, each keeps 60% on its own payment); the Store assistant and AI captions are out. Each payer's profit tax is taken on its own payment and never offset by the fixed costs (conservative).", ""]
    for v in out["variants"]:
        L += [f"## The frontier, sizing reading, {VN[v]}", "",
              "Expected profit: the mean cumulative cash after 24 months, after every fee, realized refund and dispute, tax, the free pool and the fixed costs. On the frontier: no other design has both a lower probability of a cumulative loss at month 24 and a higher expected profit.", "",
              "| Design | Expected profit, 24 months | P(cumulative cash < 0) at 6 / 12 / 24 | Cumulative at 24: 1st / 5th percentile | Trough: P(ever below 0), 1st percentile, median month | P(below 60% consolidated at 24) | P(loss in month 24), cash / accrual | Payers at 24, median | Frontier | With commission: expected / P(cash < 0 at 24) |",
              "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
        for d in sorted(out["designs"], key=lambda x: (x["results"]["sizing"][v]["probCumulativeLoss"]["24"]["p"], -x["results"]["sizing"][v]["expectedProfit24"])):
            s = d["results"]["sizing"][v]
            cl, pm = s["probCumulativeLoss"], s["probMonthLoss"]
            tr = s["trough"]
            L.append(f"| **{d['id']}**: {d['label']} | {D(s['expectedProfit24'])} | {P(cl['6']['p'])} / {P(cl['12']['p'])} / {P(cl['24']['p'])} | {D(s['cumulative24']['p1'])} / {D(s['cumulative24']['p5'])} | {P(tr['probBelowZero']['p'])}, {D(tr['p1'])}, {'—' if tr['medianMonthWhenBelow'] is None else int(tr['medianMonthWhenBelow'])} | {P(s['probBelow60Consolidated24']['p'])} | {P(pm['cash']['24']['p'])} / {P(pm['accrual']['24']['p'])} | {s['payers24']['p50']:,.0f} | {'**yes**' if s['onFrontier'] else ''} | {D(s['expectedProfit24WithCommission'])} / {P(s['probCumulativeLossWithCommission24']['p'])} |")
        L.append("")
    L += [f"## Under the gate reading ({gate})", "", "The same draws, every payment's cash under the reading sales are gated on (27% VAT inside, 78.18% on profit, ISS 5%), the packs at their own most-tax nets.", "",
          "| Design | Variant | Expected profit, 24 months | P(cumulative loss) at 6 / 12 / 24 | Cumulative at 24: 1st percentile | Frontier |", "| --- | --- | --- | --- | --- | --- |"]
    for d in out["designs"]:
        for v in out["variants"]:
            s = d["results"][gate][v]
            cl = s["probCumulativeLoss"]
            L.append(f"| {d['id']} | {v} | {D(s['expectedProfit24'])} | {P(cl['6']['p'])} / {P(cl['12']['p'])} / {P(cl['24']['p'])} | {D(s['cumulative24']['p1'])} | {'yes' if s['onFrontier'] else ''} |")
    for v in out["variants"]:
        L += ["", f"## By reach (creators a month choosing a platform), sizing reading, {v}: P(cumulative loss at 24) and expected profit", ""]
        bands = out["designs"][0]["results"]["sizing"][v]["byReach"]
        L.append("| Design | " + " | ".join(f"{b['fromReach']:,}–{b['toReach']:,} ({b['draws']:,} draws)" for b in bands) + " |")
        L.append("| --- | " + " | ".join("---" for _ in bands) + " |")
        for d in out["designs"]:
            L.append(f"| {d['id']} | " + " | ".join(f"{P(b['probCumulativeLoss24'])} ({D(b['expectedProfit24'])})" for b in d["results"]["sizing"][v]["byReach"]) + " |")
    L += ["", "## What drives the loss probability (sizing reading)", "", "The cumulative-loss rate at month 24 in each input's top fifth of draws against its bottom fifth; the four that move it most.", ""]
    for v in out["variants"]:
        for d in out["designs"]:
            dr = d["results"]["sizing"][v]["drivers"][:4]
            L.append(f"- **{d['id']}**, {v}: " + "; ".join(f"{x['input']} {P(x['lossBottomFifth'])} → {P(x['lossTopFifth'])}" for x in dr) + ".")
    L += ["", "## Per customer, at full use of every entitlement in the worst month", "",
          "Net over revenue, the commission counted as zero; the gate reading is `gateReading()`. Lowest price: the lowest monthly price (the year at its own length) at which both intervals keep 60% at full use with the spend floor's room. Minimum base (lib/customer-base-rules.ts, every customer on the design's least plan at full use): for the main study's named fixed costs (the free pool's ten base places included) / with the whole unreviewed allowance as well.", "",
          "| Design | Plan | Month / year | Net, sizing, month / year | Net, gate, month / year | Lowest price for 60%, with room |", "| --- | --- | --- | --- | --- | --- |"]
    for d in out["designs"]:
        for pc in d["perCustomer"]:
            s, g = pc["sizing"], pc["gate"]
            mo = lambda x: f"{x['month']['netBps'] / 100:.2f}%" if "month" in x else "year only"
            L.append(f"| {d['id']} | {pc['key']} | {C(pc['monthCents'])} / {C(pc['yearCents'])} | {mo(s)} / {s['year']['netBps'] / 100:.2f}% | {mo(g)} / {g['year']['netBps'] / 100:.2f}% | {C(pc['lowestMonthCents']['withRoom'])}{'' if pc['keepsWithRoom'] else ' (MISSES 60% at its price)'} |")
        b = d["minimumBase"]
        L.append(f"| {d['id']} | **minimum base** | | {b['named']} / {b['withUnreviewed']} paying customers | no price keeps 60% under the gate | |")
    L += ["", "## Assumptions", "", "The main study's demand model, drawn per draw by its `draw_params`:", "", "```json", json.dumps(dict(company=out["demandModel"]["company"], model=out["demandModel"]["model"]), indent=1), "```", "",
          "mm-demand's evidence-based variant (replaces reach, ramp and the preference only):", "", "```json", json.dumps(out["evidenceVariant"], indent=1), "```", "",
          "This program's own, uniform per draw:", "", "```json", json.dumps(out["companyAssumptions"], indent=1), "```", "",
          "Yearly payers renew with (1 − monthly churn)^12; a first payment refunded within 30 days keeps its card fee lost and its month's use and closing spent; a disputed payment also loses the buyer's tax added on top and both dispute fees; an unpaid renewal costs one month of use in the grace; the free pool (10 places plus one for every 40 paying stores) is used at the drawn share of its places, each at the worst window a store that pays nothing can cost; the fixed costs are the main study's draw (named costs plus an unreviewed allowance). Not modeled: the Store assistant and AI captions (each keeps 60% alone), setup, paused accounts and legacy credits (none exist before a sale), and any reaction of competitors.", ""]
    return "\n".join(L)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--shard", type=int)
    ap.add_argument("--of", type=int)
    ap.add_argument("--out")
    ap.add_argument("--merge")
    ap.add_argument("--demand-root")
    ap.add_argument("--blocks", type=int, help="only the first N blocks (a quick local check)")
    a = ap.parse_args()
    if a.merge:
        merge(a.merge)
    else:
        if a.blocks:
            DRAWS = a.blocks * BLOCK
        run_shard(a.shard, a.of, a.out)
