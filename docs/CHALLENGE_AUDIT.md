# Challenge and implementation audit

Audit date: September 17, 2026  
Implementation reviewed: `c1b08257da510967fbdcaaf966e405876d4f3d78`  
Repository: https://github.com/granteagon/the-block  
Original baseline: `1cc7897` from `kar-dmp/the-block`

## Assessment

**The implementation satisfies the original challenge's functional minimum. Submission and interview readiness are not yet fully verified.** The application covers browsing, search, vehicle inspection, bidding with visible state updates, responsive layouts, and reproducible local setup. It also contains substantial optional work requested during development.

No failing automated tests or build errors were found. A fresh clone from the remote fork installs and runs. The remaining issues are principally verification coverage, presentation, scope, and documented prototype limitations. This is not a production marketplace certification or a prediction of OPENLANE's evaluation.

The most consequential unfinished items are confirming delivery of the repository link, recording an honest total time estimate, and preparing to explain the implementation. Exact photos matching every vehicle description were **not** achieved: every listing has a make/model reference image, but only 159 of 200 have a source-described matching year or year range, and trim/color/condition are not guaranteed.

## Beyond the brief — bonus features

The original minimum was browse/search, vehicle details, a working bid flow, desktop/mobile usability, and local setup instructions. **We extended that foundation with a dealer buying workflow, richer auction behavior, and substantial interface polish.** These additions were optional, not prerequisites for completing the challenge.

| Bonus feature | What we added and why it matters |
|---|---|
| Dealer buying rules | Save optional body style, make/model, year range, mileage, condition and title criteria. Live match previews and a dedicated buying desk turn repeated searches into a reusable sourcing workflow. |
| Capped auto-bidding | Automatically place the minimum eligible demo bid on every matching open vehicle, respond to competition within a per-vehicle cap, and pause or edit rules. Overlap handling and self-bid prevention make the automation predictable. |
| Watchlist and My bids | Save individual vehicles and track personal bidding activity, including leading, outbid and final positions. Shortlists and bids persist across reloads. |
| Timed auctions and demo controls | Live countdowns, stable deadlines, close/reopen actions and explicit competing bids make auction scenarios reproducible. Reserve-aware outcomes distinguish leading from actually winning the simulation. |
| Rich auction feedback | Persistent outcome banners, prominent competing-bid warnings, clear next actions, animated price changes, and six-second notifications that pause on hover or focus. |
| Reference photography and viewer | Added 156 attributed local photos across all 200 listings, frame-filling images and a keyboard-operable modal viewer. This improves on the supplied placeholders; exact year, trim and color coverage remains incomplete. |
| OPENLANE-inspired visual craft | Public-brand-inspired typography, navy/blue styling, coordinated crimson warnings, pill buttons, readable fields, capitalized body labels and carefully aligned select arrows. |
| Buyer confidence and resilience | Surface title issues and damage summaries directly on cards; validate stored data, preserve buyer bids separately from competing prices, and retain session state when storage fails. Eighteen automated tests cover domain, persistence and asset behavior. |

**The standout extension is the buying desk:** criteria → live matches → optional capped bids. It gives dealers a repeatable sourcing workflow beyond browsing individual listings. All bidding remains a local simulation over the supplied inventory; there is no background purchasing, live inventory feed, aggregate budget or quantity cap.

## Evidence and method

Reviewed the original challenge, walkthrough, optional submission template, current README, Git history, implementation modules, tests, photo manifest, and prior visual QA notes. Compared the challenge and supplied data against the original Git baseline. Verified fork ownership through GitHub and compared local HEAD with remote `main`; both were `c1b0825` at audit time.

Fresh verification in this audit:

- `npm test`: **18 passed, 0 failed** in both the working repository and a separate fresh remote clone.
- `npm ci`: passed in the fresh clone on Node **26.8.1**; npm reported **0 known vulnerabilities** in that install. This is a point-in-time dependency check, not a security audit.
- `npm run build`: passed in both locations.
- `npm run dev -- --host 127.0.0.1 --port 5199 --strictPort`: fresh clone served HTTP **200**; audit server stopped afterward. This verifies server startup, not a fresh browser interaction test.
- Original README at `1cc7897` and current `CHALLENGE.md` have identical SHA-1 hashes. `data/vehicles.json` and `WALKTHROUGH.md` have no changes from that baseline.
- Photo manifest contains **200 mappings, 156 distinct images, 159 yearMatches entries**. Those counts validate recorded metadata, not independent visual identification of every photo.

Browser observations below come from earlier development checks and `design-qa.md`, not a newly repeated exhaustive browser audit. Those checks covered desktop and narrow mobile layouts, bidding, watchlists, gallery navigation, and buying rules. No new screenshots were captured for this report. The documented Node minimum of 22.12 was not independently tested in this audit.

## Original requirements matrix

| Original instruction | Status | Evidence and qualification |
|---|---|---|
| Build a buyer-side auction application using 200 supplied vehicles | Complete | React + Vite application imports the unchanged dataset. No seller workflow is required. |
| Browse and search inventory | Complete | `src/Inventory.jsx` and `src/App.jsx`: search year/make/model/trim/location/lot, body filter, sorting, results count, empty-state recovery. |
| Vehicle details: specs, condition, damage, dealership, photos | Complete for prototype | `src/Detail.jsx` and `src/Gallery.jsx` expose all required categories. Reference photography and original placeholders are explicitly disclosed. |
| Place bids with updated visible state | Complete | `src/BidPanel.jsx`, `src/auction.js`, `src/App.jsx`: validation, review/confirmation, updated price/count, buyer position, feedback, persistence. |
| Usable on desktop and mobile | Implemented; sampled verification | Responsive layouts and prior checks at 320px, 390px, and desktop widths. No comprehensive browser/device or assistive-technology matrix. |
| Clear README enabling clone and local run | Complete on tested environment | Lockfile and setup commands present; fresh remote clone installed, tested, built, and served successfully. |
| Fork into own GitHub account and work there | Complete | GitHub confirms `granteagon/the-block` is a fork of `kar-dmp/the-block`; implementation is pushed to remote `main`. |
| README includes decisions and assumptions | Complete | Stack, bid increments, reserve outcomes, time normalization, persistence, photos, AI assistance, omitted scope, and buying-rule behavior documented. |
| Share repository with OPENLANE contact | Unverified / external action remains | No evidence in the reviewed work that the link was sent. A pushed fork is not proof of submission. No message was sent during this audit. |
| Submit within five days of receiving challenge | Unverified | The follow-up email asks for submission within 3–4 days, with a weekend extension available by arrangement; use that guidance over the generic five-day repository window. The challenge-email timestamp and actual delivery date are not established in the supplied excerpt, so deadline compliance remains unverified. |
| Aim for 3–4 hours; explain AI use and tradeoffs | Partially documented | AI assistance is disclosed. The reported five minutes applies only to initial hands-on work, not total elapsed development or later effort. No reliable total time record exists. Extra time is permitted by the prompt. |
| Prepare for 45–60 minute walkthrough | Preparation material exists; readiness unverified | README provides demo and code map. Ability to explain all code and decisions requires rehearsal by the candidate. |
| Use submission template | Optional, not a missing requirement | `SUBMISSION.md` remains the upstream template. The actual submission narrative is in README. |

Authentication, accounts, seller tools, checkout, payments, a backend, deployment, and buy-now were not required. Their absence is not a challenge failure. The original brief does not require a particular implementation branch, a pull request, or pixel-identical OPENLANE styling.

## What was actually built

The Git history supports a progression from required functionality to user-requested refinements:

| Commit | Delivered work |
|---|---|
| `317c673` | Core React + Vite buyer prototype. |
| `77768b3` | Component refactoring, mobile improvements, bid-storage hardening. |
| `6b404e7` | Title status and damage disclosures on cards. |
| `495948d` | Watchlists, personal bidding activity, timed auction simulation, visual polish. |
| `5b53629` | Attributed reference-photo mapping across all inventory. |
| `bd90f24` | OPENLANE-inspired typography and pill controls. |
| `66f4bd1` | Stronger auction outcome feedback and frame-filling photos. |
| `c90ec1d` | Cooler crimson warnings coordinated with brand blue. |
| `fe43303` | Six-second toast dismissal, paused during interaction. |
| `3b8b86a` | Removed reference-label overlays from photos. |
| `ee43847` | Capitalized body styles on inventory cards. |
| `c1b0825` | Buying rules, matching, capped demo auto-bids, select refinements. |

### Follow-up requests versus delivery

| Request | Actual outcome |
|---|---|
| Clone under `~/Repos`; use React + Vite and a real fork | Present at `/Users/granteagon/Repos/the-block`; stack and fork verified. |
| Match OPENLANE styling; rounded button ends and readable text | Public-site-inspired Poppins typography, navy/blue palette, pill actions, larger text and responsive controls. Original implementation, not proprietary production source. No claim of exact marketplace parity. |
| Make competing bids visually compelling | Warning notification, persistent auction state, outbid messaging and next action; outcome-specific colors and icons. |
| Fill photo boxes | Cover sizing in cards/detail/thumbnails; full image preserved in lightbox. Cropping is intentional. |
| Improve coordinating red | Warning palette changed to cooler crimson `#c62848`. Subjective design choice, not an official OPENLANE token. |
| Toasts disappear | Six-second timer with hover/focus pause and manual dismissal. Code reviewed; no automated timer/UI regression test. |
| Remove “Model/year reference” picture overlay | Overlay removed. Attribution and honest reference disclosures remain below gallery and elsewhere. |
| Capitalize body types on cards and in dropdowns | Card and option labels capitalize the first letter while keeping original data values. Detail specification values still use raw dataset casing; that was outside the explicit card/dropdown request. |
| Center select-arrow inset against text inset | Shared native select wrapper uses matching 16px left text/right icon insets; prior browser measurement supports this. |
| Photos that actually match each description | **Partial.** All listings have make/model references; 41 have a different or unverified year. Exact trim, paint, equipment, condition, and VIN photography remain unavailable. Original placeholder images remain in galleries. |
| Watch optional body style, model year, mileage and similar criteria | Implemented saved rules with optional body, make/model, inclusive year bounds, mileage, condition grade and title; live previews and matching inventory. |
| Automatically bid for desired cars | Implemented **local simulation**: minimum eligible bids across matching open vehicles, per-vehicle maximum, response to demo competition, pause/edit/delete, overlap handling and activity display. It is not autonomous purchasing or a live inventory service. |

Earlier references to “all the things you said” do not enumerate a separate checklist in the available user messages. This report traces explicit requests, the written assignment, and the committed features; it cannot certify an unspecified prior proposal.

## Buying-rule audit

The added dealer workflow is functional within the prototype's boundaries:

- Criteria are optional; identical earliest/latest years express one model year. Empty criteria intentionally match all vehicles, with that consequence explained in the form.
- Auto-bidding requires an explicit whole-dollar per-vehicle cap. It bids the minimum required amount, not the maximum immediately.
- It skips closed auctions, amounts above the cap, and vehicles already led by this buyer. Overlapping rules produce one bid using the highest applicable cap.
- Execution waits approximately 1.2 seconds, then reads current state and checks deadlines again. Changes to bids, rules, or auction preferences trigger reevaluation.
- Rules and accepted bids persist locally. Pausing/deleting stops future actions, but does not retract accepted bids. The activity feed is session-only.
- Prior browser testing exercised an 8,200 cap: opening bid 8,000, competition 8,100, automatic response 8,200, then no response to competition at 8,300. Pause/edit/resume and watch-only behavior were also checked during implementation.

Important boundaries: static supplied inventory; no incoming dealer feed, background execution while closed, email/push notifications, multi-buyer synchronization, aggregate spending limit or quantity limit. A leading bid is not a purchase; the simulated auction must close with reserve met. These are documented limitations, not hidden production capabilities.

## Quality findings and gaps

### Before submission or walkthrough

1. **Confirm actual submission and deadline.** Sharing the fork remains unverified. Follow the email’s 3–4 day target, or arrange the offered weekend extension. Do not treat implementation completion as delivery completion.
2. **Replace the incomplete time estimate with an honest account.** Distinguish candidate hands-on time, assistant work, and elapsed development. Do not describe the finished expanded product as five minutes of total work.
3. **Rehearse the small core flow first.** The assignment rewards judgment over feature count. Lead with browse → inspect → bid → updated state; show buying rules as a brief extension with explicit limits.
4. **Be precise about images.** Make/model reference coverage is complete; exact-description coverage is not. The remaining placeholders can weaken the impression of a realistic gallery even though they satisfy the original prototype input.

### Technical follow-up, not required blockers

| Finding | Impact / suggested response |
|---|---|
| Main JavaScript bundle is **612.00 kB**, **136.02 kB gzip** | Vite emits a >500 kB chunk warning. Consider splitting large data and optional buying-rule UI after measuring loading behavior. No measured loading-performance score was collected. |
| Lucide `use client` directives ignored during build | Nonfatal dependency warnings; build succeeds. Avoid presenting the build as warning-free. |
| No automated browser regression suite or CI workflow | Domain tests cannot prove React event handling, timer behavior, keyboard interaction, or layout. Add a focused end-to-end core flow before more feature expansion. |
| Accessibility coverage is limited | Labels, focus indicators, native controls/dialog, status announcements and reduced-motion handling exist. No comprehensive screen-reader, contrast, or cross-browser certification. |
| `BuyingRules.jsx` is 655 lines; stylesheet 1,216 lines | Increasing maintenance burden after iterative additions. Separate form/cards/activity and consolidate superseded CSS when further modifying these areas. Not proof of a runtime defect. |
| Application rebuilds derived inventory each second | Reasonable for this 200-vehicle demo; larger inventories would benefit from profiling and narrower countdown updates. |
| Browser-only state and clock | Deliberately mutable, not authoritative. Appropriate for the permitted frontend prototype; unsuitable for real auction settlement. |
| All simulated deadlines eventually expire | A returning demo browser may show closed auctions. Use the documented reopen controls during rehearsal; reload intentionally does not reset deadlines. |
| External fonts and placeholder URLs | Offline rendering uses font fallback and image-error handling. Local reference photos remain available. |

The fresh install also emitted npm install-script policy warnings for esbuild/fsevents; installation and build still succeeded in the tested environment.

## Test coverage ledger

| Area | Automated tests | What remains outside that evidence |
|---|---:|---|
| Auction domain | 6 | Browser confirmation interactions, visual outcomes, real concurrency. |
| Bid/preferences storage | 5 | Full browser reload flows, cross-tab behavior; cross-tab sync is deliberately absent. |
| Photo manifest/assets | 1 | Independent visual correctness of every photo and exhaustive license review. |
| Buying-rule domain/storage | 6 | Full editor integration, timer-driven UI lifecycle and browser reload regression. |
| **Total** | **18 passing** | No automated browser tests. |

Prior manual checks supplement these tests: search and empty states, back navigation, watchlist persistence, bid/outbid/rebid/close/reopen, gallery arrows/Escape, mobile layouts, and buying-rule limits. The earlier visual QA explicitly did not manually exercise a winning auction in that pass; reserve-aware winning logic is covered by domain tests. Do not equate past manual checks with repeatable automated coverage.

## Walkthrough preparation

For the approximately five-minute demo, show one vehicle end to end, including its damage disclosures and an outbid recovery. Finish with one narrowly scoped buying rule. Reopen a known vehicle beforehand if its deadline has elapsed.

For decisions, explain why frontend-only React was sufficient, why immutable data and pure auction functions were chosen, why competition is explicitly triggered, and why a bid cap is per vehicle. Acknowledge that later refinements expanded the original scope.

For code, be ready to navigate `auction.js`, `storage.js`, the bid handler in `App.jsx`, and `sourcing.js`. Explain stale-state revalidation, deadline boundaries, corrupt storage rejection, and preventing auto-bids against yourself.

For workflow, describe AI assistance candidly: implementation, research, test creation and execution, iterative visual feedback, and limitations requiring human judgment. Be able to explain the code independently. A useful team question is how OPENLANE handles authoritative bid concurrency and buyer notifications in its real platform.

## Audit disposition

**Core challenge: implemented and supported by passing checks.**  
**User-requested enhancements: implemented with the photo and simulation limitations above.**  
**Submission logistics and candidate walkthrough readiness: not verified.**

This audit adds documentation only; it does not change application behavior, submit the challenge, or claim that every UI path has been retested.
