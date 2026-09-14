"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, MetricCard, PageHeader, PageShell } from "@/components/artform";

export default function HomePage() {
  const [rows, setRows] = useState(true);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Artform · D20 Digital Automation"
        title="Quiet tools people actually finish using"
        description="This is the Artform GitHub template. Layouts can differ. The palette, type, cards, and one-primary-action rule stay the same so every D20 app feels like one product."
        action={
          <Button type="button" onClick={() => setRows((v) => !v)}>
            {rows ? "Show empty state" : "Show table"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Open commitments"
          value="$1.24M"
          hint="Material the design has already promised."
        />
        <MetricCard
          label="Contingency left"
          value="18%"
          hint="Room to absorb a change without a conversation."
          tone="accent"
        />
        <MetricCard
          label="Jobs needing a look"
          value="3"
          hint="Over budget on D20 labour."
          tone="danger"
        />
      </div>

      {rows ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-syne text-lg font-semibold tracking-tight">This week</h2>
            <p className="text-sm text-muted-foreground">
              One table. Money in tabular numerals. No decorative charts.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">Job</th>
                    <th className="py-2 font-medium">D20</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr className="border-b border-border">
                    <td className="py-3">00001 SAMPLE</td>
                    <td className="py-3">$42,100 of $48,000</td>
                    <td className="py-3">On track</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">00002 SAMPLE</td>
                    <td className="py-3">$61,400 of $55,000</td>
                    <td className="py-3">Over — talk to PM</td>
                  </tr>
                  <tr>
                    <td className="py-3">00003 SAMPLE</td>
                    <td className="py-3">$12,800 of $40,000</td>
                    <td className="py-3">On track</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button">Primary action</Button>
              <Button type="button" variant="outline">
                Secondary
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Inbox}
          title="Nothing needs you right now"
          description="Empty is a designed state. Rename this page and wire real data — keep the tokens."
          action={
            <Button type="button" variant="outline" onClick={() => setRows(true)}>
              Back to the table
            </Button>
          }
        />
      )}
    </PageShell>
  );
}
