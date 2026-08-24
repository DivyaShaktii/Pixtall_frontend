import { useEffect, useState } from "react";
import GalleryModal from "./GalleryModal";
import { API_BASE_URL } from "../utils/apiConfig";
import { mockGallerySessions } from "../data/mockGallery";

/**
 * Fetches this user's generated-image sessions from the backend
 * (GET /gallery?email=...), grouped server-side by generation run. Each
 * session's photos are pre-signed S3 URLs, ready to render directly.
 */
const GalleryPage = ({ email }) => {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [openSessionId, setOpenSessionId] = useState(null);

  useEffect(() => {
    if (!email) {
      setSessions([]);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    fetch(`${API_BASE_URL}/gallery?email=${encodeURIComponent(email)}`)
      .then(response => {
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (cancelled) return;
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, [email]);

  const openSession = sessions.find(s => s.id === openSessionId) ?? null;

  return (
    <div className="gallery-page">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Gallery</h1>
        <p className="text-slate text-lg">
          {status === "loading"
            ? "Loading…"
            : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
        </p>
      </header>

      {status === "error" && (
        <div className="gallery-empty-state">
          <span className="gallery-empty-icon">⚠</span>
          <p>Couldn&rsquo;t load your gallery right now. Try refreshing the page.</p>
        </div>
      )}

      {status === "ready" && sessions.length === 0 && (
        <div className="gallery-empty-state">
          <span className="gallery-empty-icon">🖼</span>
          <p>Nothing generated yet — head to Studio to create your first image.</p>
        </div>
      )}

      {status === "ready" && sessions.length > 0 && (
        <div className="gallery-grid">
          {sessions.map(session => (
            <button
              type="button"
              className="gallery-card"
              key={session.id}
              onClick={() => setOpenSessionId(session.id)}
            >
              <div className="gallery-card-image">
                <img src={session.photos[0]} alt="" loading="lazy" decoding="async" />
                <span className="gallery-card-badge">
                  {session.photos.length} photo{session.photos.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="gallery-card-info">
                <strong>{session.title}</strong>
                <span>{[session.tag, session.date].filter(Boolean).join(" · ")}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {openSession && (
        <GalleryModal session={openSession} onClose={() => setOpenSessionId(null)} />
      )}
    </div>
  );
};

export default GalleryPage;