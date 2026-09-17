import React from "react";
import { Heart, ShieldAlert, Zap } from "lucide-react";
import Gallery from "./Gallery";
import BidPanel from "./BidPanel";
import { minimumBid, isClosed } from "./auction";
import { money, number } from "./format";
export default function Detail({
  vehicle: v,
  back,
  backLabel = "← Back to inventory",
  bid,
  now,
  watched,
  toggleWatch,
  changeEnd,
  autoRules = [],
  manageRules,
}) {
  return (
    <>
      <button className="back" onClick={back}>
        {backLabel}
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
      <button
        className="save-detail secondary"
        aria-pressed={watched}
        onClick={toggleWatch}
      >
        <Heart size={18} fill={watched ? "currentColor" : "none"} />
        {watched ? "Saved to watchlist" : "Save to watchlist"}
      </button>
      <div className="detail-grid">
        <div>
          <Gallery vehicle={v} />
          <section className="panel">
            <h2>Condition & disclosures</h2>
            <div className="badges">
              <span>Condition grade: {v.condition_grade.toFixed(1)}</span>
              <span className={v.title_status !== "clean" ? "attention" : ""}>
                Title: {v.title_status}
              </span>
            </div>
            <p>{v.condition_report}</p>
            <h3 className="damage-heading">
              <ShieldAlert size={19} /> Damage notes
            </h3>
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
          {autoRules.length > 0 && (
            <div className="auto-policy">
              <Zap size={22} />
              <div>
                <strong>
                  {isClosed(v, now)
                    ? "Auto-bidding ended"
                    : minimumBid(v) >
                          Math.max(...autoRules.map((r) => r.maxBid)) &&
                        v.my_bid !== v.current_bid
                      ? "Auto-bid limit reached"
                      : "Auto-bid active"}
                </strong>
                <p>
                  Maximum {money(Math.max(...autoRules.map((r) => r.maxBid)))}{" "}
                  per vehicle.{" "}
                  {autoRules.length > 1
                    ? "Highest limit across matching rules applies."
                    : autoRules[0].name}
                </p>
                <button className="quiet-button" onClick={manageRules}>
                  Manage buying rules →
                </button>
              </div>
            </div>
          )}

          <BidPanel vehicle={v} bid={bid} now={now} changeEnd={changeEnd} />
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
