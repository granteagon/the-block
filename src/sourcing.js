import { isClosed, minimumBid, placeBid } from "./auction.js";

const textFields = ["body", "make", "model", "title"];
const limits = {
  yearMin: [1900, 2100],
  yearMax: [1900, 2100],
  maxMileage: [0, 2000000],
  minCondition: [0, 5],
  maxBid: [1, 10000000],
};
export function validateRule(input, inventory) {
  if (!input || typeof input !== "object") throw Error("Invalid buying rule.");
  const rule = {
    id: input.id,
    name: typeof input.name === "string" ? input.name.trim() : "",
    active: input.active,
    autoBid: input.autoBid,
  };
  if (
    typeof rule.id !== "string" ||
    !rule.id ||
    !rule.name ||
    rule.name.length > 80
  )
    throw Error("Give this rule a name (up to 80 characters).");
  if (typeof rule.active !== "boolean" || typeof rule.autoBid !== "boolean")
    throw Error("Invalid rule status.");
  const options = {
    body: "body_style",
    make: "make",
    model: "model",
    title: "title_status",
  };
  for (const field of textFields) {
    if (typeof input[field] !== "string") throw Error(`Invalid ${field}.`);
    rule[field] = input[field];
    if (
      rule[field] &&
      !inventory.some(
        (v) =>
          v[options[field]] === rule[field] &&
          (field !== "model" || !input.make || v.make === input.make),
      )
    )
      throw Error(`Choose an available ${field}.`);
  }
  for (const [field, [min, max]] of Object.entries(limits)) {
    const value = input[field];
    if (value === "" || value == null) {
      rule[field] = null;
      continue;
    }
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (field !== "minCondition" && !Number.isSafeInteger(value))
    )
      throw Error(
        `Enter a valid ${field.replace(/([A-Z])/g, " $1").toLowerCase()} between ${min} and ${max}.`,
      );
    rule[field] = value;
  }
  if (
    rule.yearMin != null &&
    rule.yearMax != null &&
    rule.yearMin > rule.yearMax
  )
    throw Error("The earliest year must not be after the latest year.");
  if (rule.autoBid && rule.maxBid == null)
    throw Error("Set a maximum bid per vehicle before enabling auto-bid.");
  return rule;
}
export function matchesRule(v, r) {
  return (
    (!r.body || v.body_style === r.body) &&
    (!r.make || v.make === r.make) &&
    (!r.model || v.model === r.model) &&
    (!r.title || v.title_status === r.title) &&
    (r.yearMin == null || v.year >= r.yearMin) &&
    (r.yearMax == null || v.year <= r.yearMax) &&
    (r.maxMileage == null || v.odometer_km <= r.maxMileage) &&
    (r.minCondition == null || v.condition_grade >= r.minCondition)
  );
}
export function autoBidPlan(vehicles, rules, now) {
  return vehicles.flatMap((v) => {
    if (isClosed(v, now) || (v.my_bid != null && v.my_bid >= v.current_bid))
      return [];
    const amount = minimumBid(v);
    const rule = rules
      .filter(
        (r) =>
          r.active &&
          r.autoBid &&
          Number.isSafeInteger(r.maxBid) &&
          r.maxBid >= amount &&
          matchesRule(v, r),
      )
      .sort((a, b) => b.maxBid - a.maxBid)[0];
    if (!rule) return [];
    return [
      {
        vehicleId: v.id,
        ruleId: rule.id,
        ruleName: rule.name,
        amount,
        cap: rule.maxBid,
        updated: placeBid(v, amount, now),
      },
    ];
  });
}
const KEY = "the-block-buying-rules";
export function loadRules(inventory, storage) {
  try {
    const raw = JSON.parse(
      (storage ?? window.localStorage).getItem(KEY) || "[]",
    );
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw.flatMap((input) => {
      try {
        const rule = validateRule(input, inventory);
        if (seen.has(rule.id)) return [];
        seen.add(rule.id);
        return [rule];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export function saveRules(rules, storage) {
  try {
    (storage ?? window.localStorage).setItem(KEY, JSON.stringify(rules));
    return true;
  } catch {
    return false;
  }
}
