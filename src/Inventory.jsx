import React from "react";
import {
  Heart,
  ArrowUpRight,
  ShieldAlert,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import inventory from "../data/vehicles.json";
import Photo from "./Photo";
import Select from "./Select";
import AuctionBadge from "./AuctionBadge";
import { money, number } from "./format";
import { illustration } from "./media";
export default function Inventory({
  query,
  setQuery,
  body,
  setBody,
  sort,
  setSort,
  filtered,
  navigate,
  watched,
  toggleWatch,
  now,
  view,
  outbid,
}) {
  const title =
    view === "watchlist"
      ? "Your next move. Saved."
      : view === "bids"
        ? "Every bid. In view."
        : "Great inventory. Clear decisions.";
  return (
    <>
      <section className="intro">
        <div>
          <p className="eyebrow">THE BUYER WORKSPACE</p>
          <h1>{title}</h1>
          <p>
            {view === "watchlist"
              ? "A shortlist worth coming back to."
              : view === "bids"
                ? "Track your position from the first bid to the final second."
                : "Discover dealer inventory, understand the condition, and make your move."}
          </p>
          <span className="demo-note">
            Simulated auctions · Illustrative photos · No real purchases
          </span>
        </div>
        <div className="inventory-count">
          <strong>
            {view === "inventory" ? inventory.length : filtered.length}
          </strong>
          <span>
            {view === "inventory"
              ? "vehicles. one marketplace."
              : view === "watchlist"
                ? "on your radar"
                : "bids to follow"}
          </span>
        </div>
      </section>
      {view === "bids" && outbid > 0 && (
        <div className="outbid-banner">
          <ShieldAlert size={20} />
          {outbid} {outbid === 1 ? "vehicle needs" : "vehicles need"} your
          attention. Open a vehicle to review your bid.
        </div>
      )}
      <section aria-label="Inventory filters" className="filters">
        <label className="search">
          <span>
            <Search size={14} /> Search inventory
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Make, model, location or lot number"
            type="search"
          />
        </label>
        <label>
          Body style
          <Select value={body} onChange={(e) => setBody(e.target.value)}>
            <option value="">All body styles</option>
            {[...new Set(inventory.map((v) => v.body_style))]
              .sort()
              .map((x) => (
                <option key={x} value={x}>
                  {x.charAt(0).toUpperCase() + x.slice(1)}
                </option>
              ))}
          </Select>
        </label>
        <label>
          Sort by
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="lot">Lot number</option>
            <option value="ending">Ending soonest</option>
            <option value="price">Lowest price</option>
            <option value="mileage">Lowest mileage</option>
          </Select>
        </label>
      </section>
      <div className="results">
        <h2>
          {view === "watchlist"
            ? "Your watchlist"
            : view === "bids"
              ? "Your bidding activity"
              : "Explore inventory"}
        </h2>
        <span role="status">
          {filtered.length} {filtered.length === 1 ? "vehicle" : "vehicles"}
        </span>
      </div>
      <div className="grid">
        {filtered.map((v) => (
          <article className="card" key={v.id}>
            <div className="card-photo">
              <a
                href={`?vehicle=${v.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    navigate(v.id);
                  }
                }}
                aria-label={`View ${v.year} ${v.make} ${v.model}, lot ${v.lot}`}
              >
                <Photo src={illustration(v).src} alt={illustration(v).alt} />
              </a>
              <span className="lot">{v.lot}</span>
              <button
                className="watch-button"
                aria-label={`${watched.has(v.id) ? "Remove" : "Save"} ${v.lot} ${watched.has(v.id) ? "from" : "to"} watchlist`}
                aria-pressed={watched.has(v.id)}
                onClick={() => toggleWatch(v.id)}
              >
                <Heart
                  size={19}
                  fill={watched.has(v.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="card-body">
              <AuctionBadge vehicle={v} now={now} />
              <div className="card-meta">
                <span>
                  {v.body_style.charAt(0).toUpperCase() + v.body_style.slice(1)}
                </span>
                <span>Condition {v.condition_grade.toFixed(1)}</span>
              </div>
              <h3>
                <a
                  href={`?vehicle=${v.id}`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      navigate(v.id);
                    }
                  }}
                >
                  {v.year} {v.make} {v.model}
                </a>
              </h3>
              <p>
                {v.trim} · {number(v.odometer_km)} km
              </p>
              <p className="location">
                {v.city}, {v.province}
              </p>
              <div className="condition-summary">
                <span
                  className={`title-status ${v.title_status === "clean" ? "" : "attention"}`}
                >
                  Title: {v.title_status}
                </span>
                <p>
                  <strong>
                    {v.damage_notes.length
                      ? `${v.damage_notes.length} damage ${v.damage_notes.length === 1 ? "note" : "notes"}`
                      : "No damage notes reported"}
                  </strong>
                </p>
                {v.damage_notes.length > 0 && (
                  <p>
                    {v.damage_notes[0]}
                    {v.damage_notes.length > 1
                      ? ` · +${v.damage_notes.length - 1} more`
                      : ""}
                  </p>
                )}
              </div>
              <div className="card-bottom">
                <div>
                  <small>
                    {v.current_bid ? "Current bid" : "Starting bid"}
                  </small>
                  <strong>{money(v.current_bid || v.starting_bid)}</strong>
                </div>
                <span>
                  {v.bid_count} {v.bid_count === 1 ? "bid" : "bids"}
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <section className="empty">
          <SlidersHorizontal size={30} />
          <h2>
            {query || body
              ? "No matching vehicles"
              : view === "watchlist"
                ? "Your watchlist starts here"
                : view === "bids"
                  ? "Your first bid is ahead"
                  : "No vehicles available"}
          </h2>
          <p>
            {query || body
              ? "Try a different search or clear the filters."
              : view === "watchlist"
                ? "Save a vehicle with the heart button to keep it here."
                : "Explore a vehicle, review its condition, and place a demo bid."}
          </p>
          <button
            onClick={() => {
              setQuery("");
              setBody("");
              if (!query && !body) navigate(null, "inventory");
            }}
          >
            {query || body ? "Clear filters" : "Explore inventory"}
          </button>
        </section>
      )}
    </>
  );
}
