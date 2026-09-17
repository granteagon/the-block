import React from "react";
import { Clock3 } from "lucide-react";
import { auctionStatus, isClosed, timeRemaining } from "./auction";
export default function AuctionBadge({ vehicle, now }) {
  const closed = isClosed(vehicle, now),
    status = auctionStatus(vehicle, now);
  return (
    <div className="auction-line">
      <span
        className={
          closed
            ? "countdown closed"
            : vehicle.ends_at - now < 300000
              ? "countdown urgent"
              : "countdown"
        }
      >
        <Clock3 size={14} />
        {timeRemaining(vehicle.ends_at, now)}
      </span>
      {vehicle.my_bid && (
        <span
          className={`bid-status ${status === "Outbid" || status === "Lost" ? "attention" : status === "Won (demo)" ? "won" : closed ? "ended" : ""}`}
        >
          {status}
        </span>
      )}
    </div>
  );
}
