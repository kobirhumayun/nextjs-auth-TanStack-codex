// lib/queries/admin-users.js
import { apiJSON } from "@/lib/api";
import { qk } from "@/lib/query-keys";

export const ADMIN_USERS_ENDPOINT = "/api/admin/users";

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.payload)) return value.payload;
  if (value?.data) return ensureArray(value.data);
  if (value?.result) return ensureArray(value.result);
  if (value?.payload) return ensureArray(value.payload);
  return [];
};

const extractId = (value) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.$oid) return extractId(value.$oid);
    if (value.$id) return extractId(value.$id);
    if (value._id) return extractId(value._id);
    if (value.id) return extractId(value.id);
  }
  return null;
};

const extractDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === "object") {
    if (value.$date) return extractDate(value.$date);
    if (value.date) return extractDate(value.date);
  }
  return null;
};

const formatDate = (value) => {
  const iso = extractDate(value);
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return date.toISOString().split("T")[0];
  } catch {
    return iso;
  }
};

const formatStatusLabel = (value) => {
  if (typeof value !== "string") return { code: null, label: "Unknown" };
  const normalized = value.trim().toLowerCase();
  if (!normalized) return { code: null, label: "Unknown" };
  const label = normalized
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
  return { code: normalized, label: label || value };
};

export const normalizeAdminUser = (user) => {
  if (!user || typeof user !== "object") return null;

  const id = extractId(user);
  const { code: statusCode, label: status } = formatStatusLabel(user.status ?? user.state ?? user.accountStatus);
  const registeredAt =
    formatDate(user.registeredAt) ||
    formatDate(user.createdAt) ||
    formatDate(user.joinedAt) ||
    formatDate(user.created_on) ||
    null;

  const planId =
    extractId(user.planId) ||
    extractId(user.plan?.id) ||
    extractId(user.plan?._id) ||
    (typeof user.plan === "string" ? user.plan : null);

  const planName =
    user.plan?.name ||
    user.planName ||
    user.plan?.planName ||
    (typeof user.plan === "string" ? user.plan : null);

  return {
    id: id ?? `user-${Date.now()}`,
    username:
      user.username ||
      user.name ||
      user.profile?.username ||
      user.profile?.name ||
      user.email ||
      "Unknown",
    email: user.email || user.profile?.email || "",
    planId,
    plan: planName || "Unknown",
    statusCode,
    status,
    registeredAt,
    lastLoginAt: formatDate(user.lastLoginAt) || formatDate(user.lastSeenAt) || null,
    raw: user,
  };
};

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

const normalizePagination = (pagination) => {
  if (!pagination || typeof pagination !== "object") return null;
  return {
    currentPage: pagination.currentPage ?? pagination.page ?? null,
    totalPages: pagination.totalPages ?? pagination.pageCount ?? null,
    totalItems: pagination.totalItems ?? pagination.total ?? null,
    itemsPerPage: pagination.itemsPerPage ?? pagination.limit ?? pagination.pageSize ?? null,
  };
};

export const adminUsersOptions = (filters = {}) => {
  const query = buildQueryString(filters);

  return {
    queryKey: query ? [...qk.admin.users(), filters] : qk.admin.users(),
    queryFn: async ({ signal }) => {
      const response = await apiJSON(`${ADMIN_USERS_ENDPOINT}${query}`, { signal });
      const items = ensureArray(response?.data ?? response?.items ?? response).map(normalizeAdminUser).filter(Boolean);

      return {
        items,
        raw: response,
        pagination: normalizePagination(response?.pagination),
        availableStatuses: Array.isArray(response?.availableStatuses)
          ? response.availableStatuses.map((item) => formatStatusLabel(item).code).filter(Boolean)
          : undefined,
      };
    },
    staleTime: 15_000,
  };
};

export const getAdminUserById = async (userId, { signal } = {}) => {
  if (!userId) throw new Error("userId is required");
  const response = await apiJSON(`${ADMIN_USERS_ENDPOINT}/${encodeURIComponent(userId)}`, { signal });
  const profile = normalizeAdminUser(response);
  return { profile, raw: response };
};

export const createAdminUser = (payload) =>
  apiJSON(ADMIN_USERS_ENDPOINT, {
    method: "POST",
    body: payload,
  });

export const updateAdminUser = (userId, payload) =>
  apiJSON(`${ADMIN_USERS_ENDPOINT}/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: payload,
  });

export const updateAdminUserStatus = (userId, status) =>
  apiJSON(`${ADMIN_USERS_ENDPOINT}/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: { status },
  });

export const resetAdminUserPassword = (userId, options = {}) => {
  const body = {};
  if (options?.redirectUri) {
    body.redirectUri = options.redirectUri;
  }
  return apiJSON(`${ADMIN_USERS_ENDPOINT}/${encodeURIComponent(userId)}/reset-password`, {
    method: "POST",
    body: Object.keys(body).length > 0 ? body : undefined,
  });
};

export const adminUserApiSpec = Object.freeze({
  listUsers: {
    summary: "List users",
    method: "GET",
    url: ADMIN_USERS_ENDPOINT,
    description: "Returns a paginated list of all customer accounts visible to administrators.",
    headers: {
      Authorization: "Bearer <access-token>",
      Accept: "application/json",
    },
    query: {
      search: "Optional string. Fuzzy matches username or email.",
      status: "Optional string. Filters by normalized status code (e.g. active, invited, suspended).",
      planId: "Optional string. Filters by plan identifier.",
      page: "Optional number. Defaults to 1.",
      pageSize: "Optional number. Defaults to 25.",
    },
    responses: {
      200: {
        body: {
          items: [
            {
              id: "68170801c901776f5f01d330",
              username: "kobirhumayun",
              email: "kobirhumayun@gmail.com",
              planId: "plan-pro",
              plan: "Professional",
              statusCode: "active",
              status: "Active",
              registeredAt: "2024-03-18",
              lastLoginAt: "2024-12-01",
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 12,
            totalItems: 296,
            itemsPerPage: 25,
          },
          availableStatuses: ["active", "invited", "suspended"],
        },
      },
    },
  },
  getUser: {
    summary: "Get a single user",
    method: "GET",
    url: `${ADMIN_USERS_ENDPOINT}/{userId}`,
    description: "Fetches the latest profile details for a specific user.",
    headers: {
      Authorization: "Bearer <access-token>",
      Accept: "application/json",
    },
    responses: {
      200: {
        body: {
          id: "68170801c901776f5f01d330",
          username: "kobirhumayun",
          email: "kobirhumayun@gmail.com",
          planId: "plan-pro",
          plan: "Professional",
          statusCode: "active",
          status: "Active",
          registeredAt: "2024-03-18",
          lastLoginAt: "2024-12-01",
          raw: {
            // Full payload from the upstream service. This mirrors the database schema
          },
        },
      },
    },
  },
  createUser: {
    summary: "Create a user",
    method: "POST",
    url: ADMIN_USERS_ENDPOINT,
    description: "Creates a new customer account and optionally assigns an initial plan.",
    headers: {
      Authorization: "Bearer <access-token>",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    requestBody: {
      username: "Required string. Unique username displayed in the UI.",
      email: "Required string. Must be a valid email address.",
      password: "Optional string. If omitted, the user will receive an invite email to set their password.",
      planId: "Optional string. Assigns the user to a pricing plan.",
      status: "Optional string. Defaults to active.",
    },
    responses: {
      201: {
        body: {
          id: "68170c9ac901776f5f01d37b",
          username: "analyticspro",
          email: "analytics@example.com",
          planId: "plan-enterprise",
          plan: "Enterprise",
          statusCode: "invited",
          status: "Invited",
          registeredAt: "2025-01-05",
        },
      },
    },
  },
  updateUser: {
    summary: "Update profile",
    method: "PATCH",
    url: `${ADMIN_USERS_ENDPOINT}/{userId}`,
    description: "Updates core profile fields or plan assignment for an existing user.",
    headers: {
      Authorization: "Bearer <access-token>",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    requestBody: {
      username: "Optional string.",
      email: "Optional string.",
      planId: "Optional string.",
      status: "Optional string. Updates the account status if supplied.",
    },
    responses: {
      200: {
        body: {
          id: "68170801c901776f5f01d330",
          username: "kobirhumayun",
          email: "kobirhumayun@gmail.com",
          planId: "plan-pro",
          plan: "Professional",
          statusCode: "active",
          status: "Active",
          registeredAt: "2024-03-18",
        },
      },
    },
  },
  updateStatus: {
    summary: "Update account status",
    method: "PATCH",
    url: `${ADMIN_USERS_ENDPOINT}/{userId}/status`,
    description: "Changes only the lifecycle status for a user without modifying other attributes.",
    headers: {
      Authorization: "Bearer <access-token>",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    requestBody: {
      status: "Required string. One of active, invited, suspended, disabled.",
    },
    responses: {
      200: {
        body: {
          id: "681707f8c901776f5f01d32d",
          statusCode: "suspended",
          status: "Suspended",
        },
      },
    },
  },
  resetPassword: {
    summary: "Trigger password reset",
    method: "POST",
    url: `${ADMIN_USERS_ENDPOINT}/{userId}/reset-password`,
    description: "Sends a password reset link or direct reset action for the selected user.",
    headers: {
      Authorization: "Bearer <access-token>",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    requestBody: {
      redirectUri: "Optional string. Absolute URL included in the reset email CTA.",
    },
    responses: {
      202: {
        body: {
          message: "Password reset email scheduled",
        },
      },
    },
  },
});
