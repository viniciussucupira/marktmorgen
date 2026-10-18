"""Runs scripts/pricing-study-v2.py split across machines, with the same result as one plain run.

The study is one linear main(); its expensive, independent parts go through pricing-study-v2.py's EXECUTOR:
the programs (one task per base-scenario program or named scenario) and the Monte Carlos (the company's screen,
its commission variants and its final draw, and the cohort's), which are split by range of draws. This file puts a
staged executor there and runs main() again at every stage:

    shard  --index i --count n   main() runs, every part already in the state is read back, and at the first
                                 part that is not, this machine computes its slice of it (programs i, i+n, i+2n...,
                                 or draws [D*i/n, D*(i+1)/n)), writes it to the shards directory and stops;
    merge                        main() runs; the first missing part is put together from the shards' files
                                 (tasks in their order, draws stacked in draw order and accumulated by the study's
                                 own company_summarize), kept in the state, and main() goes on until the next
                                 missing part (written to pending.json) or the end, when the output file is written.

A part is named by the SHA-256 of what it computes (the input file, its kind and its arguments), so a state can
never answer for another input. The Monte Carlo's generator is replayed through the earlier draws by each shard,
and the logit normalizer's candidate set is the whole design list's, so a slice equals the same draws of one run;
the merge accumulates in draw order, so every float is the one a single run makes on the same machine.

Every shard records numpy's CPU dispatch; the merge refuses shards whose dispatch differs (vector code paths can
round differently), and the workflow pins it (NPY_DISABLE_CPU_FEATURES) so every runner takes the same path.

    python3 scripts/pricing-study-v2-shard.py shard --index 0 --count 20 --state S --shards OUT
    python3 scripts/pricing-study-v2-shard.py merge --count 20 --state S --shards IN
"""
import argparse
import glob
import hashlib
import importlib.util
import json
import os
import pathlib
import pickle
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent


def load_study():
    spec = importlib.util.spec_from_file_location("pricing_study_v2", HERE / "pricing-study-v2.py")
    ps = importlib.util.module_from_spec(spec)
    sys.modules["pricing_study_v2"] = ps
    spec.loader.exec_module(ps)
    return ps


def cpu_dispatch():
    from numpy._core._multiarray_umath import __cpu_dispatch__, __cpu_features__
    return sorted(k for k in __cpu_dispatch__ if __cpu_features__.get(k))


class Stop(Exception):
    pass


class StagedExecutor:
    def __init__(self, ps, mode, index, count, state, shards):
        self.ps, self.mode, self.index, self.count = ps, mode, index, count
        self.state, self.shards = pathlib.Path(state), pathlib.Path(shards)
        (self.state / "cache").mkdir(parents=True, exist_ok=True)
        self.shards.mkdir(parents=True, exist_ok=True)
        self.input_sha = hashlib.sha256(ps.INPUT.read_bytes()).hexdigest()
        self.timings_path = self.state / "timings.json"

    def key(self, spec):
        return hashlib.sha256(repr((self.input_sha, spec)).encode()).hexdigest()[:32]

    def _part(self, kind, spec, size, compute, assemble):
        key = self.key(spec)
        cached = self.state / "cache" / f"{key}.pkl"
        if cached.exists():
            with open(cached, "rb") as f:
                return pickle.load(f)
        pending_path = self.state / "pending.json"
        pending = json.loads(pending_path.read_text()) if pending_path.exists() else None
        if self.mode == "shard":
            if pending is not None and pending["key"] != key:
                raise RuntimeError(f"the next part is {kind} {key}, but the state is waiting for {pending['kind']} {pending['key']}")
            t0 = time.time()
            part = compute(self.index, self.count)
            seconds = time.time() - t0
            with open(self.shards / f"{key}-{self.index:03d}.pkl", "wb") as f:
                pickle.dump(dict(key=key, kind=kind, index=self.index, count=self.count, part=part, seconds=seconds, cpu=cpu_dispatch()), f)
            raise Stop(f"shard {self.index + 1} of {self.count}: {kind} ({size}) slice done in {seconds:.1f}s")
        files = sorted(glob.glob(str(self.shards / f"{key}-*.pkl")))
        if not files:
            pending_path.write_text(json.dumps(dict(key=key, kind=kind, size=size)) + "\n")
            raise Stop(f"next part: {kind} ({size}), key {key}")
        parts = []
        for name in files:
            with open(name, "rb") as f:
                parts.append(pickle.load(f))
        counts = {p["count"] for p in parts}
        assert len(counts) == 1, f"shards of {key} were cut {counts} ways"
        (n,) = counts
        assert sorted(p["index"] for p in parts) == list(range(n)), f"shards of {key}: {sorted(p['index'] for p in parts)} of {n}"
        cpus = {tuple(p["cpu"]) for p in parts}
        assert len(cpus) == 1, f"shards of {key} ran with different numpy CPU dispatch {cpus}"
        t0 = time.time()
        result = assemble([p["part"] for p in sorted(parts, key=lambda p: p["index"])])
        with open(cached, "wb") as f:
            pickle.dump(result, f)
        if pending_path.exists():
            pending_path.unlink()
        timings = json.loads(self.timings_path.read_text()) if self.timings_path.exists() else []
        sec = [p["seconds"] for p in parts]
        timings.append(dict(kind=kind, size=size, key=key, shards=n, cpu=list(next(iter(cpus))), slowestShardSeconds=round(max(sec), 1),
                            meanShardSeconds=round(sum(sec) / n, 1), totalShardSeconds=round(sum(sec), 1), assembleSeconds=round(time.time() - t0, 1)))
        self.timings_path.write_text(json.dumps(timings, indent=1) + "\n")
        print(f"  merged {kind} ({size}) from {n} shards: slowest {max(sec):.0f}s, total {sum(sec):.0f}s", flush=True)
        return result

    def programs(self, tasks, run):
        def compute(i, n):
            return [(t, run(tasks[t])) for t in range(i, len(tasks), n)]

        def assemble(parts):
            got = dict(x for part in parts for x in part)
            assert sorted(got) == list(range(len(tasks))), "a program task is missing or repeated"
            return [got[t] for t in range(len(tasks))]
        return self._part("programs", ("programs", tasks), f"{len(tasks)} tasks", compute, assemble)

    def draws(self, spec, draws, rows, summarize):
        def compute(i, n):
            return rows(draws * i // n, draws * (i + 1) // n)
        return self._part(spec[0], (spec, draws), f"{draws} draws x {len(spec[1])} designs", compute, summarize)


def run(ps, mode, index, count, state, shards):
    """One stage; returns 'done' (the output file was written), 'pending' (the merge stopped at a part to compute) or 'shard'."""
    ex = StagedExecutor(ps, mode, index, count, state, shards)
    ps.EXECUTOR[0] = ex
    try:
        ps.main()
    except Stop as s:
        print(f"  {s}", flush=True)
        return "shard" if mode == "shard" else "pending"
    if mode == "shard":
        print("  nothing left to compute", flush=True)
        return "shard"
    (pathlib.Path(state) / "done.json").write_text(json.dumps(dict(output=str(ps.OUTPUT))) + "\n")
    return "done"


def cli():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=("shard", "merge"))
    ap.add_argument("--index", type=int, default=0)
    ap.add_argument("--count", type=int, required=True)
    ap.add_argument("--state", required=True)
    ap.add_argument("--shards", required=True)
    a = ap.parse_args()
    ps = load_study()
    status = run(ps, a.mode, a.index, a.count, a.state, a.shards)
    gh = os.environ.get("GITHUB_OUTPUT")
    if gh:
        with open(gh, "a") as f:
            f.write(f"status={status}\n")
    print(f"status={status}")


if __name__ == "__main__":
    cli()
