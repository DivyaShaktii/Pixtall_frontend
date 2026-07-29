import React, { useId } from "react";
import { motion } from "framer-motion";
import { transitions } from "../../lib/motion";

const SegmentedControl = ({ options, value, onChange, className = "" }) => {
  const uniqueId = useId();
  
  return (
    <div className={`flex items-center p-0.5 bg-cloud-2 border border-line-2 rounded-xl shadow-inner ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 flex items-center justify-center h-[34px] px-3 text-xs font-bold rounded-md transition-all duration-200 ${
              isActive ? "text-accent" : "text-slate hover:bg-cloud hover:text-ink"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-active-${uniqueId}`}
                className="absolute inset-0 bg-paper rounded-md shadow-sm border border-[#a3e635]/50 ring-1 ring-[#a3e635]"
                transition={transitions.springLayout}
              />
            )}
            <span className="relative z-10 whitespace-nowrap tracking-wide">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
