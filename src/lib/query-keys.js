// File: src/lib/query-keys.js
export const qk = {
  orders: {
    list: (params) => ["orders", "list", params || {}],
    byId: (id) => ["orders", "byId", String(id)],
  },
  analytics: {
    summary: () => ["analytics", "summary"],
    slowReport: () => ["analytics", "slow-report"],
  },
  dashboard: {
    summary: () => ["dashboard", "summary"],
    recentTransactions: () => ["dashboard", "recent-transactions"],
  },
  projects: {
    list: () => ["projects", "list"],
    detail: (id) => ["projects", "detail", String(id)],
  },
  reports: {
    filters: () => ["reports", "filters"],
    charts: () => ["reports", "charts"],
    summaryTable: () => ["reports", "summary-table"],
  },
  plans: {
    all: () => ["plans", "all"],
    current: () => ["plans", "current"],
  },
  admin: {
    plans: () => ["admin", "plans"],
    payments: (filters) => {
      if (!filters || (typeof filters === "object" && Object.keys(filters).length === 0)) {
        return ["admin", "payments"];
      }
      if (typeof filters === "string") {
        return ["admin", "payments", filters];
      }
      if (typeof filters === "object") {
        const normalized = Object.keys(filters)
          .sort()
          .reduce((acc, key) => {
            acc[key] = filters[key];
            return acc;
          }, {});
        return ["admin", "payments", normalized];
      }
      return ["admin", "payments", filters];
    },
    users: () => ["admin", "users"],
    userProfile: (id) => ["admin", "users", String(id)],
  },
};
