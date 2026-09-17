import { minimumBid } from "./auction.js";
const KEY = "the-block-bids";
export function loadBids(inventory, storage) {
  try {
    const saved = JSON.parse(
      (storage ?? window.localStorage).getItem(KEY) || "{}",
    );
    return Object.fromEntries(
      inventory.flatMap((vehicle) => {
        const bid = saved?.[vehicle.id];
        if (
          !Number.isSafeInteger(bid?.current_bid) ||
          bid.current_bid < minimumBid(vehicle) ||
          !Number.isSafeInteger(bid.bid_count) ||
          bid.bid_count <= vehicle.bid_count ||
          bid.my_bid !== bid.current_bid
        )
          return [];
        return [
          [
            vehicle.id,
            {
              current_bid: bid.current_bid,
              bid_count: bid.bid_count,
              my_bid: bid.my_bid,
            },
          ],
        ];
      }),
    );
  } catch {
    return {};
  }
}
export function saveBids(bids, storage) {
  try {
    (storage ?? window.localStorage).setItem(KEY, JSON.stringify(bids));
    return true;
  } catch {
    return false;
  }
}
