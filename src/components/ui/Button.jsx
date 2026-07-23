import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-ink text-white hover:bg-ink-2",
    primary: "bg-accent text-white hover:bg-accent-ink",
    outline: "border border-line bg-transparent hover:bg-cloud",
    ghost: "bg-transparent hover:bg-cloud",
    danger: "bg-danger text-white hover:bg-danger/90",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10 p-2 flex items-center justify-center"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
