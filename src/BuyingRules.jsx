import React, { useRef, useState } from "react";
import {
  Radar,
  Plus,
  Zap,
  Pause,
  Play,
  Pencil,
  Trash2,
  ArrowUpRight,
  Check,
  Search,
} from "lucide-react";
import Select from "./Select";
import Photo from "./Photo";
import { illustration } from "./media";
import { matchesRule, validateRule } from "./sourcing";
import { auctionStatus, isClosed, minimumBid } from "./auction";
import { money, number } from "./format";

const empty = () => ({
  id: crypto.randomUUID(),
  name: "",
  body: "",
  make: "",
  model: "",
  title: "",
  yearMin: "",
  yearMax: "",
  maxMileage: "",
  minCondition: "",
  maxBid: "",
  active: true,
  autoBid: false,
});
const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const unique = (vehicles, field) =>
  [...new Set(vehicles.map((v) => v[field]))].sort();
export default function Sourcing({
  vehicles,
  rules,
  updateRules,
  activity,
  navigate,
  now,
}) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const formRef = useRef(null);
  const newButton = useRef(null);
  const set = (field, value) => {
    setDraft((d) => ({
      ...d,
      [field]: value,
      ...(field === "make" ? { model: "" } : {}),
    }));
    setError("");
  };
  function edit(rule) {
    setDraft(
      rule
        ? {
            ...rule,
            ...Object.fromEntries(
              [
                "yearMin",
                "yearMax",
                "maxMileage",
                "minCondition",
                "maxBid",
              ].map((k) => [k, rule[k] ?? ""]),
            ),
          }
        : empty(),
    );
    setError("");
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      formRef.current?.querySelector("input")?.focus({ preventScroll: true });
    });
  }
  function cancel() {
    setDraft(null);
    setError("");
    requestAnimationFrame(() => newButton.current?.focus());
  }
  const active = rules.filter((r) => r.active);
  const openMatches = vehicles.filter(
    (v) => !isClosed(v, now) && active.some((r) => matchesRule(v, r)),
  );
  const displayRules =
    selected === "all" ? active : rules.filter((r) => r.id === selected);
  const matches = vehicles.filter(
    (v) =>
      (showClosed || !isClosed(v, now)) &&
      displayRules.some((r) => matchesRule(v, r)),
  );
  const preview = draft
    ? {
        ...draft,
        ...Object.fromEntries(
          ["yearMin", "yearMax", "maxMileage", "minCondition", "maxBid"].map(
            (k) => [k, draft[k] === "" ? null : Number(draft[k])],
          ),
        ),
      }
    : null;
  const previewMatches = preview
    ? vehicles.filter((v) => !isClosed(v, now) && matchesRule(v, preview))
    : [];
  const bidReady = previewMatches.filter(
    (v) =>
      !(v.my_bid != null && v.my_bid >= v.current_bid) &&
      preview?.maxBid >= minimumBid(v),
  );
  function save(e) {
    e.preventDefault();
    try {
      const rule = validateRule(preview, vehicles);
      updateRules(
        rules.some((r) => r.id === rule.id)
          ? rules.map((r) => (r.id === rule.id ? rule : r))
          : [...rules, rule],
      );
      setSelected(rule.id);
      cancel();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <>
      <section className="intro sourcing-intro">
        <div>
          <p className="eyebrow">YOUR DEALERSHIP'S BUYING DESK</p>
          <h1>
            The right cars.
            <br />
            On your terms.
          </h1>
          <p>
            Tell us what your lot needs. We’ll find the matches and help you
            move first.
          </p>
        </div>
        <button ref={newButton} className="icon-action" onClick={() => edit()}>
          <Plus size={20} /> New buying rule
        </button>
      </section>
      <div className="sourcing-stats">
        <div>
          <Radar />
          <strong>{active.length}</strong>
          <span>Active buying rules</span>
        </div>
        <div>
          <Search />
          <strong>{openMatches.length}</strong>
          <span>Matching open vehicles</span>
        </div>
        <div>
          <Zap />
          <strong>{active.filter((r) => r.autoBid).length}</strong>
          <span>Rules with auto-bid</span>
        </div>
      </div>
      <p className="sourcing-note">
        Demo buying desk · Rules are saved in this browser. Matches and
        auto-bids update while this app is open; no real purchases or background
        service.
      </p>
      {draft && (
        <section
          ref={formRef}
          className="rule-editor panel"
          aria-labelledby="rule-form-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">DEFINE YOUR NEXT PURCHASE</p>
              <h2 id="rule-form-title">
                {rules.some((r) => r.id === draft.id)
                  ? "Edit buying rule"
                  : "Create a buying rule"}
              </h2>
            </div>
            <span className="match-pill" role="status">
              {previewMatches.length} open matches
            </span>
          </div>
          <form onSubmit={save} noValidate>
            <label>
              Rule name
              <input
                value={draft.name}
                maxLength={80}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Civics for the used-car lot"
                required
              />
            </label>
            <p className="muted">
              All criteria below are optional. Leave a field blank to include
              any value.
            </p>
            <div className="rule-fields">
              <label>
                Body style
                <Select
                  value={draft.body}
                  onChange={(e) => set("body", e.target.value)}
                >
                  <option value="">Any body style</option>
                  {unique(vehicles, "body_style").map((x) => (
                    <option key={x} value={x}>
                      {titleCase(x)}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                Make
                <Select
                  value={draft.make}
                  onChange={(e) => set("make", e.target.value)}
                >
                  <option value="">Any make</option>
                  {unique(vehicles, "make").map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </Select>
              </label>
              <label>
                Model
                <Select
                  value={draft.model}
                  onChange={(e) => set("model", e.target.value)}
                >
                  <option value="">Any model</option>
                  {unique(
                    vehicles.filter(
                      (v) => !draft.make || v.make === draft.make,
                    ),
                    "model",
                  ).map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </Select>
              </label>
              <label>
                Earliest year
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  step="1"
                  placeholder="Any year"
                  value={draft.yearMin}
                  onChange={(e) => set("yearMin", e.target.value)}
                />
              </label>
              <label>
                Latest year
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  step="1"
                  placeholder="Any year"
                  value={draft.yearMax}
                  onChange={(e) => set("yearMax", e.target.value)}
                />
              </label>
              <label>
                Maximum mileage (km)
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="No limit"
                  value={draft.maxMileage}
                  onChange={(e) => set("maxMileage", e.target.value)}
                />
              </label>
              <label>
                Minimum condition grade
                <Select
                  value={draft.minCondition}
                  onChange={(e) => set("minCondition", e.target.value)}
                >
                  <option value="">Any condition</option>
                  {[1, 2, 3, 4, 5].map((x) => (
                    <option key={x} value={x}>
                      {x}.0 or better
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                Title status
                <Select
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                >
                  <option value="">Any title</option>
                  {unique(vehicles, "title_status").map((x) => (
                    <option key={x} value={x}>
                      {titleCase(x)}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <div className={`auto-bid-setup ${draft.autoBid ? "enabled" : ""}`}>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={draft.autoBid}
                  onChange={(e) => set("autoBid", e.target.checked)}
                />
                <span>
                  <strong>
                    <Zap size={18} /> Automatically bid on matches
                  </strong>
                  <small>
                    Optional · Bid on every matching open vehicle, up to your
                    limit.
                  </small>
                </span>
              </label>
              {draft.autoBid && (
                <>
                  <label>
                    Maximum bid per vehicle (CAD)
                    <input
                      type="number"
                      min="1"
                      max="10000000"
                      step="1"
                      value={draft.maxBid}
                      onChange={(e) => set("maxBid", e.target.value)}
                      placeholder="12000"
                      required
                    />
                  </label>
                  <p>
                    We place the minimum required bid and respond when outbid,
                    never above this rule’s limit. This applies to{" "}
                    <strong>every matching vehicle</strong>, with no overall
                    spending or quantity cap. Leading does not guarantee a
                    purchase; the reserve must be met when the auction ends.
                  </p>
                  <p className="auto-preview" role="status">
                    {draft.active ? bidReady.length : 0} vehicles can receive a
                    bid now
                    {preview.maxBid
                      ? ` · up to ${money(preview.maxBid)} each`
                      : ""}
                    .
                  </p>
                </>
              )}
            </div>
            {error && (
              <p className="rule-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button type="submit">
                {!draft.active
                  ? "Save paused rule"
                  : draft.autoBid
                    ? "Save rule & enable auto-bid"
                    : "Save buying rule"}
              </button>
              <button type="button" className="secondary" onClick={cancel}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      <div className="section-heading">
        <h2>Your buying rules</h2>
        <span>{rules.length} saved</span>
      </div>
      {!rules.length ? (
        <section className="empty panel">
          <Radar size={36} />
          <h3>A watchlist that finds the cars for you.</h3>
          <p>
            Watch for SUVs, low-mileage sedans, or a specific make and model.
            Add a bid limit when you’re ready to automate.
          </p>
          <button onClick={() => edit()}>Create your first rule</button>
        </section>
      ) : (
        <div className="rule-grid">
          {rules.map((r) => {
            const count = vehicles.filter(
              (v) => !isClosed(v, now) && matchesRule(v, r),
            ).length;
            const tags = [
              r.body && titleCase(r.body),
              r.make,
              r.model,
              (r.yearMin || r.yearMax) &&
                `${r.yearMin || "Any"}–${r.yearMax || "Any"}`,
              r.maxMileage != null && `≤ ${number(r.maxMileage)} km`,
              r.minCondition != null && `Grade ${r.minCondition}+`,
              r.title && `${titleCase(r.title)} title`,
            ].filter(Boolean);
            return (
              <article
                className={`rule-card ${!r.active ? "paused" : ""}`}
                key={r.id}
              >
                <div className="section-heading">
                  <span className={`rule-state ${r.active ? "active" : ""}`}>
                    {!r.active ? (
                      <Pause size={15} />
                    ) : r.autoBid ? (
                      <Zap size={15} />
                    ) : (
                      <Radar size={15} />
                    )}
                    {!r.active
                      ? "Paused"
                      : r.autoBid
                        ? "Auto-bid on"
                        : "Watching"}
                  </span>
                  <strong>{count} matches</strong>
                </div>
                <h3>{r.name}</h3>
                <div className="rule-tags">
                  {(tags.length ? tags : ["All vehicles"]).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <p>
                  {r.autoBid ? (
                    <>
                      <strong>{money(r.maxBid)}</strong> maximum per vehicle
                    </>
                  ) : (
                    "Match alerts only · No automatic bids"
                  )}
                </p>
                <div className="rule-actions">
                  <button
                    onClick={() => setSelected(r.id)}
                    aria-pressed={selected === r.id}
                  >
                    View matches <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="secondary"
                    aria-label={`${r.active ? "Pause" : "Resume"} ${r.name}`}
                    onClick={() =>
                      updateRules(
                        rules.map((x) =>
                          x.id === r.id ? { ...x, active: !x.active } : x,
                        ),
                      )
                    }
                  >
                    {r.active ? <Pause size={17} /> : <Play size={17} />}
                    {r.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    className="quiet-button"
                    aria-label={`Edit ${r.name}`}
                    onClick={() => edit(r)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="quiet-button"
                    aria-label={`Delete ${r.name}`}
                    onClick={() => {
                      updateRules(rules.filter((x) => x.id !== r.id));
                      if (selected === r.id) setSelected("all");
                      if (draft?.id === r.id) cancel();
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!!rules.length && (
        <section className="rule-matches" aria-labelledby="matches-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MATCHED TO YOUR CRITERIA</p>
              <h2 id="matches-title">
                {selected === "all"
                  ? "Your buying opportunities"
                  : rules.find((r) => r.id === selected)?.name}
              </h2>
            </div>
            <button className="secondary" onClick={() => setSelected("all")}>
              All active rules
            </button>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
            />{" "}
            Include closed auctions
          </label>
          <p role="status">
            {matches.length} matching{" "}
            {matches.length === 1 ? "vehicle" : "vehicles"} · Results update
            automatically.
          </p>
          <div className="match-grid">
            {matches.map((v) => {
              const matching = displayRules.filter((r) => matchesRule(v, r));
              const caps = matching
                .filter((r) => r.active && r.autoBid)
                .map((r) => r.maxBid);
              const cap = caps.length ? Math.max(...caps) : null;
              const status = auctionStatus(v, now);
              const over =
                cap != null && minimumBid(v) > cap && status !== "Leading";
              return (
                <article className="match-card" key={v.id}>
                  <a
                    href={`?view=rules&vehicle=${v.id}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        navigate(v.id, "rules");
                      }
                    }}
                    aria-label={`Open ${v.year} ${v.make} ${v.model}, ${v.lot}`}
                  >
                    <Photo
                      src={illustration(v).src}
                      alt={illustration(v).alt}
                    />
                  </a>
                  <div>
                    <span className="eyebrow">
                      {v.lot} · {titleCase(v.body_style)}
                    </span>
                    <h3>
                      <a
                        href={`?view=rules&vehicle=${v.id}`}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            navigate(v.id, "rules");
                          }
                        }}
                      >
                        {v.year} {v.make} {v.model}
                      </a>
                    </h3>
                    <p>
                      {number(v.odometer_km)} km · Grade{" "}
                      {v.condition_grade.toFixed(1)} ·{" "}
                      {titleCase(v.title_status)} title
                    </p>
                    <div className="match-price">
                      <strong>{money(v.current_bid || v.starting_bid)}</strong>
                      <span className={`rule-state ${over ? "limit" : ""}`}>
                        {isClosed(v, now)
                          ? status
                          : over
                            ? "Above bid limit"
                            : status === "Leading"
                              ? "You’re leading"
                              : status === "Outbid"
                                ? "Outbid"
                                : cap
                                  ? "Auto-bid ready"
                                  : "Watching"}
                      </span>
                    </div>
                    <p className="muted">
                      {matching.map((r) => r.name).join(" · ")}
                    </p>
                    {cap != null && (
                      <p className="muted">
                        Auto-bid cap: {money(cap)} per vehicle
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {!matches.length && (
            <div className="empty panel">
              <Search size={30} />
              <h3>No matches right now</h3>
              <p>
                Try a wider year range or mileage limit. Saved criteria will
                continue to check the demo inventory while this app is open.
              </p>
            </div>
          )}
        </section>
      )}
      {!!activity.length && (
        <section className="activity-panel panel">
          <h2>
            <Zap size={22} /> Auto-bid activity
          </h2>
          <p className="muted">
            Latest actions this session. Accepted bids remain in My bids after
            reload.
          </p>
          <ol>
            {activity.slice(0, 12).map((a) => (
              <li key={a.id}>
                <Check size={18} />
                <div>
                  <strong>
                    {money(a.amount)} · {a.vehicle}
                  </strong>
                  <p>
                    {a.ruleName} · Limit {money(a.cap)} ·{" "}
                    {new Date(a.at).toLocaleTimeString("en-CA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  className="quiet-button"
                  onClick={() => navigate(a.vehicleId, "rules")}
                  aria-label={`View auto-bid on ${a.vehicle}`}
                >
                  <ArrowUpRight size={20} />
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
