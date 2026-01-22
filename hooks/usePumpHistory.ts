"use client";

import { useState, useEffect } from "react";
import { getReadingsInRange } from "@/lib/api/pumpApi";
import type { PumpReading } from "@/types/pump";

export const usePumpHistory = (startDate: Date, endDate: Date) => {
  const [readings, setReadings] = useState<PumpReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getReadingsInRange(startDate, endDate);
        setReadings(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [startDate, endDate]);

  return { readings, loading };
};
