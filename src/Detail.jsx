import React, { useState } from "react";
import Photo from "./Photo";
import BidPanel from "./BidPanel";
import { number } from "./format";
export default function Detail({ vehicle: v, back, bid, notice }) {
  const [photo, setPhoto] = useState(0);
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
          <BidPanel vehicle={v} bid={bid} notice={notice} />
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
