# The Block

A responsive buyer-side vehicle auction prototype built with React and Vite using the supplied 200-vehicle dataset.

## Run locally

Use Node.js 22.12+ (verified with Node 26) and npm.

```sh
npm ci
npm run dev
```

Open the local URL Vite prints (normally http://localhost:5173).

```sh
npm test        # bid rules and state transitions
npm run build  # production bundle
npm run preview
```

## What is included

- Inventory search by year, make, model, trim, location, and lot number.
- Body-style filtering and sorting by lot, price, or mileage.
- Shareable vehicle detail URLs with specifications, dealership, condition report, title status, damage notes, and photo selection.
- Bid validation, an explicit review/confirmation step, updated bid price/count, and local persistence across reloads.
- Responsive layouts, labeled controls, keyboard focus indicators, and status announcements.

## Assumptions and scope

This is a frontend-only demo. No accounts, backend, payments, seller tools, or real bidding are involved. All prices are assumed to be CAD. All vehicles are available to bid on; synthetic auction start timestamps are not used to imply real scheduling or countdowns.

An opening bid must meet the starting price. Subsequent bids must exceed the current bid by at least CAD 100, using whole-dollar amounts. Reserve status is shown without exposing the reserve amount. Buy-now is outside this initial scope.

Bids are saved in localStorage in the current browser. There is no server authority, competing-bid simulation, or synchronization between tabs. Clearing browser storage resets demo bids. The app can continue for the current session if storage is unavailable.

The supplied image URLs are placeholders, explicitly labeled in vehicle details. An image failure displays a fallback. Google Fonts are optional, with system font fallbacks.

## Structure and decisions

- `src/main.jsx`: inventory, detail view, URL navigation, and local bid persistence.
- `src/auction.js`: pure bid rules, shared by review/confirmation and tested independently.
- `src/style.css`: responsive presentation.
- `data/vehicles.json`: original inventory, unmodified.

A small React application keeps the browse → inspect → bid flow easy to follow. Native controls avoid unnecessary dependencies; URL query parameters support direct vehicle links and browser history.

## Validation

`npm test` covers opening bids, minimum increases, invalid amounts, and accepted bid state transitions. `npm run build` checks production bundling. These checks do not establish cross-browser or assistive-technology compatibility.

## With more time

Split UI into smaller component files, add end-to-end coverage for search and bidding, refine the mobile detail order, and test keyboard/screen-reader navigation. Real auctions would require server validation, concurrent-bid handling, authenticated buyers, authoritative scheduling, and a durable bid history.

## Workflow and time

Initial baseline created with Codex assistance. Review the implementation and record total time spent before submission. Be prepared to explain the bid rules, local persistence, and intentional auction simplifications.

Original challenge: [CHALLENGE.md](CHALLENGE.md). Interview expectations: [WALKTHROUGH.md](WALKTHROUGH.md).
