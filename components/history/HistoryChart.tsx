"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PumpReading } from "@/types/pump";
import { format } from "date-fns";

interface HistoryChartProps {
  readings: PumpReading[];
  metric?: "pressure" | "flow_rate" | "temperature" | "all";
}

export const HistoryChart = ({ readings, metric = "all" }: HistoryChartProps) => {
  const chartData = readings.map((reading) => ({
    timestamp: format(new Date(reading.timestamp), "MM/dd HH:mm"),
    pressure: reading.pressure,
    flow_rate: reading.flow_rate,
    temperature: reading.temperature,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
          <CardDescription>No data available for the selected range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No readings found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-border/50">
      <CardHeader>
        <CardTitle>Historical Data</CardTitle>
        <CardDescription>
          {metric === "all" ? "All metrics" : metric.replace("_", " ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {metric === "all" || metric === "pressure" ? (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pressure"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Pressure (PSI)"
                dot={false}
              />
            ) : null}
            {metric === "all" || metric === "flow_rate" ? (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="flow_rate"
                stroke="#22c55e"
                strokeWidth={2}
                name="Flow Rate (GPM)"
                dot={false}
              />
            ) : null}
            {metric === "all" || metric === "temperature" ? (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Temperature (°F)"
                dot={false}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
