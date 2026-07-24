import { useCallback, useRef, useState } from "react";

/**
 * Draggable raw-photo / studio-output comparison.
 * This is the product's single thesis rendered as an interaction:
 * one photo in, a marketplace-ready photo out. Drag or tap anywhere.
 */
const BeforeAfterSlider = ({
  beforeSrc,
  afterSrc,
  beforeLabel = "Raw upload",
  afterLabel = "Pixtall output",
  beforeAlt = "Unedited product photo",
  afterAlt = "Generated marketplace photo"
}) => {
  const [position, setPosition] = useState(58); // percent revealed of "after"
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef(null);

  const updateFromClientX = useCallback(clientX => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, pct)));
  }, []);

  const handlePointerDown = event => {
    setDragging(true);
    updateFromClientX(event.clientX);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerMove = event => {
    if (!dragging) return;
    updateFromClientX(event.clientX);
  };
  const stopDragging = () => setDragging(false);

  const handleKeyDown = event => {
    if (event.key === "ArrowLeft") setPosition(p => Math.max(2, p - 4));
    if (event.key === "ArrowRight") setPosition(p => Math.min(98, p + 4));
  };

  return (
    <div
      ref={frameRef}
      className="compare"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
      role="slider"
      aria-label="Drag to compare the raw upload with the generated result"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="compare-frame">
        <img src={afterSrc} alt={afterAlt} draggable="false" />
      </div>

      <div
        className="compare-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={beforeSrc} alt={beforeAlt} draggable="false" />
      </div>

      <span className="compare-tag tag-raw">{beforeLabel}</span>
      <span className="compare-tag tag-studio">{afterLabel}</span>

      <div className="compare-handle" style={{ left: `${position}%` }}>
        <div className="compare-handle-grip" aria-hidden="true" />
      </div>

      <span className="compare-hint">Drag to compare</span>
    </div>
  );
};

export default BeforeAfterSlider;