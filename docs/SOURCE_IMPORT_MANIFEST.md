# Build 17 source import manifest

**Canonical artifact:** `ROXY_TRADE_BUILD_17_V1_EXECUTION_INTEGRITY_496_TESTS.zip`

**SHA-256:** `269398497815e8870c09450aebeeda8862d0a145c3f2b522ef06523b361aeaa4`

The archive contains 43 files under the root `ROXY_TRADE_BUILD_17/`. Import the *contents* of that directory to the repository root so `.github/workflows/offline-tests.yml` can discover `orchestrator.mjs`, `v1-execution-integrity.mjs`, and `tests/orchestrator.test.mjs`.

Source inventory:

```text
CHANGELOG.md
DEPLOYMENT_AUDIT.md
README.md
approval-lease.mjs
broker-adapter.mjs
broker-economics.mjs
demo-paper.mjs
edge/index.ts
orchestrator.mjs
paper-compounding.mjs
pinned-route.mjs
profit-policy-audit.mjs
readiness-assessment.mjs
reconcile.mjs
recovery-audit.mjs
signature.mjs
sql/roxy_rh_v1_supervised_one_shot_consume.sql
sql/roxy_v1_route_pinning_REVIEW_ONLY.sql
storage-adapter.mjs
strategy.mjs
supervised-v1-exit-preview.mjs
tests/adapters.test.mjs
tests/approval-and-profit-policy.test.mjs
tests/broker-all-in.test.mjs
tests/orchestrator.test.mjs
tests/security-regression.test.mjs
tests/strategy.test.mjs
tests/v1-route-integration.test.mjs
tests/v1-transport.test.mjs
tests/v10-atomic-approval.test.mjs
tests/v11-paper-compounding.test.mjs
tests/v11-recovery-hardening.test.mjs
tests/v12-live-dashboard.test.mjs
tests/v13-live-activation-readiness.test.mjs
tests/v15-route-economics.test.mjs
tests/v16-route-pinning-dollar-pilot.test.mjs
tests/v16-supervised-exit-preview.test.mjs
tests/v17-v1-execution-ledger.test.mjs
v1-broker-adapter.mjs
v1-execution-integrity.mjs
v1-strategy.mjs
web/index.html
RELEASE_SOURCE_SHA256.txt
```

**Security:** Exclude API keys, `.env` files, credentials, Supabase service-role secrets, and generated archives. Do not execute SQL files against production or deploy `edge/index.ts` as a funded order executor. The release requires isolated database tests and independent review before any funded trading.

**Current state:** Manifest committed; full source files **not yet imported**. CI will fail until the complete source is imported. Do not mistake a green documentation PR for trading readiness.
