import React from "react";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-accent-line focus:border-accent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 pr-8 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-line focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm transition-all hover:border-line-2",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate">
        <CaretDown size={14} weight="bold" />
      </div>
    </div>
  );
});
Select.displayName = "Select";

export { Input, Select };
