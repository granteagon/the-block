# The Block

A responsive buyer-side auction prototype built with React + Vite and the supplied 200-vehicle dataset. Browse inventory, inspect condition disclosures, save a shortlist, place a bid, and track your position through auction closure.

## Reviewer guide

Start with the **[challenge audit and bonus-feature report](docs/CHALLENGE_AUDIT.md)** for the requirements matrix, implementation evidence, optional enhancements, test results, and known limitations. This version renders directly on GitHub.

A **[styled HTML edition](docs/CHALLENGE_AUDIT.html)** includes visual summaries, bonus-feature cards, section navigation, and print/PDF styles. Download and open it in a browser, or visit `/docs/CHALLENGE_AUDIT.html` on the local Vite server after following the setup below. GitHub displays HTML source rather than rendering the report as a page.

For the walkthrough, use the **A two-minute demo** section below. The original instructions are preserved in [CHALLENGE.md](CHALLENGE.md), with interview expectations in [WALKTHROUGH.md](WALKTHROUGH.md).

## Run locally

Use Node.js 22.12+ and npm (development verified on Node 26).

```sh
npm ci
npm run dev
```

Open the URL Vite prints, normally http://localhost:5173.

```sh
npm test        # domain and persistence tests
npm run build  # production bundle
npm run preview
```

## What is included

- Search by year, make, model, trim, location, and lot; filter by body style and sort by price, mileage, lot, or closing time.
- Vehicle details with specifications, dealership, title status, condition report, and damage disclosures. Inventory cards expose title issues and damage summaries.
- Locally saved Watchlist and My bids views, including leading/outbid and final auction positions.
- **Buying rules** with optional body style, make/model, year range, mileage, condition and title filters; live matches, edit/pause/resume/delete, and optional capped auto-bidding on every match.
- Whole-dollar bid validation, explicit confirmation, visible feedback, and local persistence.
- Stable simulated deadlines, live countdowns, closed-auction enforcement, and reserve-aware results.
- Optional **Demo controls** on each detail page: simulate a competing bid, close the auction, or reopen it for 45 minutes.
- Make/model reference photography, the original placeholder images, and a modal photo viewer with arrow-key navigation, Escape dismissal, focus restoration, and native dialog focus containment.
- Responsive desktop/mobile layouts, labeled controls, keyboard focus indicators, and announced bid feedback.

## A two-minute demo

1. Search `A-0001`, save the vehicle with its heart button, and open Watchlist.
2. Open the vehicle and inspect condition disclosures. Open the photo viewer and use the arrow keys and Escape.
3. Review and confirm a bid. Open My bids to see your position.
4. Open **Demo controls** and select **Simulate competing bid**. My bids now shows an outbid warning. Your own highest bid remains distinct from the auction price.
5. Bid again, then select **Close auction now**. Bidding is disabled. The outcome depends on both your position and whether the reserve was met.
6. Select **Reopen for 45 minutes** to keep exploring. Reload to verify bids, watchlist, and deadlines persist.

If a vehicle has already closed, reopen it using Demo controls before bidding.

## Scope and assumptions

This is frontend-only. There are no real bids, accounts, payments, backend, seller tools, or production integrations. Prices are assumed to be CAD. The immutable original dataset is unchanged.

**Auction rules:** the opening bid must meet the starting price. Each subsequent bid must exceed the current bid by at least CAD 100, in whole dollars. Reserve status is visible, but the reserve amount is not shown in the UI. A highest bidder wins the simulation only when the reserve is met. Buy-now is intentionally omitted. Optional buying rules perform minimum-increment auto-bidding up to a per-vehicle cap.

**Time:** the dataset supplies synthetic start timestamps but no end times. On first visit, the prototype creates and saves a local clock anchor. Auctions run from 45 to 164 minutes from that anchor, with every twentieth lot initially closed to make the state discoverable. Reloading does not restart the clock. An explicit reopen changes only that vehicle's deadline and preserves its bids. The client clock is not trustworthy for real auctions.

**Competition:** competing bids are triggered only through an explicit demo button. No random background bidder changes the user's position. Bid confirmation revalidates the latest in-memory auction state and current deadline.

**Persistence:** bids, preferences, and buying rules use localStorage. Invalid saved entries are ignored, and arbitrary saved fields cannot override the vehicle dataset. When writes fail, the app retains session state and displays a warning. There is no synchronization between tabs, devices, or buyers. Clear this site's browser storage to reset the demo entirely.

**Photos:** all 200 listings have make/model reference photographs, using 156 locally bundled, visually reviewed Wikimedia Commons images. 159 listings match the source-described year or year range; the others disclose a different or unverified year in the gallery. Paint, trim, equipment, market and condition may differ. These are not photos of the synthetic VINs. The supplied 2016 Bronco and 2018 Telluride have inconsistent model years, disclosed without changing the dataset. Each gallery links its author, source and license; resized JPEGs retain their original licenses. All dataset placeholders remain available. Placeholder URLs and optional Google Fonts require a network connection. See [image credits](docs/IMAGE_CREDITS.md) and the per-listing manifest in `src/vehicle-photos.json`.

## Design reference

The [OPENLANE Canada buyer page](https://www.openlane.ca/en/buyers/) informed the navy/blue palette, bold typography, watchlist workflow, and attention to bid status and condition reports. Their public materials describe watchlists, bid notifications, and timed auctions. This is an original implementation; no proprietary production source code, marketplace data, or private APIs were copied. It is an independent coding challenge prototype, not an official OPENLANE product.

## Code map and decisions

- `src/App.jsx`: shared buyer state, URL navigation, local clock, bid orchestration.
- `src/Inventory.jsx`: search/filter controls, cards, and personal inventory views.
- `src/Detail.jsx`, `src/BidPanel.jsx`, `src/Gallery.jsx`: inspection, bidding, demo controls, and photo viewing.
- `src/auction.js`: pure bid validation, closing rules, position labels, and countdown formatting.
- `src/storage.js`: validated persistence and graceful storage-failure handling.
- `src/sourcing.js`: pure criteria validation, matching, auto-bid planning and validated rule persistence.
- `src/BuyingRules.jsx`: rule editor, match cards, controls and session activity feed.
- `src/Select.jsx`: native keyboard-accessible selects with equal 16px text/icon insets.
- `src/media.js`: illustrative asset mapping and attribution.
- `src/style.css`: responsive styling. Lucide supplies icons.

A small React application and native browser controls keep the prototype explainable. Separating auction rules from UI allows meaningful deterministic tests without waiting for timers. Explicit demo controls make edge cases reproducible during the walkthrough.

## Validation

`npm test` covers opening bids, minimum increases, invalid amounts, immutable state transitions, deadline boundaries, competing bids, reserve-aware outcomes, deterministic scheduling, blocked storage, malformed data, and bid/watchlist/deadline persistence.

Manual in-app browser checks cover search, empty-state recovery, browser back, saving and reloading a watchlist, My bids, outbid/rebid/close/reopen flows, photo navigation, Escape dismissal, and responsive layouts. These checks do not establish comprehensive cross-browser or screen-reader compatibility.

## Time and AI assistance

Grant reported approximately **5 minutes of hands-on time on the initial baseline**, followed by additional AI-assisted feature development and validation. That figure is not the total elapsed development time. Codex assisted with implementation, public-site research, tests, documentation, and browser checks. Review the code and update the total hands-on time if further preparation changes it.

## With more time

Add automated browser regression tests, test assistive technologies, and source exact year/trim/color imagery for the remaining reference mismatches. For a real marketplace, move bids and auction timing to an authoritative server with authenticated buyers, concurrency control, durable bid history, cross-session updates, and real condition photos.

Original prompt: [CHALLENGE.md](CHALLENGE.md). Interview expectations: [WALKTHROUGH.md](WALKTHROUGH.md).

### Visual styling

The shared styles use the public [OPENLANE US site](https://www.openlane.com/) as a reference: Poppins, navy `#0a1b5f`, blue `#0061ff`, pill-shaped actions, outlined secondary actions, and a rounded white header. Typography is adapted for inventory: 16px body/fields, 14px supporting text, and larger headings and prices. Compact image labels and navigation counts use 12px. Mobile layouts preserve readable text and wrap controls instead of shrinking them. This is an independent implementation, not OPENLANE production CSS.

Auction feedback uses persistent, icon-labelled state headers, strong warning notifications for competing bids, blue leading/reopened states, green won states and navy closed results. Price changes animate briefly, with reduced-motion support. Listing and detail photos fill their frames with `object-fit: cover`; the lightbox preserves the complete photo.

## Dealer buying rules

Open **Buying rules → New buying rule**. All vehicle criteria are optional. For an exact model year, set earliest and latest year to the same year. The form previews matching open vehicles before saving. Watch-only rules never bid. Matching vehicles appear automatically in the buying desk, and its navigation badge counts unique open matches across active rules.

Enable **Automatically bid on matches**, enter a whole-dollar maximum per vehicle, and select **Save rule & enable auto-bid**. This authorizes demo bids on every eligible match, without an aggregate spending or quantity cap. The engine uses the lowest allowed bid, waits briefly so demo competition is visible, and rechecks current data and deadlines before acting. It never raises the buyer's own leading bid. If multiple active rules match, the highest applicable cap applies and only one bid is placed. Closed auctions and bids above the cap are skipped. A leading bid is not a purchase; the reserve must be met at auction close.

Pause or delete a rule to stop future auto-bids; already accepted bids remain. Editing a paused rule keeps it paused. Rules and bids survive reload; the activity feed lists the latest actions of the current session. A sample Honda Civic watch-only rule may be present in the development browser from the walkthrough; rules are not seeded in the shipped app.

This is a browser-only simulation over the supplied inventory: no live dealer inventory feed, no email/push alerts, no execution while the app is closed, and no cross-tab coordination. On reopening the app, active rules evaluate the current inventory again. Production automation would require an authenticated server, inventory events, durable orders, idempotency and budget controls.

Additional tests cover inclusive filter boundaries, invalid/corrupt rules, persistence failure, every-match bidding, overlapping rules, self-bid prevention, pause, cap enforcement and deadline boundaries.
