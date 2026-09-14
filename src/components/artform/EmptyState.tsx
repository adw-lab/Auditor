import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action = null,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 space-y-3",
        className,
      )}
    >
      {Icon ? <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" /> : null}
      <h2 className="font-syne text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
