# Build 17 source verification — 2026-10-23

Archive: `ROXY_TRADE_BUILD_17_V1_EXECUTION_INTEGRITY_496_TESTS.zip`

SHA-256: `269398497815e8870c09450aebeeda8862d0a145c3f2b522ef06523b361aeaa4`

Local verification:

```text
node --test tests/*.test.mjs
1..496
# tests 496
# pass 496
# fail 0
# duration_ms 618.072224
```

This was performed on the extracted Build 17 archive. It does not validate actual Robinhood funded orders, Postgres migration execution, broker cancellation, live stop behavior, or execution accounting under concurrency.

**Source import status:** The complete Build 17 source archive is not yet committed to this GitHub repository. This record is not a claim of source import or production deployment.

## Release blockers

- Missing order route column and V1 pinned-claim/approval RPCs in production.
- Supervised order path currently depends on `auto_enabled=true` and cannot operate while unattended trading is disabled.
- Production live safety database constraints intentionally force emergency STOP and prevent automatic ordering.
- No verified funded V1 order POST, fill/cancel reconciliation, or independently approved production release.

**Do not merge/deploy as live trading.**
