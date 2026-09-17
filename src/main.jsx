import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import inventory from "../data/vehicles.json";
import { minimumBid, placeBid } from "./auction";
import "./style.css";
const money = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
const number = (n) => n.toLocaleString("en-CA");
function loadBids() {
  try {
    const saved = JSON.parse(localStorage.getItem("the-block-bids") || "{}");
    return Object.fromEntries(
      inventory
        .filter(
          (v) =>
            Number.isSafeInteger(saved?.[v.id]?.current_bid) &&
            saved[v.id].current_bid >= minimumBid(v) &&
            Number.isSafeInteger(saved[v.id].bid_count) &&
            saved[v.id].bid_count > v.bid_count,
        )
        .map((v) => [v.id, saved[v.id]]),
    );
  } catch {
    return {};
  }
}
function Photo({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="fallback">Photo unavailable</div>
  ) : (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}
function App() {
  const [bids, setBids] = useState(loadBids);
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("");
  const [sort, setSort] = useState("lot");
  const [selected, setSelected] = useState(() =>
    new URLSearchParams(location.search).get("vehicle"),
  );
  const [notice, setNotice] = useState("");
  React.useEffect(() => {
    const fn = () =>
      setSelected(new URLSearchParams(location.search).get("vehicle"));
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);
  function navigate(id) {
    history.pushState({}, "", id ? `?vehicle=${id}` : location.pathname);
    setSelected(id);
    setNotice("");
    window.scrollTo(0, 0);
  }
  const vehicles = inventory.map((v) => ({ ...v, ...bids[v.id] }));
  const current = vehicles.find((v) => v.id === selected);
  const filtered = vehicles
    .filter(
      (v) =>
        (!body || v.body_style === body) &&
        `${v.year} ${v.make} ${v.model} ${v.trim} ${v.city} ${v.province} ${v.lot}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    )
    .sort((a, b) =>
      sort === "price"
        ? (a.current_bid || a.starting_bid) - (b.current_bid || b.starting_bid)
        : sort === "mileage"
          ? a.odometer_km - b.odometer_km
          : a.lot.localeCompare(b.lot),
    );
  function bid(vehicle, amount) {
    const updated = placeBid(vehicle, amount);
    const next = {
      ...bids,
      [vehicle.id]: {
        current_bid: updated.current_bid,
        bid_count: updated.bid_count,
        my_bid: amount,
      },
    };
    setBids(next);
    try {
      localStorage.setItem("the-block-bids", JSON.stringify(next));
      setNotice(`Your bid of ${money(amount)} has been placed.`);
    } catch {
      setNotice(
        `Your bid of ${money(amount)} has been placed for this session. Browser storage is unavailable.`,
      );
    }
  }
  return (
    <>
      <header>
        <a
          className="brand"
          href={location.pathname}
          onClick={(e) => {
            e.preventDefault();
            navigate(null);
          }}
        >
          THE BLOCK<span>BY OPENLANE</span>
        </a>
        <span className="prototype">Buyer prototype · CAD</span>
      </header>
      <main>
        {current ? (
          <Detail
            key={current.id}
            vehicle={current}
            back={() => navigate(null)}
            bid={bid}
            notice={notice}
          />
        ) : (
          <>
            <section className="intro">
              <div>
                <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
                <h1>
                  Find your next
                  <br />
                  great acquisition.
                </h1>
                <p>
                  Explore dealer inventory. Know the condition. Bid with
                  clarity.
                </p>
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
              <span role="status">{filtered.length} vehicles</span>
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
                        <strong>
                          {money(v.current_bid || v.starting_bid)}
                        </strong>
                      </div>
                      <span>
                        {v.my_bid ? "Your bid placed ✓" : `${v.bid_count} bids`}{" "}
                        →
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
        )}
      </main>
      <footer>
        THE BLOCK{" "}
        <span>
          Prototype • Synthetic vehicle data and placeholder photos • Bids are
          saved only in this browser.
        </span>
      </footer>
    </>
  );
}
function Detail({ vehicle: v, back, bid, notice }) {
  const [photo, setPhoto] = useState(0);
  const [amount, setAmount] = useState(String(minimumBid(v)));
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <button className="back" onClick={back}>
        ← Back to inventory
      </button>
      <div className="detail-title">
        <p className="eyebrow">
          LOT {v.lot} · {v.city}, {v.province}
        </p>
        <h1>
          {v.year} {v.make} {v.model}
        </h1>
        <p>
          {v.trim} · {number(v.odometer_km)} km · {v.drivetrain}
        </p>
      </div>
      <div className="detail-grid">
        <div>
          <div className="hero-photo">
            <Photo
              key={photo}
              src={v.images[photo]}
              alt={`${v.year} ${v.make} ${v.model} photo ${photo + 1} — supplied placeholder`}
            />
          </div>
          <div className="thumbnails" aria-label="Vehicle photos">
            {v.images.map((src, i) => (
              <button
                key={src}
                className={photo === i ? "active" : ""}
                onClick={() => setPhoto(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={photo === i}
              >
                <Photo src={src} alt={`Photo ${i + 1}`} />
              </button>
            ))}
          </div>
          <p className="muted">
            Dataset photos are placeholders, not actual vehicle images.
          </p>
          <section className="panel">
            <h2>Condition & disclosures</h2>
            <div className="badges">
              <span>Condition grade: {v.condition_grade.toFixed(1)}</span>
              <span>Title: {v.title_status}</span>
            </div>
            <p>{v.condition_report}</p>
            <h3>Damage notes</h3>
            {v.damage_notes.length ? (
              <ul>
                {v.damage_notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p>No damage notes reported.</p>
            )}
          </section>
          <section className="panel">
            <h2>Vehicle specifications</h2>
            <dl>
              {Object.entries({
                VIN: v.vin,
                Engine: v.engine,
                Transmission: v.transmission,
                Drivetrain: v.drivetrain,
                Fuel: v.fuel_type,
                Odometer: `${number(v.odometer_km)} km`,
                Exterior: v.exterior_color,
                Interior: v.interior_color,
                "Body style": v.body_style,
              }).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <aside>
          <section className="panel bid-panel">
            <p className="eyebrow">DEMO AUCTION · OPEN FOR BIDS</p>
            <p>{v.current_bid ? "Current bid" : "Starting bid"}</p>
            <div className="price">
              {money(v.current_bid || v.starting_bid)} <small>CAD</small>
            </div>
            <p>
              {v.bid_count} bids ·{" "}
              {v.current_bid >= v.reserve_price
                ? "Reserve met"
                : "Reserve not met"}
            </p>
            <hr />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  placeBid(v, Number(amount));
                  setError("");
                  setConfirm(true);
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              <label htmlFor="amount">Your bid (CAD)</label>
              <input
                id="amount"
                type="number"
                step="1"
                min={minimumBid(v)}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setConfirm(false);
                  setError("");
                }}
                required
                aria-describedby="bid-help bid-error"
              />
              <p id="bid-help" className="muted">
                Minimum {money(minimumBid(v))}. Bids increase by at least $100
                after the opening bid.
              </p>
              <p id="bid-error" role="alert">
                {error}
              </p>
              {confirm ? (
                <div className="confirmation">
                  <strong>Confirm your {money(Number(amount))} bid?</strong>
                  <p>This is a simulated bid. No payment is taken.</p>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        bid(v, Number(amount));
                        setAmount(String(Number(amount) + 100));
                        setConfirm(false);
                      } catch (err) {
                        setError(err.message);
                        setConfirm(false);
                      }
                    }}
                  >
                    Confirm bid
                  </button>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => setConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="submit">Review bid →</button>
              )}
            </form>
            <p className="success" role="status">
              {notice}
            </p>
            {v.my_bid && (
              <p>
                Your highest bid: <strong>{money(v.my_bid)}</strong>
              </p>
            )}
            <p className="muted">
              All vehicles are open in this demo. Bids are stored locally; there
              are no competing live bidders.
            </p>
          </section>
          <section className="panel">
            <p className="eyebrow">SELLING DEALERSHIP</p>
            <h3>{v.selling_dealership}</h3>
            <p>
              {v.city}, {v.province}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
