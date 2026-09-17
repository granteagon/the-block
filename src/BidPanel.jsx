import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Gavel, FlaskConical, AlertTriangle, Trophy, Radio, TrendingUp } from "lucide-react";
import { minimumBid, placeBid, isClosed, auctionStatus } from "./auction";
import { money } from "./format";
import AuctionBadge from "./AuctionBadge";
export default function BidPanel({ vehicle: v, bid, now, changeEnd }) {
  const [amount, setAmount] = useState(String(minimumBid(v))),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false);
  const closed = isClosed(v, now),
    status = auctionStatus(v, now);
  const [activity, setActivity] = useState(null);
  const tone = closed ? (status === "Won (demo)" ? "won" : status === "Lost" ? "lost" : "closed") : status === "Outbid" ? "outbid" : status === "Leading" ? "leading" : activity === "competitor" ? "competition" : "open";
  const StatusIcon = tone === "won" ? Trophy : ["outbid", "lost", "competition"].includes(tone) ? AlertTriangle : closed ? Gavel : tone === "leading" ? CheckCircle2 : Radio;
  const headline = {won: "You won this round.", lost: "This round went to another bidder.", closed: v.current_bid < v.reserve_price ? "Reserve not met." : "Bidding has ended.", outbid: "You've been outbid.", leading: "You're in the lead.", competition: "The bidding just heated up.", open: "Your next move starts here."}[tone];
  const reviewRef = useRef(null),
    confirmRef = useRef(null);
  useEffect(() => {
    if (confirm) confirmRef.current?.focus();
  }, [confirm]);
  useEffect(() => {
    setConfirm(false);
    setAmount(String(minimumBid(v)));
  }, [v.current_bid, closed]);
  function cancel() {
    setConfirm(false);
    requestAnimationFrame(() => reviewRef.current?.focus());
  }
  return (
    <section className={`panel bid-panel auction-${tone}`}>
      <div key={`${tone}-${v.current_bid}-${v.ends_at}`} className="auction-state" role="status" aria-live="polite" aria-atomic="true">
        <StatusIcon size={28} />
        <div><span className="state-kicker">{closed ? "FINAL RESULT · DEMO" : "LIVE AUCTION · DEMO"}</span><h2>{headline}</h2>
        <p>{tone === "outbid" || tone === "competition" ? `New high bid: ${money(v.current_bid)}. Bid ${money(minimumBid(v))} or more to take the lead.` : tone === "leading" ? `Your ${money(v.my_bid)} bid is on top. Stay close until the clock runs out.` : tone === "won" ? "Highest bid. Reserve met. This simulated auction is yours." : closed ? "The final result is recorded below." : "Review the vehicle and place your opening bid."}</p></div>
      </div>
      <p className="eyebrow">TIMED AUCTION · SIMULATION</p>
      <AuctionBadge vehicle={v} now={now} />
      <p>
        {closed ? "Final bid" : v.current_bid ? "Current bid" : "Starting bid"}
      </p>
      <div key={v.current_bid} className="price price-update">
        {money(v.current_bid || v.starting_bid)} <small>CAD</small>
      </div>
      <p>
        {v.bid_count} bids ·{" "}
        {v.current_bid >= v.reserve_price ? "Reserve met" : "Reserve not met"}
      </p>
      {v.my_bid && (
        <div
          className={`position ${status === "Outbid" || status === "Lost" ? "attention" : ""}`}
        >
          <strong>{status}</strong>
          <span>Your highest bid: {money(v.my_bid)}</span>
        </div>
      )}
      {closed ? (
        <div className="closed-message">
          <Gavel size={22} />
          <h3>Auction closed</h3>
          <p>
            {status === "Won (demo)"
              ? "You finished with the highest bid and met the reserve. This is a simulated result."
              : status === "Lost"
                ? "Another demo bidder finished with a higher bid."
                : v.current_bid < v.reserve_price
                  ? "The reserve was not met. This vehicle was not sold in the simulation."
                  : "Bidding has ended. This is a simulated result."}
          </p>
        </div>
      ) : (
        <>
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
              Minimum {money(minimumBid(v))}. Whole-dollar bids, at least $100
              above an existing bid.
            </p>
            <p id="bid-error" role="alert">
              {error}
            </p>
            {confirm ? (
              <div className="confirmation">
                <CheckCircle2 size={22} />
                <strong>Confirm your {money(Number(amount))} bid?</strong>
                <p>No payment is taken. This bid is part of the demo.</p>
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={() => {
                    try {
                      bid(v, Number(amount));
                      setActivity("buyer");
                      setConfirm(false);
                      requestAnimationFrame(() => reviewRef.current?.focus());
                    } catch (err) {
                      setError(err.message);
                      setConfirm(false);
                    }
                  }}
                >
                  Confirm bid
                </button>
                <button className="secondary" type="button" onClick={cancel}>
                  Cancel
                </button>
              </div>
            ) : (
              <button ref={reviewRef} type="submit">
                {status === "Outbid" ? "Take back the lead" : "Review bid"}
              </button>
            )}
          </form>
        </>
      )}
      <details className="demo-controls">
        <summary>
          <FlaskConical size={16} /> Demo controls
        </summary>
        <p>
          Use these controls to explore an outbid or closed-auction scenario. No
          real bidders participate.
        </p>
        <button
          className="secondary"
          disabled={closed}
          onClick={() => {
            try {
              bid(v, minimumBid(v), "competitor");
              setActivity("competitor");
              setError("");
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <TrendingUp size={18} /> Simulate competing bid
        </button>
        <button className="secondary" onClick={() => { changeEnd(v.id, !closed); setActivity(null); }}>
          {closed ? "Reopen for 45 minutes" : "Close auction now"}
        </button>
      </details>
      <p className="muted">
        Auction deadlines and bids persist in this browser. Times are simulated,
        not OPENLANE sale schedules.
      </p>
    </section>
  );
}
