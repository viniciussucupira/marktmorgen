import copy
import unittest
import os
from unittest.mock import patch
from ci_full_tree_proof import WORKFLOWS, REPO, prove_full_tree, can_reuse_main
A, T, M = "a"*40, "b"*40, "c"*40

def fixture():
    runs = []
    replies = {"git/commits/" + M: {"sha": M, "tree": {"sha": T}, "parents": [{"sha":"d"*40},{"sha":A}]}}
    for index, (workflow, names) in enumerate(WORKFLOWS.items(), 1):
        runs.append({"id":index, "path":".github/workflows/"+workflow+".yml", "event":"pull_request",
                     "head_sha":A, "status":"completed", "conclusion":"success",
                     "repository":{"full_name":REPO}, "head_repository":{"full_name":REPO},
                     "display_title":"PV8 source "+M})
        jobs = [{"name":n,"status":"completed","conclusion":"success","started_at":"2026-10-25T00:00:00Z",
                 "completed_at":"2026-10-25T00:01:00Z"} for n in names | {"Documentation scope ("+workflow+")"}]
        replies["actions/runs/"+str(index)+"/jobs?filter=latest&per_page=100"] = {"total_count":len(jobs),"jobs":jobs}
    replies["actions/runs?head_sha="+A+"&event=pull_request&per_page=100"] = {"total_count":len(runs),"workflow_runs":runs}
    return replies

class FullTreeProofTests(unittest.TestCase):
    def test_exact_complete_tree_passes(self):
        self.assertTrue(prove_full_tree(A,T,fixture().__getitem__))

    def test_unknown_or_different_tree_refuses(self):
        self.assertFalse(prove_full_tree(A,"e"*40,fixture().__getitem__))
        self.assertFalse(prove_full_tree("--bad",T,fixture().__getitem__))

    def test_skipped_failed_cancelled_missing_and_duplicate_jobs_refuse(self):
        for conclusion in ["skipped","failure","cancelled",None]:
            data=fixture()
            data["actions/runs/1/jobs?filter=latest&per_page=100"]["jobs"][0]["conclusion"]=conclusion
            self.assertFalse(prove_full_tree(A,T,data.__getitem__))
        for mutation in ["missing","duplicate","unstarted"]:
            data=fixture(); reply=data["actions/runs/1/jobs?filter=latest&per_page=100"]
            if mutation=="missing": reply["jobs"].pop()
            elif mutation=="duplicate": reply["jobs"][0]=copy.deepcopy(reply["jobs"][1])
            else: reply["jobs"][0]["started_at"]=None
            self.assertFalse(prove_full_tree(A,T,data.__getitem__))

    def test_wrong_source_event_repository_or_head_refuses(self):
        for field,value in [("event","push"),("head_sha","e"*40),("display_title","owner supplied title"),
                            ("conclusion","failure"),("repository",{"full_name":"other/repo"}),
                            ("head_repository",{"full_name":"fork/repo"})]:
            data=fixture(); data[next(k for k in data if k.startswith("actions/runs?"))]["workflow_runs"][0][field]=value
            self.assertFalse(prove_full_tree(A,T,data.__getitem__))

    def test_truncated_listing_or_wrong_merge_parent_refuses(self):
        data=fixture(); data[next(k for k in data if k.startswith("actions/runs?"))]["total_count"]+=1
        self.assertFalse(prove_full_tree(A,T,data.__getitem__))
        data=fixture(); data["git/commits/"+M]["parents"][1]["sha"]="e"*40
        self.assertFalse(prove_full_tree(A,T,data.__getitem__))

    def test_new_pending_attempt_cannot_reuse_older_success(self):
        data=fixture(); listing=data[next(k for k in data if k.startswith("actions/runs?"))]
        latest=copy.deepcopy(listing["workflow_runs"][0]);latest.update(id=999,status="in_progress",conclusion=None)
        listing["workflow_runs"].append(latest);listing["total_count"]+=1
        self.assertFalse(prove_full_tree(A,T,data.__getitem__))

    def test_daily_and_manual_cannot_reuse_old_proof(self):
        for event in ("schedule", "workflow_dispatch", "pull_request", ""):
            with patch.dict(os.environ, {"CI_EVENT":event, "CI_REF":"refs/heads/main", "CI_REPOSITORY":REPO}):
                self.assertFalse(can_reuse_main())

if __name__=="__main__":
    unittest.main()
