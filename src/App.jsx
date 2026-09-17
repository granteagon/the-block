import React, { useEffect, useRef, useState } from "react";
import { Heart, Gavel, LayoutGrid, CheckCircle2, X } from "lucide-react";
import inventory from "../data/vehicles.json";
import { placeBid, endTime, auctionStatus } from "./auction";
import { money } from "./format";
import {
  loadBids,
  saveBids,
  loadPreferences,
  savePreferences,
} from "./storage";
import Detail from "./Detail";
import Inventory from "./Inventory";
const readRoute = () => {
  const p = new URLSearchParams(location.search);
  return {
    selected: p.get("vehicle"),
    view: ["watchlist", "bids"].includes(p.get("view"))
      ? p.get("view")
      : "inventory",
  };
};
export default function App() {
  const [bids, setBids] = useState(() => loadBids(inventory));
  const [preferences, setPreferences] = useState(() =>
    loadPreferences(inventory),
  );
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("");
  const [sort, setSort] = useState("lot");
  const [route, setRoute] = useState(readRoute);
  const [now, setNow] = useState(Date.now);
  const [notice, setNotice] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const latest = useRef({ bids, preferences });
  latest.current = { bids, preferences };
  useEffect(() => {
    setStorageWarning(!savePreferences(preferences));
  }, [preferences]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const fn = () => {
      setRoute(readRoute());
      setNotice("");
    };
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);
  function navigate(id, view = route.view) {
    const p = new URLSearchParams();
    if (view !== "inventory") p.set("view", view);
    if (id) p.set("vehicle", id);
    history.pushState({}, "", location.pathname + (p.size ? "?" + p : ""));
    setRoute({ selected: id, view });
    setNotice("");
    window.scrollTo(0, 0);
  }
  const vehicles = inventory.map((v, i) => ({
    ...v,
    ...bids[v.id],
    ends_at: preferences.ends[v.id] ?? endTime(preferences.epoch, i),
  }));
  const current = vehicles.find((v) => v.id === route.selected);
  const watched = new Set(preferences.watched);
  const filtered = vehicles
    .filter(
      (v) =>
        (route.view === "inventory" ||
          (route.view === "watchlist" ? watched.has(v.id) : v.my_bid)) &&
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
          : sort === "ending"
            ? a.ends_at - b.ends_at
            : a.lot.localeCompare(b.lot),
    );
  function toggleWatch(id) {
    setPreferences((previous) => ({
      ...previous,
      watched: previous.watched.includes(id)
        ? previous.watched.filter((x) => x !== id)
        : [...previous.watched, id],
    }));
  }
  function bid(vehicle, amount, actor = "buyer") {
    const index = inventory.findIndex((v) => v.id === vehicle.id);
    const state = latest.current;
    const fresh = {
      ...inventory[index],
      ...state.bids[vehicle.id],
      ends_at:
        state.preferences.ends[vehicle.id] ??
        endTime(state.preferences.epoch, index),
    };
    const updated = placeBid(fresh, amount, Date.now(), actor);
    const next = {
      ...state.bids,
      [vehicle.id]: {
        current_bid: updated.current_bid,
        bid_count: updated.bid_count,
        my_bid: updated.my_bid,
      },
    };
    latest.current = { ...state, bids: next };
    setBids(next);
    if (!saveBids(next)) setStorageWarning(true);
    setNotice(
      actor === "buyer"
        ? `Bid confirmed: ${money(amount)} on ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
        : `Demo bidder placed ${money(amount)}.${updated.my_bid ? " You have been outbid." : ""}`,
    );
  }
  function changeEnd(id, close) {
    const ends = {
      ...latest.current.preferences.ends,
      [id]: Date.now() + (close ? 0 : 45 * 60_000),
    };
    setPreferences((p) => ({ ...p, ends }));
    setNow(Date.now());
    setNotice(
      close
        ? "Demo auction closed. Final status is shown below."
        : "Demo auction reopened for 45 minutes.",
    );
  }
  const counts = {
    inventory: vehicles.length,
    watchlist: watched.size,
    bids: vehicles.filter((v) => v.my_bid).length,
  };
  const outbid = vehicles.filter(
    (v) => auctionStatus(v, now) === "Outbid",
  ).length;
  return (
    <>
      <header>
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate(null, "inventory");
          }}
        >
          THE BLOCK<span>AN OPENLANE CHALLENGE</span>
        </a>
        <nav aria-label="Buyer workspace">
          {[
            ["inventory", "Inventory", LayoutGrid],
            ["watchlist", "Watchlist", Heart],
            ["bids", "My bids", Gavel],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={route.view === id ? "nav-item active" : "nav-item"}
              aria-current={route.view === id ? "page" : undefined}
              onClick={() => navigate(null, id)}
            >
              <Icon size={17} />
              {label}
              <span>{counts[id]}</span>
            </button>
          ))}
        </nav>
        <span className="prototype">DEMO MARKETPLACE · CAD</span>
      </header>
      <main>
        {storageWarning && (
          <p className="storage-warning" role="status">
            Browser storage is unavailable. Changes are kept for this session
            only.
          </p>
        )}
        {notice && (
          <div className="toast" role="status">
            <CheckCircle2 size={20} />
            <span>{notice}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {route.selected && !current ? (
          <section className="empty">
            <h1>Vehicle not found</h1>
            <button onClick={() => navigate(null)}>Back to inventory</button>
          </section>
        ) : current ? (
          <Detail
            key={current.id}
            vehicle={current}
            back={() => navigate(null)}
            bid={bid}
            now={now}
            watched={watched.has(current.id)}
            toggleWatch={() => toggleWatch(current.id)}
            changeEnd={changeEnd}
          />
        ) : (
          <Inventory
            {...{
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
            }}
            view={route.view}
            outbid={outbid}
          />
        )}
      </main>
      <footer>
        <strong>THE BLOCK</strong>
        <span>
          Independent coding prototype · Illustrative stock photos · Simulated
          auctions and bids · CAD
        </span>
      </footer>
    </>
  );
}
