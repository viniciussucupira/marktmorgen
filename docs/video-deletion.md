# Durable video deletion

Video removal now records deletion intent in `nl:stream:gone` before requesting provider deletion or removing the local video record. This applies to abandoned uploads, failed or oversized videos, creator deletion and store cleanup. A provider outage retains the intent; the existing scheduled stream sweep retries at most 40 entries per run. Only provider HTTP 200 or 404 removes the intent. An unacknowledged queue write refuses local cleanup.

Regression tests simulate provider DELETE failures while reads remain available, repeated outages, and recovery for abandoned and failed videos. Provider calls are mocked; no real customer video is deleted by the tests.

This closes lost cleanup paths; it does not cap video encoding, storage expansion, delivery, retry costs, or cleanup backlog. It does not establish the required 60% after-tax margin. Existing provider credentials and scheduled stream cleanup remain prerequisites.
