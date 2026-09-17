import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Gavel, Radio, X } from "lucide-react";

export default function Toast({ notice, dismiss }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(6000);
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;
  const paused = hovered || focused;

  useEffect(() => {
    if (paused) return;
    const started = performance.now();
    const timer = setTimeout(() => dismissRef.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [paused]);

  const Icon = { warning: AlertTriangle, closed: Gavel, info: Radio }[notice.tone] || CheckCircle2;
  return (
    <div
      className={`toast toast-${notice.tone}`}
      role={notice.tone === "warning" ? "alert" : "status"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Icon size={26} />
      <span><strong>{notice.title}</strong><span>{notice.message}</span></span>
      <button aria-label="Dismiss notification" onClick={dismiss}>
        <X size={18} />
      </button>
    </div>
  );
}
