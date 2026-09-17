export const minimumBid = (vehicle) =>
  vehicle.current_bid > 0 ? vehicle.current_bid + 100 : vehicle.starting_bid;
export const isClosed = (vehicle, now = Date.now()) =>
  Number.isFinite(vehicle.ends_at) && now >= vehicle.ends_at;
export function placeBid(vehicle, amount, now = Date.now(), actor = "buyer") {
  if (isClosed(vehicle, now))
    throw new Error("This auction has closed. No further bids are accepted.");
  if (!Number.isSafeInteger(amount) || amount < minimumBid(vehicle))
    throw new Error(
      `Enter a whole-dollar bid of at least ${minimumBid(vehicle).toLocaleString("en-CA")}.`,
    );
  return {
    ...vehicle,
    current_bid: amount,
    bid_count: vehicle.bid_count + 1,
    my_bid: actor === "buyer" ? amount : (vehicle.my_bid ?? null),
  };
}
export function auctionStatus(v, now = Date.now()) {
  const closed = isClosed(v, now);
  if (!v.my_bid) return closed ? "Closed" : "Open for bids";
  if (v.my_bid < v.current_bid) return closed ? "Lost" : "Outbid";
  if (closed)
    return v.current_bid >= v.reserve_price ? "Won (demo)" : "Reserve not met";
  return "Leading";
}
export function endTime(epoch, index) {
  return epoch + (index % 20 === 19 ? -5 : 45 + ((index * 7) % 120)) * 60_000;
}
export function timeRemaining(endsAt, now) {
  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000));
  if (!seconds) return "Auction closed";
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60),
    s = seconds % 60;
  return h
    ? `${h}h ${String(m).padStart(2, "0")}m`
    : `${m}m ${String(s).padStart(2, "0")}s`;
}
