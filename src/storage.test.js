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
