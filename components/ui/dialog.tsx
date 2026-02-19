"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const Dialog = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Dialog: overflow-hidden keeps scrollbar inside rounded corners */}
      <div
        ref={dialogRef}
        className={cn(
          "relative z-50 flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden",
          "rounded-xl glass-panel shadow-elevated",
          "animate-scale-in",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable area: inset 6px from top and bottom so scrollbar arrows stay inside rounded corners */}
        <div className="mt-[6px] mb-[6px] flex-1 min-h-0 overflow-y-auto overflow-x-hidden rounded-b-xl">
          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between px-4 py-3 border-b border-border">
              <div className="flex-1">
                {title && (
                  <h2 className="text-xl font-bold gradient-text-blue">{title}</h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center bg-foreground text-background hover:opacity-80 transition-opacity"
                aria-label="Close dialog"
                title="Close"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
