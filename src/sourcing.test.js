import test from "node:test";
import assert from "node:assert/strict";
import {
  matchesRule,
  validateRule,
  autoBidPlan,
  loadRules,
  saveRules,
} from "./sourcing.js";
const car = {
  id: "civic",
  year: 2020,
  make: "Honda",
  model: "Civic",
  body_style: "sedan",
  odometer_km: 80000,
  condition_grade: 3.5,
  title_status: "Clean",
  starting_bid: 10000,
  current_bid: 11000,
  bid_count: 3,
  ends_at: 2000,
};
const input = {
  id: "rule",
  name: "Civics",
  active: true,
  autoBid: true,
  body: "",
  make: "Honda",
  model: "Civic",
  title: "",
  yearMin: 2020,
  yearMax: 2020,
  maxMileage: 80000,
  minCondition: 3.5,
  maxBid: 12000,
};
const rule = validateRule(input, [car]);
test("optional criteria and inclusive year, mileage and condition bounds", () => {
  assert.equal(matchesRule(car, rule), true);
  for (const change of [
    { year: 2019 },
    { year: 2021 },
    { odometer_km: 80001 },
    { condition_grade: 3.4 },
    { make: "Toyota" },
    { model: "Accord" },
  ])
    assert.equal(matchesRule({ ...car, ...change }, rule), false);
  const any = validateRule(
    {
      ...input,
      make: "",
      model: "",
      yearMin: null,
      yearMax: null,
      maxMileage: null,
      minCondition: null,
    },
    [car],
  );
  assert.equal(
    matchesRule(
      { ...car, year: 2018, odometer_km: 200000, condition_grade: 1 },
      any,
    ),
    true,
  );
  assert.equal(matchesRule(car, { ...rule, body: "truck" }), false);
  assert.equal(matchesRule(car, { ...rule, title: "Salvage" }), false);
});
test("rules reject invalid numbers, impossible ranges, unknown choices and missing auto-bid limits", () => {
  for (const change of [
    { maxBid: null },
    { maxBid: -1 },
    { maxBid: 12000.5 },
    { maxBid: Infinity },
    { maxMileage: -1 },
    { yearMin: 2021 },
    { model: "Accord" },
    { active: "true" },
    { body: "unknown" },
    { name: "" },
  ])
    assert.throws(() => validateRule({ ...input, ...change }, [car]));
  assert.equal(
    validateRule({ ...input, autoBid: false, maxBid: null }, [car]).maxBid,
    null,
  );
});
test("auto-bids use minimum price, apply to every match and never bid against self", () => {
  const plan = autoBidPlan(
    [car, { ...car, id: "second", current_bid: 0 }],
    [rule],
    1000,
  );
  assert.deepEqual(
    plan.map((p) => p.amount),
    [11100, 10000],
  );
  assert.equal(
    autoBidPlan(
      plan.map((p) => p.updated),
      [rule],
      1000,
    ).length,
    0,
  );
  assert.equal(car.current_bid, 11000);
});
test("competing bids trigger a response only within the cap; deadline and pause are enforced", () => {
  assert.equal(
    autoBidPlan(
      [{ ...car, current_bid: 11900, my_bid: 11800 }],
      [rule],
      1000,
    )[0].amount,
    12000,
  );
  assert.equal(
    autoBidPlan([{ ...car, current_bid: 12000, my_bid: 11900 }], [rule], 1000)
      .length,
    0,
  );
  assert.equal(autoBidPlan([car], [rule], 2000).length, 0);
  assert.equal(
    autoBidPlan([car], [{ ...rule, active: false }], 1000).length,
    0,
  );
  assert.equal(
    autoBidPlan([car], [{ ...rule, autoBid: false }], 1000).length,
    0,
  );
});
test("overlapping rules produce one bid per vehicle, using highest applicable cap", () => {
  const plan = autoBidPlan(
    [car],
    [
      { ...rule, maxBid: 11500 },
      { ...rule, id: "higher", maxBid: 12500 },
    ],
    1000,
  );
  assert.equal(plan.length, 1);
  assert.equal(plan[0].cap, 12500);
  assert.equal(plan[0].ruleId, "higher");
});
test("saved rules round trip; corrupt rules are discarded rather than broadened", () => {
  let raw;
  const store = {
    getItem: () => raw,
    setItem: (_, x) => {
      raw = x;
    },
  };
  assert.equal(saveRules([rule], store), true);
  assert.deepEqual(loadRules([car], store), [rule]);
  raw = JSON.stringify([
    rule,
    rule,
    { ...rule, id: "bad", maxMileage: "nope" },
  ]);
  assert.deepEqual(loadRules([car], store), [rule]);
  raw = "{";
  assert.deepEqual(loadRules([car], store), []);
  assert.equal(
    saveRules([], {
      setItem() {
        throw Error();
      },
    }),
    false,
  );
  assert.deepEqual(
    loadRules([car], {
      getItem() {
        throw Error();
      },
    }),
    [],
  );
});
