import React from "react";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { DownloadSimple, X } from "@phosphor-icons/react";

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

  // If there's no explicitly saved sourceImage, use a placeholder so the slider works
  const sourceImage = session.sourceImage || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/90 backdrop-blur-md p-6" role="presentation" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-full bg-cloud border border-line rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={session.title}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-line bg-cloud shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-ink mb-1 flex items-center gap-3">
              {session.title} 
              <span className="text-xs font-semibold px-2 py-1 bg-cloud-2 text-slate rounded uppercase tracking-wider">{session.tag}</span>
            </h3>
            <p className="text-sm text-slate">
              {[session.model, session.category, session.aspect, session.date].filter(Boolean).join(" · ")}
              {session.quality && <span className="ml-2 px-2 py-0.5 border border-line rounded text-xs">{session.quality}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center gap-2 bg-cloud-2 hover:bg-line text-ink px-4 py-2 rounded-lg font-medium text-sm transition-colors" onClick={handleDownloadAll}>
              <DownloadSimple size={16} weight="bold" /> Download all
            </button>
            <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-cloud-2 hover:bg-danger hover:text-white transition-colors" aria-label="Close" onClick={onClose}>
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-paper/50 flex flex-col gap-8">
          {/* FASHN style Session View: Large BeforeAfterSlider for the hero generation */}
          {session.photos.length > 0 && (
            <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-line shadow-lg bg-paper aspect-[4/5] md:aspect-video">
              <BeforeAfterSlider 
                beforeSrc={sourceImage}
                afterSrc={session.photos[0]}
                beforeLabel="Source Material"
                afterLabel="Generation"
              />
            </div>
          )}

          {/* Grid for additional variations if they exist */}
          {session.photos.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-slate uppercase tracking-wider mb-4 px-2">All Variations</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {session.photos.map((src, index) => (
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-line bg-cloud relative group" key={src + index}>
                    <img src={src} alt={`${session.title}, photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                      aria-label="Download this photo"
                      onClick={() => downloadImage(src, `${slugify(session.title) || "pixstall-photo"}-${index + 1}.png`)}
                    >
                      <DownloadSimple size={14} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;