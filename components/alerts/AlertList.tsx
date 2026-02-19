"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PumpAlert } from "@/types/pump";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface AlertListProps {
  alerts: PumpAlert[];
  onAcknowledge: (alertId: string) => Promise<boolean>;
  loading?: boolean;
  pumpNames?: Record<string, string>;
}

export const AlertList = ({ alerts, onAcknowledge, loading, pumpNames = {} }: AlertListProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white border-transparent";
      case "warning":
        return "bg-yellow-500 text-white border-transparent";
      case "info":
        return "bg-blue-500 text-white border-transparent";
      default:
        return "bg-muted text-muted-foreground border-transparent";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading alerts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No alerts found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={alert.acknowledged ? "opacity-60" : ""}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSeverityIcon(alert.severity)}
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {alert.message}
                    <Badge className={getSeverityBadgeClass(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    {pumpNames[alert.pump_id] && (
                      <span className="font-medium text-foreground/70">{pumpNames[alert.pump_id]}</span>
                    )}
                    {pumpNames[alert.pump_id] && <span>·</span>}
                    {format(new Date(alert.created_at), "PPpp")}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.pump_id && (
                  <Link href={`/pumps?selected=${alert.pump_id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Pump
                    </Button>
                  </Link>
                )}
                {!alert.acknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
                {alert.acknowledged && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Acknowledged
                    {alert.acknowledged_at && (
                      <span>
                        {format(new Date(alert.acknowledged_at), "PPpp")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
