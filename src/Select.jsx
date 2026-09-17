import React from "react";
import { ChevronDown } from "lucide-react";

export default function Select({ children, ...props }) {
  return (
    <span className="select-control">
      <select {...props}>{children}</select>
      <ChevronDown size={18} aria-hidden="true" />
    </span>
  );
}
