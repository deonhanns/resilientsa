# CREW ORDER — DRAFT: the "Match a member" control does nothing, silently

**Status:** DRAFT — filed by O'Brien for Spock to issue (or reject) and number. **Deliberately not numbered**, because the next number is Spock's to assign and `MED-007` is also awaiting one.
**Filed:** 2026-09-20 (recorded while executing CREW-ORDER-013; see `OBRIEN_STANDUP.md`, entry "cont. 2")
**Assigned to:** O'Brien, on issue
**Severity:** Medium — no data loss, no security exposure, and no user can be misled into *losing* work. But it is a visibly-interactive control that silently does nothing, which is the specific class of thing the Bones Protocol exists to catch.
**Category:** Bones-relevant UI defect (recorded as `BN-LIVE-07` in `BONES_VERDICT.md`)

---

## 1. The defect

`ListingCard` renders a steward-only button labelled **"👥 Match a member"**, and clicking it does **nothing at all, with no feedback of any kind**.

- [`resilientsa-app/src/components/trade-exchange/ListingCard.tsx:137-152`](../../resilientsa-app/src/components/trade-exchange/ListingCard.tsx) — the button is rendered when the `steward` prop is true and wires `onClick={onMatch}`, a **prop**.
- [`resilientsa-app/src/components/trade-exchange/TradeExchange.tsx:170`](../../resilientsa-app/src/components/trade-exchange/TradeExchange.tsx) — the only render site passes `onMatch={() => {}}`: **an empty function**.

It is a no-op by construction. It is not that the handler fails; there is no handler.

## 2. Why it matters more than a broken call

A broken call fails **visibly** — an error, a spinner that stops, a console throw. This does none of that. A Cell Steward taps "Match a member", nothing happens, and no signal distinguishes "the system is broken" from "I did something wrong" from "that's normal". That is the failure mode the Bones Protocol's third and fourth tests name directly:

- *"Reduces anxiety?"* — No: it creates it, silently, for a non-technical user who cannot tell whether they mis-tapped.
- *"Would a stretched Cell Steward trust it on first use?"* — No. It is a promise the interface makes and does not keep.
- *"Respects the community member's time and dignity?"* — arguably it fails here too, in the specific way this mission's brief warns about: a control that looks like a working tool but is not is closer to development theatre than to a tool.

Found by reading, not by a live pass — so it has never been through a Bones visual review.

## 3. What is genuinely unknown, and must be decided before a fix

**Nobody knows what this button was meant to do.** There are two possibilities and they are different orders:

- **It is unfinished wiring.** The `/api/matches` API surface exists (4 routes: `GET`/`POST /api/matches`, `PATCH /api/matches/:id/confirm`, `PATCH /api/matches/:id/decline`) but has **no client caller anywhere**. It is dead server-side surface. If this button was the intended caller, then the real work is a steward-facing match-creation flow — a product feature, not a bug fix.
- **It is leftover UI.** If the matching flow was descoped or re-planned, the correct fix may be to remove the button — the honest thing for a control with no behaviour.

**This is why the draft stops at recording.** Deciding which of those it is, is a product question (per ORDER-013 §7's own principle about not changing semantics unilaterally), not an engineering one.

## 4. Proposed scope, on issue

TBD given §3. Either:
- **(a) Remove the control** until the flow exists — smallest change, honest UI, and it unblocks nothing because nothing works today; or
- **(b) Wire it** to a steward-facing match flow, which is a new order of its own and should be spec'd as a feature, not slipped in as a fix.

## 5. Relationship to other work

- **Independent of CREW-ORDER-013.** That order is about routing depth; this is about a control with no behaviour. Recorded separately, at Captain's direction, precisely so it does not get absorbed into a routing order and lost.
- **Related in one direction only:** the `/api/matches` routes are four of ORDER-013's twelve unreachable routes. They are also callerless, which is what makes deferring them to their own order defensible. If this button *is* their intended caller, then fixing them is only worth doing alongside the flow this button was meant to start — otherwise they stay dead either way.

---

*Draft filed by O'Brien, 2026-09-20. For Spock to issue or reject. Not in force; nothing to build until §3 is decided.*
