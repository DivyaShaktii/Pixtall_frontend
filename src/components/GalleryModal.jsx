const slugify = text => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const downloadImage = (src, filename) => {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const GalleryModal = ({ session, onClose }) => {
  const handleDownloadAll = () => {
    const base = slugify(session.title) || "pixstall-photo";
    session.photos.forEach((src, index) => {
      // Small stagger so browsers don't drop rapid-fire downloads.
      setTimeout(() => downloadImage(src, `${base}-${index + 1}.png`), index * 150);
    });
  };

  return (
    <div className="gallery-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-label={session.title}
        onClick={event => event.stopPropagation()}
      >
        <div className="gallery-modal-header">
          <div>
            <h3>{session.title} <span className="gallery-modal-tag">· {session.tag}</span></h3>
            <p className="gallery-modal-meta">
              {[session.model, session.category, session.aspect, session.date].filter(Boolean).join(" · ")}
              {session.quality && <span className="pill gallery-modal-pill">{session.quality}</span>}
            </p>
          </div>
          <div className="gallery-modal-actions">
            <button type="button" className="nav-btn" onClick={handleDownloadAll}>
              ⬇ Download all
            </button>
            <button type="button" className="gallery-close-btn" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="gallery-modal-grid">
          {session.photos.map((src, index) => (
            <div className="gallery-modal-photo" key={src + index}>
              <img src={src} alt={`${session.title}, photo ${index + 1} of ${session.photos.length}`} />
              <button
                type="button"
                className="gallery-modal-photo-download"
                aria-label="Download this photo"
                onClick={() => downloadImage(src, `${slugify(session.title) || "pixstall-photo"}-${index + 1}.png`)}
              >
                ⬇
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;