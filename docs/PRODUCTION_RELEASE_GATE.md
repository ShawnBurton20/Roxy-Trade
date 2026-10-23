# Roxy Trade — Build 17 Production Release Gate

**Status: NOT APPROVED FOR FUNDED TRADING.** This is an engineering review branch, not a deployment or authorization to place orders.

## Verified production blockers (October 23, 2026)

- `roxy_rh_execution_control`: `mode=disabled`, `auto_enabled=false`, `emergency_stop=true`.
- `roxy_robinhood_live_safety`: `live_enabled=false`, `auto_ordering_enabled=false`, `emergency_stop=true`, `broker_order_code_verified=false`.
- DB constraints force the live-safety switches to remain disabled; **do not drop or bypass those constraints to activate trading**.
- `roxy_rh_execution_orders.route` is missing; broker route cannot yet be pinned to each order.
- `roxy_rh_v1_consume_one_shot` and `roxy_rh_v1_exec_claim_pinned` are missing.
- The existing `roxy_rh_exec_claim` RPC requires `mode=armed`, `auto_enabled=true`, and a verified trade key. This conflicts with a one-order supervised pilot.
- Zero production funded execution orders and zero supervised approvals as of review.
- The current V2 one-shot Edge Function is not the intended unattended V1 buy/sell executor.
- Build 17's 496 passing tests are **offline** and do not certify production broker POST, fill reconciliation, cancel, or STOP behavior.

## Required engineering changes

1. Establish a separate supervised, owner-authorized, single-order execution state without arming unattended trading. Keep an independent emergency STOP that can always block submissions.
2. Validate migration ordering and the route-pinning schema in an isolated Postgres test environment. Reject unpinned or mismatched broker routes.
3. Implement atomic, expiring, single-use owner approval and claim with idempotency and concurrency tests.
4. Audit broker V1 request signing, actual POST permission, execution-history accounting, duplicate submission protection, reconciliation, cancellation, unknown-order recovery, and error handling.
5. Run integration tests against isolated database and broker sandbox or suitably controlled test harness. Obtain independent code/security review.
6. Deploy reviewed code with production STOP still ON, verify migrations and runtime behavior, then separately authorize a precisely specified small real order.
7. Verify supervised buy and separately authorized sell before considering unattended operation.

## Non-negotiable acceptance criteria

- No order is sent without explicit authorization and independently checked emergency STOP.
- Approval expires, is consumed at most once, and cannot be replayed.
- Order's route and broker adapter agree; mismatch halts submission.
- A retry cannot duplicate a broker order.
- Fill quantities and weighted prices reconcile to broker execution history.
- Unknown fills/orders force STOP and require investigation.
- Loss caps, spread caps, cash buffer, and 80/20 realized-profit reserve policy are tested.
- Independent reviewer signs off on the deployment and initial funded trade plan.

**This branch does not remove constraints, enable trading, or submit any funded orders.**
