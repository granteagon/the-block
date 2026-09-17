import React, { useState } from "react";
import inventory from "../data/vehicles.json";
import { placeBid } from "./auction";
import { money } from "./format";
import { loadBids, saveBids } from "./storage";
import Detail from "./Detail";
import Inventory from "./Inventory";
export default function App() {
  const [bids, setBids] = useState(() => loadBids(inventory));
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("");
  const [sort, setSort] = useState("lot");
  const [selected, setSelected] = useState(() =>
    new URLSearchParams(location.search).get("vehicle"),
  );
  const [notice, setNotice] = useState("");
  React.useEffect(() => {
    const fn = () => {
      setSelected(new URLSearchParams(location.search).get("vehicle"));
      setNotice("");
    };
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
    const persisted = saveBids(next);
    setNotice(
      persisted
        ? `Your bid of ${money(amount)} has been placed.`
        : `Your bid of ${money(amount)} has been placed for this session. Browser storage is unavailable.`,
    );
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
            }}
          />
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
