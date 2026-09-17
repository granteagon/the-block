export const minimumBid = (vehicle) =>
  vehicle.current_bid > 0 ? vehicle.current_bid + 100 : vehicle.starting_bid;
export function placeBid(vehicle, amount) {
  if (!Number.isSafeInteger(amount) || amount < minimumBid(vehicle))
    throw new Error(
      `Enter a whole-dollar bid of at least ${minimumBid(vehicle).toLocaleString("en-CA")}.`,
    );
  return {
    ...vehicle,
    current_bid: amount,
    bid_count: vehicle.bid_count + 1,
    my_bid: amount,
  };
}
