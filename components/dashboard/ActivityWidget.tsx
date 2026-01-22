"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { PumpAlert } from "@/types/pump";
import { cn } from "@/lib/utils";

interface ActivityWidgetProps {
  alerts: PumpAlert[];
  maxItems?: number;
}

export const ActivityWidget = ({ alerts, maxItems = 5 }: ActivityWidgetProps) => {
  const recentAlerts = alerts
    .filter((a) => !a.acknowledged)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, maxItems);

  const getIcon = (severity: PumpAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  if (recentAlerts.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 p-6 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-blue-500/3 dark:from-purple-500/5 dark:to-blue-500/5" />
        <div className="relative z-10">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 p-6 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 hover:border-slate-400/60 dark:hover:border-slate-600/50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-blue-500/3 dark:from-purple-500/5 dark:to-blue-500/5" />
      
      <div className="relative z-10 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="relative z-10 space-y-3">
        {recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 rounded-xl p-4 transition-all duration-300 ease-out hover:scale-[1.02] border backdrop-blur-sm",
              alert.severity === "critical" && "bg-red-500/8 border-red-500/20 hover:bg-red-500/12 dark:bg-red-500/10 dark:hover:bg-red-500/15",
              alert.severity === "warning" && "bg-yellow-500/8 border-yellow-500/20 hover:bg-yellow-500/12 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/15",
              alert.severity === "info" && "bg-blue-500/8 border-blue-500/20 hover:bg-blue-500/12 dark:bg-blue-500/10 dark:hover:bg-blue-500/15"
            )}
          >
            {getIcon(alert.severity)}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.message}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
