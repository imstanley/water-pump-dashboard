"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighlightWidgetProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  children?: React.ReactNode;
}

export const HighlightWidget = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  className,
  children,
}: HighlightWidgetProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 p-6 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-slate-400/60 dark:hover:border-slate-600/50 hover:scale-[1.02]",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/3 group-hover:to-purple-500/3 dark:group-hover:from-blue-500/5 dark:group-hover:to-purple-500/5 transition-all duration-300" />
      
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 p-3 backdrop-blur-sm border border-blue-400/20 dark:border-blue-400/20">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</span>
        </div>
        {trend && trendValue && (
          <div
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-md",
              trend === "up" && "bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/30 dark:border-green-500/30",
              trend === "down" && "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/30 dark:border-red-500/30",
              trend === "neutral" && "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20 dark:border-slate-500/30"
            )}
          >
            {trend === "up" && "↑"} {trend === "down" && "↓"} {trendValue}
          </div>
        )}
      </div>

      <div className="relative z-10 mb-2">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {typeof value === "number" ? value.toFixed(1) : value}
          {unit && <span className="ml-2 text-lg font-normal text-slate-500 dark:text-slate-400">{unit}</span>}
        </div>
      </div>

      {children && <div className="relative z-10 mt-3">{children}</div>}
    </div>
  );
};
