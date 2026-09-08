import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

export function EnterpriseButton({ className }) {
  const [open, setOpen] = useState(false);
  const noticeRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const noticeId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = event => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && (noticeRef.current?.contains(event.target) || triggerRef.current?.contains(event.target))) return;
      setOpen(false);
      if (event.type === "keydown") triggerRef.current?.focus();
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open]);
  return <>
    <button ref={triggerRef} type="button" className={className} aria-expanded={open} aria-controls={open ? noticeId : undefined}
      onClick={() => setOpen(value => !value)}>Enterprise</button>
    {open && createPortal(
      <section ref={noticeRef} id={noticeId} aria-labelledby={titleId} className="fixed top-24 left-4 right-4 z-[60] mx-auto max-w-sm rounded-2xl border border-zinc-700 bg-[#121215] p-6 text-zinc-100">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold text-balance">Enterprise — coming soon</h2>
          <button type="button" aria-label="Dismiss Enterprise message" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="flex min-h-11 min-w-11 -mt-2 -mr-2 items-center justify-center rounded-lg text-zinc-300 hover:text-white">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p role="status" className="mt-3 text-sm text-zinc-300 text-pretty">Enterprise plans are not available yet. Please check back for updates.</p>
      </section>, document.body,
    )}
  </>;
}
