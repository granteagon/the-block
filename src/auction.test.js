import test from "node:test";
import assert from "node:assert/strict";
import { minimumBid, placeBid } from "./auction.js";
const vehicle = { starting_bid: 10000, current_bid: 12000, bid_count: 3 };
test("opening bid starts at asking price", () =>
  assert.equal(minimumBid({ ...vehicle, current_bid: 0 }), 10000));
test("existing bids require at least a $100 increase", () => {
  assert.equal(minimumBid(vehicle), 12100);
  for (const n of [12000, 12099, 12100.5, NaN, Infinity, -1])
    assert.throws(() => placeBid(vehicle, n));
});
test("accepted bids update price, count and buyer state without mutating inventory", () => {
  assert.deepEqual(placeBid(vehicle, 12500), {
    ...vehicle,
    current_bid: 12500,
    bid_count: 4,
    my_bid: 12500,
  });
  assert.equal(vehicle.current_bid, 12000);
});
