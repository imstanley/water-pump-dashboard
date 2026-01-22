"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PumpReading } from "@/types/pump";

interface TomorrowWidgetProps {
  currentReading: PumpReading | null;
  predictedReading: PumpReading | null;
}

export const TomorrowWidget = ({ currentReading, predictedReading }: TomorrowWidgetProps) => {
  if (!currentReading || !predictedReading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 p-6 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 to-blue-500/3 dark:from-cyan-500/5 dark:to-blue-500/5" />
        <div className="relative z-10">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Next Period Preview</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">No prediction available</p>
        </div>
      </div>
    );
  }

  const getTrend = (current: number | null, predicted: number | null) => {
    if (!current || !predicted) return "neutral";
    if (predicted > current * 1.05) return "up";
    if (predicted < current * 0.95) return "down";
    return "neutral";
  };

  const pressureTrend = getTrend(currentReading.pressure, predictedReading.pressure);
  const flowTrend = getTrend(currentReading.flow_rate, predictedReading.flow_rate);

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "neutral" }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-500" />;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 p-6 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10 hover:border-slate-400/60 dark:hover:border-slate-600/50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 to-blue-500/3 dark:from-cyan-500/5 dark:to-blue-500/5" />
      
      <div className="relative z-10 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Next Period Preview</h3>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {predictedReading.pressure?.toFixed(0) ?? "—"}
          <span className="ml-2 text-lg font-normal text-slate-500 dark:text-slate-400">PSI</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Predicted reading</div>
      </div>
      
      <div className="relative z-10 space-y-3 pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Pressure</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {predictedReading.pressure?.toFixed(1) ?? "—"} PSI
            </span>
            <TrendIcon trend={pressureTrend} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Flow Rate</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {predictedReading.flow_rate?.toFixed(1) ?? "—"} GPM
            </span>
            <TrendIcon trend={flowTrend} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Temperature</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {predictedReading.temperature?.toFixed(1) ?? "—"} °F
          </span>
        </div>
      </div>
    </div>
  );
};
