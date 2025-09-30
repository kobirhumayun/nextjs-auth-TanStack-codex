// File: src/lib/api/pricing.js
import { apiJSON } from "@/lib/api";

const PLAN_ORDER_ENDPOINT = "/api/plans/orders";
const MANUAL_PAYMENT_ENDPOINT = "/api/plans/manual-payments";

export const createPlanOrder = (payload) =>
  apiJSON(PLAN_ORDER_ENDPOINT, {
    method: "POST",
    body: payload,
  });

export const submitManualPayment = (payload) =>
  apiJSON(MANUAL_PAYMENT_ENDPOINT, {
    method: "POST",
    body: payload,
  });
