import * as React from "react";
import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-2xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export default function PageShell({
  children,
  nav = null,
  width = "default",
  className,
}: {
  children: React.ReactNode;
  nav?: React.ReactNode;
  width?: keyof typeof widths;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      {nav}
      <main
        className={cn(
          widths[width],
          "mx-auto px-4 md:px-6 py-8 space-y-8 mobile-safe-bottom",
        )}
      >
        {children}
      </main>
    </div>
  );
}
