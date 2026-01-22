"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  icon: LucideIcon;
  description?: string;
}

export const MetricCard = ({
  title,
  value,
  unit = "",
  icon: Icon,
  description,
}: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState<string | number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  const displayText = displayValue !== null && displayValue !== undefined 
    ? `${displayValue}${unit}` 
    : "N/A";

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border/50 hover:border-primary/50">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-indigo-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:via-indigo-50/30 group-hover:to-purple-50/50 transition-all duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-foreground/90">{title}</CardTitle>
        <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div 
          className={`text-2xl font-bold transition-all duration-300 ${
            isAnimating ? "scale-110 text-primary" : "scale-100"
          }`}
        >
          {displayText}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
