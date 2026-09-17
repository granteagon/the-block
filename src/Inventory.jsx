import React from "react";
import inventory from "../data/vehicles.json";
import Photo from "./Photo";
import { money, number } from "./format";
export default function Inventory({
  query,
  setQuery,
  body,
  setBody,
  sort,
  setSort,
  filtered,
  navigate,
}) {
  return (
    <>
      <section className="intro">
        <div>
          <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
          <h1>
            Find your next
            <br />
            great acquisition.
          </h1>
          <p>Explore dealer inventory. Know the condition. Bid with clarity.</p>
        </div>
        <div className="inventory-count">
          <strong>{inventory.length}</strong>
          <span>vehicles to explore</span>
        </div>
      </section>
      <section aria-label="Inventory filters" className="filters">
        <label className="search">
          Search inventory
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Make, model, location or lot number"
            type="search"
          />
        </label>
        <label>
          Body style
          <select value={body} onChange={(e) => setBody(e.target.value)}>
            <option value="">All body styles</option>
            {[...new Set(inventory.map((v) => v.body_style))]
              .sort()
              .map((x) => (
                <option key={x}>{x}</option>
              ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="lot">Lot number</option>
            <option value="price">Lowest price</option>
            <option value="mileage">Lowest mileage</option>
          </select>
        </label>
      </section>
      <div className="results">
        <h2>Available inventory</h2>
        <span role="status">
          {filtered.length} {filtered.length === 1 ? "vehicle" : "vehicles"}
        </span>
      </div>
      <div className="grid">
        {filtered.map((v) => (
          <a
            className="card"
            key={v.id}
            href={`?vehicle=${v.id}`}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                navigate(v.id);
              }
            }}
          >
            <div className="card-photo">
              <Photo
                src={v.images[0]}
                alt={`${v.year} ${v.make} ${v.model} — supplied placeholder`}
              />
              <span className="lot">{v.lot}</span>
            </div>
            <div className="card-body">
              <div className="card-meta">
                <span>{v.body_style}</span>
                <span>Grade {v.condition_grade.toFixed(1)}</span>
              </div>
              <h3>
                {v.year} {v.make} {v.model}
              </h3>
              <p>
                {v.trim} · {number(v.odometer_km)} km
              </p>
              <p className="location">
                {v.city}, {v.province}
              </p>
              <div className="card-bottom">
                <div>
                  <small>
                    {v.current_bid ? "Current bid" : "Starting bid"}
                  </small>
                  <strong>{money(v.current_bid || v.starting_bid)}</strong>
                </div>
                <span>
                  {v.my_bid ? "Your bid placed ✓" : `${v.bid_count} bids`} →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <h2>No matching vehicles</h2>
          <p>Try a different search or body style.</p>
          <button
            onClick={() => {
              setQuery("");
              setBody("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
