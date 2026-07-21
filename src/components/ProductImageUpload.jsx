import { useEffect, useState } from "react";

const ProductImageUpload = ({ file, onFileChange, vertical }) => {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* ── vertical mode: stacked layout for narrow sidebar ── */
  if (vertical) {
    return (
      <div className="upload-vertical">
        <label htmlFor="product-image-v" className="upload-dropzone-v">
          <span className="upload-dropzone-icon">{file ? "✅" : "📦"}</span>
          <strong>{file ? "Image ready" : "Drop your product photo"}</strong>
          <p>JPG, PNG or WEBP &middot; max 10 MB</p>
          <span className="upload-btn-inline">{file ? "Replace" : "Choose image"}</span>
          <input
            id="product-image-v"
            type="file"
            accept="image/*"
            onChange={e => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        {preview && (
          <div className="upload-thumb-vertical">
            <div className="upload-thumb-wrap-v">
              <img src={preview} alt="Product preview" decoding="async" />
            </div>
            <p className="upload-filename" title={file?.name}>{file?.name}</p>
          </div>
        )}
      </div>
    );
  }

  /* ── horizontal mode (default): dropzone left, thumbnail right ── */
  return (
    <div className="field field-span-full stagger upload-card-shell">
      <label htmlFor="product-image" className="upload-card-label">Product image</label>
      <div className="upload-card">
        <label htmlFor="product-image" className="upload-dropzone">
          <span className="upload-dropzone-icon">{file ? "✅" : "📦"}</span>
          <strong>{file ? "Image ready" : "Upload your product photo"}</strong>
          <p>JPG, PNG or WEBP &middot; max 10 MB</p>
          <span className="upload-btn-inline">
            {file ? "Replace image" : "Choose image"}
          </span>
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={e => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="upload-preview-area">
          {preview ? (
            <>
              <div className="upload-thumb-wrap">
                <img src={preview} alt="Product preview" decoding="async" />
              </div>
              <p className="upload-filename" title={file?.name}>{file?.name}</p>
            </>
          ) : (
            <div className="upload-placeholder">
              <span>🖼</span>
              <p>Preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageUpload;
