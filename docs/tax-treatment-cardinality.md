# Bounded tax-treatment review input

The existing gate requires exactly one treatment record for each known jurisdiction. An array longer than the jurisdiction list can never satisfy that rule. The reader now rejects that cardinality before enumerating array keys or inspecting members. Partial arrays retain the existing missing-jurisdiction diagnostics; all record validation is unchanged.

The existing snapshot test exercises deemedSupplierReady itself. A valid synthetic four-record proxy first proves the enumeration/member probes work. Five-record and million-position arrays then fail with neither probe touched. The real records remain empty, deemedSupplierReady remains false, and sales remain off.

This is input-cost containment, not an implementation or legal determination of country/state tax treatment, registration, collection, counters or geographic checkout refusal. No new provider, runtime IO, price, visible limit or enabled gate. Full CI on the exact head is required before merge. CI and review costs remain100%Marktmorgen under FX275, never assumed zero.
