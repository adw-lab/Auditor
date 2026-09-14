import * as React from "react";
import { cn } from "@/lib/utils";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action = null,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-2 min-w-0">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-syne text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </header>
  );
}
