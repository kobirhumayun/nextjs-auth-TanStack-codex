// File: src/app/(user)/my-plan/page.js
"use client";

import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { qk } from "@/lib/query-keys";
import { fetchUserPlan } from "@/lib/mock-data";

// My Plan page highlighting subscription benefits and usage.
export default function MyPlanPage() {
  const { data, isLoading } = useQuery({ queryKey: qk.plans.current(), queryFn: fetchUserPlan });
  const plan = data?.currentPlan;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your subscription"
        description="Review the features available with your current plan and track usage."
      />
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{isLoading ? "Loading plan..." : plan?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {plan?.description || "Upgrade for more capabilities and advanced analytics."}
            </p>
          </div>
          <Badge variant="secondary">Renews on {data?.renewalDate}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-3xl font-semibold">{plan?.price}</p>
            <p className="text-sm text-muted-foreground">{plan?.billingCycle}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Included features</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {plan?.features?.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Usage overview</h3>
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data?.usage || {}).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="capitalize">{key}</TableCell>
                    <TableCell>{value.used}</TableCell>
                    <TableCell>{value.limit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline">Change Plan</Button>
            <Button>Contact Sales</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
