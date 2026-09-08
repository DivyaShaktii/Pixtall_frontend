import React from "react";
import { createPortal } from "react-dom";
import { WarningCircle, X } from "@phosphor-icons/react";

export function GenerationErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return createPortal(
    <div className="fixed top-20 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div role="alert" aria-atomic="true" className="pointer-events-auto flex items-start gap-3 w-full max-w-lg rounded-xl border border-red-400 bg-paper p-4 text-red-300">
        <WarningCircle size={24} className="shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 break-words text-sm font-medium leading-6">{message}</p>
        <button type="button" onClick={onDismiss} aria-label="Dismiss generation message" className="shrink-0 flex items-center justify-center min-w-10 min-h-10 -my-2 -mr-2 rounded-lg text-red-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
