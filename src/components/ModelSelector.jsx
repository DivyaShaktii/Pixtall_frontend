import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PAGE_SIZE = 5;

const ModelSelector = ({ models, selectedModel, selectedModelImage, onModelChange, onModelImageChange, compact }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [userImages, setUserImages] = useState([]); // data: URLs uploaded by the user
  const uploadRef = useRef(null);

  const modelConfig = useMemo(
    () => models.find(m => m.value === selectedModel),
    [models, selectedModel]
  );

  // Reset pagination when switching male ↔ female
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedModel]);

  const handleTypeChange = value => {
    onModelChange(value);
    onModelImageChange("");
    if (value !== "none") setIsOpen(true);
  };

  const handleSelect = imagePath => {
    onModelImageChange(imagePath);
    setIsOpen(false);
  };

  const handleUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setUserImages(prev => [dataUrl, ...prev]);
      handleSelect(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // reset so the same file can be re-chosen
  };

  // User uploads appear first so they're always visible
  const allImages = useMemo(
    () => [...userImages, ...(modelConfig?.images ?? [])],
    [userImages, modelConfig]
  );
  const visibleImages = allImages.slice(0, visibleCount);
  const remaining = allImages.length - visibleCount;

  /* ── shared modal — rendered via Portal to escape any overflow/stacking ancestor ── */
  const modalContent = isOpen && modelConfig?.folder && (
    <div className="model-modal-overlay" role="presentation" onClick={() => setIsOpen(false)}>
      <div
        className="model-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Select ${modelConfig.label} model`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="model-modal-header">
          <div>
            <p className="eyebrow">Model reference</p>
            <h3>Choose a {modelConfig.label} model</h3>
            <p>Pick a preset photo or upload your own.</p>
          </div>
          <button
            type="button"
            className="model-close-btn"
            aria-label="Close"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Upload own photo */}
        <label className="model-upload-own" title="Upload your own model photo">
          <span className="model-upload-own-icon">📷</span>
          <div>
            <strong>Upload your own photo</strong>
            <span>JPG, PNG or WEBP — replaces the reference</span>
          </div>
          <span className="model-upload-own-btn">Browse</span>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </label>

        {/* Thumbnail grid */}
        <div className="model-picker-grid">
          {visibleImages.map(imagePath => (
            <button
              key={imagePath}
              type="button"
              aria-label="Select this model"
              className={`model-picker-thumb ${selectedModelImage === imagePath ? "active" : ""}`}
              onClick={() => handleSelect(imagePath)}
            >
              <img src={imagePath} alt="" loading="lazy" decoding="async" />
              {selectedModelImage === imagePath && (
                <span className="model-thumb-check" aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Load more */}
        {remaining > 0 && (
          <button
            type="button"
            className="model-load-more"
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
          >
            Load more · {remaining} remaining
          </button>
        )}
      </div>
    </div>
  );

  const modal = modalContent ? createPortal(modalContent, document.body) : null;

  if (compact) {
    return (
      <>
        <div className="config-field-item config-model-field">
          <label>Model</label>
          <div className="model-compact-controls">
            {models.map(m => (
              <button
                key={m.value}
                type="button"
                className={`model-compact-btn ${selectedModel === m.value ? "active" : ""}`}
                onClick={() => handleTypeChange(m.value)}
              >
                {m.label}
              </button>
            ))}
            {modelConfig?.folder && (
              <button
                type="button"
                aria-label="Pick model image"
                className={`model-compact-pick ${selectedModelImage ? "has-image" : ""}`}
                onClick={() => setIsOpen(true)}
              >
                {selectedModelImage
                  ? <img src={selectedModelImage} alt="Selected model" decoding="async" />
                  : <span>＋</span>}
              </button>
            )}
          </div>
        </div>
        {modal}
      </>
    );
  }

  /* ── full mode (form card) ── */
  return (
    <div className="field field-span-full stagger field-card model-selector-card">
      <label>Model type</label>
      <p className="field-hint">Add a human model reference image (optional)</p>
      <div className="model-type-row">
        {models.map(m => (
          <button
            key={m.value}
            type="button"
            className={`model-type-btn ${selectedModel === m.value ? "active" : ""}`}
            onClick={() => handleTypeChange(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {selectedModel === "none" && (
        <p className="pill" style={{ marginTop: 12, alignSelf: "flex-start" }}>No model image required</p>
      )}
      {modelConfig?.folder && (
        <div className="model-selected-row">
          {selectedModelImage ? (
            <>
              <div className="model-selected-thumb">
                <img src={selectedModelImage} alt="Selected model" decoding="async" />
              </div>
              <div className="model-selected-info">
                <span className="pill">Model selected</span>
                <button type="button" className="model-change-btn" onClick={() => setIsOpen(true)}>
                  Change
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="model-pick-trigger" onClick={() => setIsOpen(true)}>
              <span className="model-pick-icon">+</span>
              Choose {modelConfig.label} model image
            </button>
          )}
        </div>
      )}
      {modal}
    </div>
  );
};

export default ModelSelector;
