"use client";

import { useState, useEffect } from "react";
import { usePumpHistory } from "@/hooks/usePumpHistory";
import { HistoryChart } from "@/components/history/HistoryChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PumpSelector } from "@/components/pumps/PumpSelector";
import { getPumps } from "@/lib/api/pumps";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Pump } from "@/types/pump";

export default function HistoryPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    startOfDay(subDays(new Date(), 7))
  );
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));
  const [metric, setMetric] = useState<"pressure" | "flow_rate" | "temperature" | "all">("all");

  useEffect(() => {
    const loadPumps = async () => {
      const allPumps = await getPumps();
      setPumps(allPumps);
      if (allPumps.length > 0 && !selectedPumpId) {
        setSelectedPumpId(allPumps[0].id);
      }
    };
    loadPumps();
  }, []);

  const { readings, loading } = usePumpHistory(startDate, endDate, selectedPumpId ?? undefined);

  const handleQuickRange = (days: number) => {
    setStartDate(startOfDay(subDays(new Date(), days)));
    setEndDate(endOfDay(new Date()));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-blue">History</h1>
          <p className="text-muted-foreground mt-1">
            View historical pump data and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-64">
            <PumpSelector
              pumps={pumps}
              selectedPumpId={selectedPumpId}
              onSelect={setSelectedPumpId}
            />
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={format(startDate, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={format(endDate, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(1)}
              >
                Last 24 Hours
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(7)}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(30)}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(90)}
              >
                Last 90 Days
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metric</Label>
              <select
                id="metric"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={metric}
                onChange={(e) =>
                  setMetric(
                    e.target.value as
                      | "pressure"
                      | "flow_rate"
                      | "temperature"
                      | "all"
                  )
                }
              >
                <option value="all">All Metrics</option>
                <option value="pressure">Pressure</option>
                <option value="flow_rate">Flow Rate</option>
                <option value="temperature">Temperature</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading historical data...
            </div>
          </CardContent>
        </Card>
      ) : (
        <HistoryChart readings={readings} metric={metric} />
      )}

      {/* Summary Stats */}
      {readings.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Readings</div>
                <div className="text-2xl font-bold">{readings.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Average Pressure
                </div>
                <div className="text-2xl font-bold">
                  {readings
                    .filter((r) => r.pressure !== null)
                    .reduce((sum, r) => sum + (r.pressure || 0), 0) /
                    readings.filter((r) => r.pressure !== null).length || 0}
                  {" PSI"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Average Flow Rate
                </div>
                <div className="text-2xl font-bold">
                  {readings
                    .filter((r) => r.flow_rate !== null)
                    .reduce((sum, r) => sum + (r.flow_rate || 0), 0) /
                    readings.filter((r) => r.flow_rate !== null).length || 0}
                  {" GPM"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
