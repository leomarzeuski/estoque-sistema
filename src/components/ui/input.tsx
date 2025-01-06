"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", value, onChange, ...props }, ref) => {
    const showClearButton = !!value && type !== "date";

    const handleClear = () => {
      if (onChange) {
        const event = { target: { value: "" } };
        onChange(event as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
