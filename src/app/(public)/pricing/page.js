// File: src/app/(public)/pricing/page.js
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPlans } from "@/lib/mock-data";

// Pricing page displaying subscription tiers.
export default async function PricingPage() {
  const plans = await fetchPlans();

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Choose the right plan</h1>
        <p className="mt-3 text-muted-foreground">
          Flexible pricing for individuals, teams, and enterprises looking to master their finances.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative flex h-full flex-col">
            {plan.name === "Professional" && <Badge className="absolute right-4 top-4">Popular</Badge>}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-semibold">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.billingCycle}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="w-full">Choose Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
