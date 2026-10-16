# Central AI request limits

All calls through askModel are validated before fetch. These limits restrict request size and supported features; they are not a token count, a dollar-spend ledger, or certification of the owner's 60% after-tax margin.

- Models: the existing defaults claude-sonnet-5-5 and claude-haiku-5-5 only. Unsupported syntactically valid model overrides disable AI availability; direct calls to an unsupported model are refused.
- System text: 16,384 UTF-8 bytes.
- User text: 65,536 UTF-8 bytes across all text blocks.
- Output: a positive safe integer, at most 6,000 tokens, sent as max_tokens.
- Content: at most three blocks, with at most one base64 image or PDF. Encoded media is capped at 12 MiB; the serialized request is capped at 13 MiB. These are encoded-byte limits, not decoded file-size quotas.
- Images: JPEG, PNG, GIF or WebP. Documents: PDF. Remote media URLs, cache-control fields, tools and other unreviewed block fields are rejected.

The commercial rights snapshot includes both these limits and the supported-model list. Changing either invalidates a review made against the previous snapshot. No actual commercial review has been approved.

The existing REST integration is retained. No SDK migration, supplier account change, new vendor subscription or customer price change is included.

Sources reviewed on 2026-10-16:
- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/build-with-claude/token-counting

Anthropic describes token counting as an estimate. A UTF-8 byte cap must not be presented as an exact token or monetary cap. Monetary accounting still needs current rates for every billed token class, actual account conditions, the total calls inside each customer action, monthly reservations, failed started attempts and all AI entry points. The numerical monthly entitlements and overall margin remain uncertified.
