// File: src/app/(public)/pricing/page.js
import PlanSelection from "@/components/features/pricing/plan-selection";
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
      <PlanSelection plans={plans} />
    </div>
  );
}
