import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useFloating, offset, flip, shift, autoUpdate, size } from '@floating-ui/react';
import { useMotionVariants } from "../../lib/motion";

export default function HoverSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select", 
  onOptionHover,
  className = "",
  disabled = false
}) {
  const motionVariants = useMotionVariants();
  const [isOpen, setIsOpen] = useState(false);
  
  const { refs, floatingStyles, elements } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [
      offset(8), 
      flip({ padding: 8 }), 
      shift({ padding: 8 }),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(100, availableHeight)}px`,
          });
        },
        padding: 8,
      })
    ],
    whileElementsMounted: autoUpdate,
  });

  const selectedOption = options.find(o => o.value === value);

  const openMenu = () => {
    if (!disabled) setIsOpen(true);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
    if (onOptionHover) onOptionHover(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        elements.reference && !elements.reference.contains(event.target) &&
        elements.floating && !elements.floating.contains(event.target)
      ) {
        closeMenu();
      }
    };
    
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onOptionHover, elements.reference, elements.floating]);

  return (
    <>
      <style>{`
        .hover-select-trigger { background-color: var(--color-paper) !important; border: 1px solid var(--color-line) !important; color: var(--color-ink) !important; }
        .hover-select-trigger:hover { background-color: var(--color-cloud) !important; border-color: var(--color-accent) !important; }
        .hover-select-placeholder { color: var(--color-slate) !important; }
        .hover-select-option { color: var(--color-ink-2); background-color: transparent; }
        .hover-select-option:hover { background-color: var(--color-cloud); color: var(--color-ink); }
        .hover-select-active { background-color: var(--color-paper) !important; color: var(--color-accent) !important; font-weight: 700; border: 1px solid var(--color-accent) !important; box-shadow: var(--shadow-xs); }
      `}</style>
      <div className={`relative w-full min-w-[140px] ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={refs.setReference}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => isOpen ? closeMenu() : openMenu()}
          className={`group flex h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-sm focus:outline-none shadow-sm transition-all hover-select-trigger ${!selectedOption ? "hover-select-placeholder" : ""} ${disabled ? "pointer-events-none" : ""}`}
        >
          <span className="truncate pr-4">{selectedOption ? selectedOption.label : placeholder}</span>
          <CaretDown size={14} weight="bold" className={`transition-all duration-200 ${isOpen ? "rotate-180 text-ink" : "text-slate group-hover:text-ink"}`} />
        </button>

        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isOpen && (
              <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 9999 }}>
                <motion.div
                  variants={motionVariants.dropdown}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{
                    width: elements.reference ? Math.max(elements.reference.getBoundingClientRect().width, 120) : 'auto',
                  }}
                  className="bg-cloud/95 border border-line rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] overflow-y-auto max-h-[300px] py-1 backdrop-blur-xl"
                >
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        value === option.value ? "hover-select-active" : "hover-select-option"
                      }`}
                      onMouseEnter={() => onOptionHover && onOptionHover(option.value)}
                      onMouseLeave={() => onOptionHover && onOptionHover(null)}
                      onClick={() => {
                        onChange(option.value);
                        closeMenu();
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </>
  );
}
