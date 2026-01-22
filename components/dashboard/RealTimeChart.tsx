"use client";

import { useEffect, useState } from "react";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import * as demoApi from "@/lib/demo/demoApi";
import { getReadingsInRange } from "@/lib/api/pumpApi";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PumpReading } from "@/types/pump";
import { format, subMinutes } from "date-fns";

export const RealTimeChart = ({ metric = "pressure" }: { metric?: "pressure" | "flow_rate" | "temperature" }) => {
  const [data, setData] = useState<Array<{ time: string; value: number | null }>>([]);

  useEffect(() => {
    const isDemo = isDemoModeSync();

    // Fetch initial data (last 50 readings)
    const fetchInitialData = async () => {
      const endDate = new Date();
      const startDate = subMinutes(endDate, 60); // Last hour

      const readings = await getReadingsInRange(startDate, endDate);
      
      const chartData = readings
        .slice(-50) // Last 50 readings
        .map((reading: PumpReading) => ({
          time: format(new Date(reading.timestamp), "HH:mm:ss"),
          value: reading[metric],
        }));

      setData(chartData);
    };

    fetchInitialData();

    if (isDemo) {
      // Use demo real-time updates
      const cleanup = demoApi.setupDemoRealtime(
        (reading: PumpReading) => {
          setData((prev) => {
            const newData = [
              ...prev,
              {
                time: format(new Date(reading.timestamp), "HH:mm:ss"),
                value: reading[metric],
              },
            ];
            // Keep only last 50 points
            return newData.slice(-50);
          });
        },
        () => {}
      );

      return cleanup;
    } else {
      // Use Supabase real-time (will be handled by parent component or hook)
      // For now, just poll periodically
      const interval = setInterval(() => {
        fetchInitialData();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [metric]);

  const metricLabels = {
    pressure: { label: "Pressure", unit: " PSI" },
    flow_rate: { label: "Flow Rate", unit: " GPM" },
    temperature: { label: "Temperature", unit: "°F" },
  };

  const { label, unit } = metricLabels[metric];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time {label}</CardTitle>
        <CardDescription>Live {label.toLowerCase()} readings</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent-blue))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--accent-blue))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
              stroke="hsl(var(--border))"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--glass-bg-light)",
                backdropFilter: "blur(var(--glass-blur))",
                border: "none",
                borderRadius: "1.25rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any) =>
                value !== null && value !== undefined ? `${value}${unit}` : "N/A"
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--accent-blue))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--accent-teal))" }}
              animationDuration={400}
              animationEasing="ease-out"
              strokeLinecap="round"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#gradient-${metric})`}
              animationDuration={300}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
