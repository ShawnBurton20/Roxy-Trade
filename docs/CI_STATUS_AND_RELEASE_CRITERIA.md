# Source import status

Build 17 is **NOT fully imported**. The GitHub Actions workflow can complete successfully while skipping the engine test step. That green check means only that the workflow configuration ran correctly, not that the trading engine was tested.

## Release validation

Before considering any release, verify all of the following:

- Every source file listed in `docs/SOURCE_IMPORT_MANIFEST.md` is present.
- The imported files match the SHA-256 values in the canonical archive's `RELEASE_SOURCE_SHA256.txt`.
- `node --test tests/*.test.mjs` completes with 496 passing tests and 0 failures.
- Independent isolated PostgreSQL integration tests and broker-execution reviews pass.
- All production emergency stops remain enabled during deployment verification.

Do not deploy the SQL or write-capable Edge Function from the draft PR. The draft is a review vehicle, not authorization to trade.

## Workflow semantics

- `success` with the source-import step reporting `ready=false`: **source missing; tests skipped**.
- `success` with `ready=true` and tests passed: **offline suite passed only**.
- Neither state authorizes live trading.
