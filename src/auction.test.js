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

test("auction deadline is enforced at confirmation time", () => {
  const timed = { ...vehicle, ends_at: 1000 };
  assert.equal(placeBid(timed, 12100, 999).current_bid, 12100);
  assert.throws(() => placeBid(timed, 12100, 1000), /closed/);
  assert.throws(() => placeBid(timed, 12100, 1001), /closed/);
});
test("competing bid preserves buyer amount and changes position", async () => {
  const { auctionStatus } = await import("./auction.js");
  const mine = placeBid(
    { ...vehicle, ends_at: 1000, reserve_price: 12000 },
    12100,
    100,
  );
  assert.equal(auctionStatus(mine, 100), "Leading");
  const rival = placeBid(mine, 12200, 200, "competitor");
  assert.equal(rival.my_bid, 12100);
  assert.equal(auctionStatus(rival, 200), "Outbid");
  assert.equal(auctionStatus(rival, 1000), "Lost");
  assert.equal(auctionStatus(mine, 1000), "Won (demo)");
  assert.equal(
    auctionStatus({ ...mine, reserve_price: 15000 }, 1000),
    "Reserve not met",
  );
});
test("schedule and countdown are deterministic and stop at closure", async () => {
  const { endTime, timeRemaining } = await import("./auction.js");
  assert.equal(endTime(1000, 0), 2701000);
  assert.ok(endTime(1000, 19) < 1000);
  assert.equal(timeRemaining(61000, 1000), "1m 00s");
  assert.equal(timeRemaining(1000, 1000), "Auction closed");
  assert.equal(timeRemaining(1000, 2000), "Auction closed");
});
