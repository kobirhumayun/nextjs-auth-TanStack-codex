// File: src/components/features/pricing/plan-selection.jsx
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { qk } from "@/lib/query-keys";
import { createPlanOrder, submitManualPayment } from "@/lib/api/pricing";

const manualPaymentDefaults = {
  amount: "",
  reference: "",
  notes: "",
};

const formatCurrency = (value) => {
  if (!value || typeof value !== "string") return value;
  const normalized = value.trim();
  if (!normalized || /^\D*$/.test(normalized)) return normalized;
  const parsed = Number(normalized.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(parsed)) return normalized;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parsed);
  } catch {
    return normalized;
  }
};

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (error.body) {
    if (typeof error.body === "string") return error.body;
    if (error.body?.message) return error.body.message;
    if (Array.isArray(error.body?.errors) && error.body.errors[0]?.message) {
      return error.body.errors[0].message;
    }
  }
  return error.message || fallback;
};

const invalidatePricingQueries = (queryClient) => {
  [qk.plans.current(), qk.plans.all()].forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

// Interactive pricing widget that allows customers to checkout or request manual invoicing.
export default function PlanSelection({ plans = [] }) {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? null);
  const [manualPayment, setManualPayment] = useState(manualPaymentDefaults);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId]
  );

  const createOrderMutation = useMutation({
    mutationFn: ({ planId }) => createPlanOrder({ planId }),
    onSuccess: (_data, variables) => {
      toast.success(`Plan "${plans.find((plan) => plan.id === variables.planId)?.name || ""}" activated.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to start checkout. Please try again."));
    },
    onSettled: () => {
      invalidatePricingQueries(queryClient);
    },
  });

  const manualPaymentMutation = useMutation({
    mutationFn: (payload) => submitManualPayment(payload),
    onSuccess: () => {
      toast.success("Manual payment submitted for review.");
      setManualPayment(manualPaymentDefaults);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to submit manual payment."));
    },
    onSettled: () => {
      invalidatePricingQueries(queryClient);
    },
  });

  const handlePlanCheckout = async (plan) => {
    setSelectedPlanId(plan.id);
    await createOrderMutation.mutateAsync({ planId: plan.id });
  };

  const handleManualPaymentSubmit = async (event) => {
    event.preventDefault();
    if (!manualPayment.amount || !manualPayment.reference) {
      toast.error("Amount and payment reference are required.");
      return;
    }
    await manualPaymentMutation.mutateAsync({
      ...manualPayment,
      planId: selectedPlan?.id ?? null,
    });
  };

  const isCreatingOrder = createOrderMutation.isPending;
  const isSubmittingManualPayment = manualPaymentMutation.isPending;

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlan?.id;
          const isProcessing = isCreatingOrder && plan.id === createOrderMutation.variables?.planId;
          return (
            <Card
              key={plan.id}
              className={`relative flex h-full flex-col ${isSelected ? "border-primary shadow-lg" : ""}`}
            >
              {isSelected && <span className="absolute right-4 top-4 text-xs font-medium text-primary">Selected</span>}
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
                  {plan.features?.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  className="w-full"
                  onClick={() => handlePlanCheckout(plan)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : isSelected ? "Continue" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Manual payment</CardTitle>
          <CardDescription>
            Request an invoice or submit proof of payment for {selectedPlan?.name || "a plan"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="text"
                inputMode="decimal"
                placeholder="$249.00"
                value={manualPayment.amount}
                onChange={(event) =>
                  setManualPayment((previous) => ({ ...previous, amount: event.target.value }))
                }
                disabled={isSubmittingManualPayment}
              />
              {manualPayment.amount && (
                <p className="text-xs text-muted-foreground">{formatCurrency(manualPayment.amount)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-reference">Payment reference</Label>
              <Input
                id="payment-reference"
                placeholder="Transaction ID or receipt number"
                value={manualPayment.reference}
                onChange={(event) =>
                  setManualPayment((previous) => ({ ...previous, reference: event.target.value }))
                }
                disabled={isSubmittingManualPayment}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (optional)</Label>
              <Textarea
                id="payment-notes"
                rows={4}
                placeholder="Include bank, branch, and any supporting details to speed up review."
                value={manualPayment.notes}
                onChange={(event) =>
                  setManualPayment((previous) => ({ ...previous, notes: event.target.value }))
                }
                disabled={isSubmittingManualPayment}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingManualPayment}>
              {isSubmittingManualPayment ? "Submitting..." : "Submit manual payment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
