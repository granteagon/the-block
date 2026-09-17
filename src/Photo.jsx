import React, { useState, useEffect } from "react";
export default function Photo({ src, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? (
    <div className="fallback">Photo unavailable</div>
  ) : (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}
