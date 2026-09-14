import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function MetricCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "danger" | "accent";
  className?: string;
}) {
  const valueClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "accent"
        ? "text-primary"
        : "text-foreground";

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-5 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-semibold tabular-nums tracking-tight", valueClass)}>
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
