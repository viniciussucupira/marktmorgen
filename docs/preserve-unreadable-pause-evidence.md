# Preserve unreadable pause evidence

The restart pass previously collapsed an invalid stored pause and a missing Redis value into the same null result, then deleted the key and due entry. It now distinguishes an explicit Redis null from unreadable or incomplete data. Unreadable evidence remains unchanged and due for reconciliation; the pass records a failure and attempts neither a charge nor a notice for that entry.

Synthetic malformed JSON, JSON null and an incomplete record verify exact raw preservation, retained due membership, failure counts and zero provider attempts/notices. Existing missing-entry cleanup and valid pause flows remain.

This does not repair the evidence or implement durable restart reconciliation. Other pause readers retain their existing contracts; broader retention/closing treatment remains a separate audit. The pass uses the existing single GET and skips further store/provider work for unreadable entries. No new command, key, field or send is introduced. Preserved data and future retries still cost money: retention and incremental CPU/bytes are unmeasured, not zero or claimed savings. Commercial policies and coverage remain closed.
