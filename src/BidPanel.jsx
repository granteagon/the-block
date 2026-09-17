import React, { useState } from "react";
import { minimumBid, placeBid } from "./auction";
import { money } from "./format";
export default function BidPanel({ vehicle: v, bid, notice }) {
  const [amount, setAmount] = useState(String(minimumBid(v)));
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="panel bid-panel">
      <p className="eyebrow">DEMO AUCTION · OPEN FOR BIDS</p>
      <p>{v.current_bid ? "Current bid" : "Starting bid"}</p>
      <div className="price">
        {money(v.current_bid || v.starting_bid)} <small>CAD</small>
      </div>
      <p>
        {v.bid_count} bids ·{" "}
        {v.current_bid >= v.reserve_price ? "Reserve met" : "Reserve not met"}
      </p>
      <hr />
      <form
        noValidate
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
          aria-invalid={Boolean(error)}
          aria-describedby="bid-help bid-error"
        />
        <p id="bid-help" className="muted">
          Minimum {money(minimumBid(v))}. Bids increase by at least $100 after
          the opening bid.
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
        All vehicles are open in this demo. Bids are stored locally; there are
        no competing live bidders.
      </p>
    </section>
  );
}
