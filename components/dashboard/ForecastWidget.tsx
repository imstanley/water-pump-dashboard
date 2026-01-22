"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { PumpReading } from "@/types/pump";

interface ForecastWidgetProps {
  readings: PumpReading[];
  metric: "pressure" | "flow_rate" | "temperature";
  title: string;
  unit: string;
}

export const ForecastWidget = ({ readings, metric, title, unit }: ForecastWidgetProps) => {
  const data = readings
    .slice(-7) // Last 7 readings
    .map((reading) => ({
      date: new Date(reading.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: reading[metric] ?? 0,
    }));

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 p-6 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 hover:border-slate-400/60 dark:hover:border-slate-600/50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-blue-500/3 dark:from-purple-500/5 dark:to-blue-500/5" />
      
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400">7 day</div>
      </div>
      <div className="relative z-10 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" opacity={0.3} />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
              label={{ value: unit, angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                backdropFilter: "blur(12px)",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                color: "hsl(var(--foreground))",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ r: 5, fill: "#60a5fa", strokeWidth: 2, stroke: "#1e3a8a" }}
              activeDot={{ r: 7, fill: "#8b5cf6", strokeWidth: 2, stroke: "#4c1d95" }}
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
