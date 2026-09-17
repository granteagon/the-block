import test from "node:test";
import assert from "node:assert/strict";
import { loadBids, saveBids } from "./storage.js";
const inventory = [
  { id: "car", starting_bid: 100, current_bid: 200, bid_count: 1 },
];
test("blocked storage allows a clean start and reports persistence failure", () => {
  const storage = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  assert.deepEqual(loadBids(inventory, storage), {});
  assert.equal(saveBids({}, storage), false);
});
test("malformed and invalid saved bids are ignored", () => {
  for (const value of [
    "{",
    "null",
    '{"car":{"current_bid":201,"bid_count":2}}',
  ])
    assert.deepEqual(loadBids(inventory, { getItem: () => value }), {});
});
test("valid bids persist and unrelated saved fields cannot override vehicle data", () => {
  let value;
  const storage = {
    getItem: () => value,
    setItem: (key, next) => {
      value = next;
    },
  };
  assert.equal(
    saveBids(
      { car: { current_bid: 300, bid_count: 2, my_bid: 300, vin: "tampered" } },
      storage,
    ),
    true,
  );
  assert.deepEqual(loadBids(inventory, storage), {
    car: { current_bid: 300, bid_count: 2, my_bid: 300 },
  });
});

test("outbid positions survive reload", () => {
  const stored = { car: { current_bid: 500, bid_count: 4, my_bid: 300 } };
  assert.deepEqual(
    loadBids(inventory, { getItem: () => JSON.stringify(stored) }),
    stored,
  );
});
test("watchlist and clock preferences reject unknown or malformed values", async () => {
  const { loadPreferences, savePreferences } = await import("./storage.js");
  let raw = JSON.stringify({
    epoch: 100,
    watched: ["car", "car", "unknown"],
    ends: { car: 900, unknown: 500 },
  });
  const storage = {
    getItem: () => raw,
    setItem: (key, value) => {
      raw = value;
    },
  };
  const valid = loadPreferences(inventory, 200, storage);
  assert.deepEqual(valid, { epoch: 100, watched: ["car"], ends: { car: 900 } });
  assert.equal(savePreferences(valid, storage), true);
  assert.deepEqual(loadPreferences(inventory, 300, storage), valid);
  assert.deepEqual(loadPreferences(inventory, 300, { getItem: () => "{" }), {
    epoch: 300,
    watched: [],
    ends: {},
  });
  assert.equal(
    savePreferences(valid, {
      setItem() {
        throw Error("blocked");
      },
    }),
    false,
  );
});
