import React, { useEffect, useRef, useState } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Photo from "./Photo";
import { illustration } from "./media";
export default function Gallery({ vehicle: v }) {
  const stock = illustration(v);
  const photos = [
    { src: stock.src, label: stock.label },
    ...v.images.map((src, i) => ({
      src,
      label: `Dataset placeholder ${i + 1}`,
    })),
  ];
  const [index, setIndex] = useState(0),
    [open, setOpen] = useState(false);
  const dialog = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (open) {
      dialog.current.showModal();
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = overflow;
      };
    }
    dialog.current?.close();
  }, [open]);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  function move(direction) {
    setIndex((i) => (i + direction + photos.length) % photos.length);
  }
  const alt = photos[index].label + "; not a photo of this listed vehicle";
  return (
    <>
      <button
        className="hero-photo gallery-trigger"
        ref={trigger}
        aria-label="Open photo viewer"
        onClick={() => setOpen(true)}
      >
        <Photo key={photos[index].src} src={photos[index].src} alt={alt} />
        <span className="image-label">{photos[index].label}</span>
        <span className="expand-label">
          <Maximize2 size={18} /> View photos
        </span>
      </button>
      <div className="thumbnails" aria-label="Vehicle photos">
        {photos.map((p, i) => (
          <button
            key={p.src}
            className={index === i ? "active" : ""}
            aria-label={`Show ${p.label.toLowerCase()}`}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <Photo src={p.src} alt={p.label} />
          </button>
        ))}
      </div>
      <p className="muted">
        {stock.note} Paint, trim, equipment and condition may differ.
        This is a reference image, not the listed vehicle. Original dataset images remain available as placeholders.{" "}
        <a href={stock.url} target="_blank" rel="noreferrer">
          Photo: {stock.credit}
        </a>
        {" · "}<a href={stock.licenseUrl || stock.url} target="_blank" rel="noreferrer">{stock.license}</a>
        {" · Resized / JPEG conversion."}
      </p>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-labelledby="photo-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          }
        }}
      >
        <div className="lightbox-header">
          <h2 id="photo-title">
            {v.year} {v.make} {v.model} · Photo viewer
          </h2>
          <button aria-label="Close photo viewer" onClick={close}>
            <X size={24} />
          </button>
        </div>
        <div className="lightbox-image">
          <Photo key={photos[index].src} src={photos[index].src} alt={alt} />
        </div>
        <div className="lightbox-footer">
          <button aria-label="Previous photo" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <p aria-live="polite">
            {index + 1} / {photos.length} · {photos[index].label}
            <small>
              Not the actual vehicle. Do not use these images to assess
              condition.
            </small>
          </p>
          <button aria-label="Next photo" onClick={() => move(1)}>
            <ChevronRight />
          </button>
        </div>
      </dialog>
    </>
  );
}
