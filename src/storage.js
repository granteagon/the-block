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
          (bid.my_bid != null &&
            (!Number.isSafeInteger(bid.my_bid) ||
              bid.my_bid < vehicle.starting_bid ||
              bid.my_bid > bid.current_bid))
        )
          return [];
        return [
          [
            vehicle.id,
            {
              current_bid: bid.current_bid,
              bid_count: bid.bid_count,
              my_bid: bid.my_bid ?? null,
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

export function loadPreferences(inventory, now = Date.now(), storage) {
  try {
    const saved = JSON.parse(
      (storage ?? window.localStorage).getItem("the-block-preferences") || "{}",
    );
    const ids = new Set(inventory.map((v) => v.id));
    return {
      epoch:
        Number.isFinite(saved?.epoch) && saved.epoch > 0 && saved.epoch <= now
          ? saved.epoch
          : now,
      watched: Array.isArray(saved?.watched)
        ? [...new Set(saved.watched.filter((id) => ids.has(id)))]
        : [],
      ends: Object.fromEntries(
        Object.entries(saved?.ends ?? {}).filter(
          ([id, value]) => ids.has(id) && Number.isFinite(value) && value > 0,
        ),
      ),
    };
  } catch {
    return { epoch: now, watched: [], ends: {} };
  }
}
export function savePreferences(preferences, storage) {
  try {
    (storage ?? window.localStorage).setItem(
      "the-block-preferences",
      JSON.stringify(preferences),
    );
    return true;
  } catch {
    return false;
  }
}
