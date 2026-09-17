import React, { useEffect, useRef, useState } from "react";
import { Heart, Gavel, LayoutGrid, Radar } from "lucide-react";
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
import Toast from "./Toast";
import Inventory from "./Inventory";
import Sourcing from "./BuyingRules";
import { autoBidPlan, loadRules, saveRules, matchesRule } from "./sourcing";
import { isClosed } from "./auction";
const readRoute = () => {
  const p = new URLSearchParams(location.search);
  return {
    selected: p.get("vehicle"),
    view: ["watchlist", "bids", "rules"].includes(p.get("view"))
      ? p.get("view")
      : "inventory",
  };
};
export default function App() {
  const [bids, setBids] = useState(() => loadBids(inventory));
  const [preferences, setPreferences] = useState(() =>
    loadPreferences(inventory),
  );
  const [rules, setRules] = useState(() => loadRules(inventory));
  const [activity, setActivity] = useState([]);
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("");
  const [sort, setSort] = useState("lot");
  const [route, setRoute] = useState(readRoute);
  const [now, setNow] = useState(Date.now);
  const [notice, setNotice] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const latest = useRef({ bids, preferences, rules });
  latest.current = { bids, preferences, rules };
  useEffect(() => {
    if (!savePreferences(preferences)) setStorageWarning(true);
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
  function updateRules(next) {
    latest.current = { ...latest.current, rules: next };
    setRules(next);
    if (!saveRules(next)) setStorageWarning(true);
  }
  useEffect(() => {
    // A short delay makes the competing-bid → auto-response sequence visible.
    // Read fresh state and recheck deadlines when the action actually executes.
    const timer = setTimeout(() => {
      const state = latest.current;
      const timestamp = Date.now();
      const fresh = inventory.map((v, i) => ({
        ...v,
        ...state.bids[v.id],
        ends_at:
          state.preferences.ends[v.id] ?? endTime(state.preferences.epoch, i),
      }));
      const plan = autoBidPlan(fresh, state.rules, timestamp);
      if (!plan.length) return;
      const next = { ...state.bids };
      for (const item of plan) {
        const v = item.updated;
        next[v.id] = {
          current_bid: v.current_bid,
          bid_count: v.bid_count,
          my_bid: v.my_bid,
        };
      }
      latest.current = { ...state, bids: next };
      setBids(next);
      if (!saveBids(next)) setStorageWarning(true);
      setActivity((previous) =>
        [
          ...plan.map((item, i) => ({
            ...item,
            updated: undefined,
            id: `${timestamp}-${i}`,
            at: timestamp,
            vehicle: `${item.updated.year} ${item.updated.make} ${item.updated.model} · ${item.updated.lot}`,
          })),
          ...previous,
        ].slice(0, 50),
      );
      setNotice({
        id: timestamp,
        tone: "info",
        title:
          plan.length === 1
            ? "Auto-bid took the lead"
            : `Auto-bid placed ${plan.length} bids`,
        message:
          plan.length === 1
            ? `${money(plan[0].amount)} on ${plan[0].updated.year} ${plan[0].updated.make} ${plan[0].updated.model}. Within your ${money(plan[0].cap)} limit.`
            : "Your buying rules acted on matching vehicles. Review the activity in Buying rules.",
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [rules, bids, preferences]);
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
    setNotice({
      id: Date.now(),
      tone: actor === "buyer" ? "success" : "warning",
      title:
        actor === "buyer"
          ? "You're in the lead"
          : updated.my_bid
            ? "You've been outbid"
            : "New competing bid",
      message:
        actor === "buyer"
          ? `${money(amount)} confirmed on ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
          : `Another demo bidder raised the price to ${money(amount)}. Next bid: ${money(amount + 100)}.`,
    });
  }
  function changeEnd(id, close) {
    const ends = {
      ...latest.current.preferences.ends,
      [id]: Date.now() + (close ? 0 : 45 * 60_000),
    };
    latest.current = {
      ...latest.current,
      preferences: { ...latest.current.preferences, ends },
    };
    setPreferences((p) => ({ ...p, ends }));
    setNow(Date.now());
    setNotice({
      id: Date.now(),
      tone: close ? "closed" : "info",
      title: close ? "Auction closed" : "Back on the block",
      message: close
        ? "Bidding has ended. Check the final outcome in the auction panel."
        : "The clock is reset. You have 45 minutes to make your move.",
    });
  }
  const counts = {
    rules: vehicles.filter(
      (v) =>
        !isClosed(v, now) && rules.some((r) => r.active && matchesRule(v, r)),
    ).length,
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
            ["rules", "Buying rules", Radar],
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
          <Toast
            key={notice.id}
            notice={notice}
            dismiss={() => setNotice("")}
          />
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
            backLabel={
              route.view === "rules"
                ? "← Back to buying rules"
                : route.view === "watchlist"
                  ? "← Back to watchlist"
                  : route.view === "bids"
                    ? "← Back to my bids"
                    : "← Back to inventory"
            }
            bid={bid}
            now={now}
            watched={watched.has(current.id)}
            toggleWatch={() => toggleWatch(current.id)}
            changeEnd={changeEnd}
            autoRules={rules.filter(
              (r) => r.active && r.autoBid && matchesRule(current, r),
            )}
            manageRules={() => navigate(null, "rules")}
          />
        ) : route.view === "rules" ? (
          <Sourcing
            vehicles={vehicles}
            rules={rules}
            updateRules={updateRules}
            activity={activity}
            navigate={navigate}
            now={now}
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
          Independent coding prototype · Vehicle reference photos · Simulated
          auctions and bids · CAD
        </span>
      </footer>
    </>
  );
}
