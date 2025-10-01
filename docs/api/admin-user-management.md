# Admin user management API

The admin user management views (`/admin/user-management`) now rely on the dedicated query helpers in [`src/lib/queries/admin-users.js`](../../src/lib/queries/admin-users.js). Those helpers call the Express service through the endpoints described below and expose a machine-readable specification via `adminUserApiSpec` for quick Postman imports or code generation.

All endpoints require a valid bearer token obtained during authentication. The frontend automatically forwards the access token through the `/api/proxy` helper, but direct API consumers (for example, Postman or future Express routes) must add the header manually.

- **Base URL:** `${AUTH_BACKEND_URL}/api/admin/users` (defaults to `http://localhost:4000/api/admin/users` in development)
- **Required headers:**
  - `Authorization: Bearer <access-token>`
  - `Accept: application/json`
  - `Content-Type: application/json` (for mutating requests)

## Endpoint reference

### 1. List users
- **Method:** `GET`
- **URL:** `/api/admin/users`
- **Query parameters (optional):**
  - `search` – fuzzy match against username or email
  - `status` – one of the normalized status codes (`active`, `invited`, `suspended`, `disabled`)
  - `planId` – pricing plan identifier
  - `page` – results page (default `1`)
  - `pageSize` – number of results per page (default `25`)
- **Success response (`200 OK`):**
```json
{
  "items": [
    {
      "id": "68170801c901776f5f01d330",
      "username": "kobirhumayun",
      "email": "kobirhumayun@gmail.com",
      "planId": "plan-pro",
      "plan": "Professional",
      "statusCode": "active",
      "status": "Active",
      "registeredAt": "2024-03-18",
      "lastLoginAt": "2024-12-01"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 12,
    "totalItems": 296,
    "itemsPerPage": 25
  },
  "availableStatuses": ["active", "invited", "suspended"]
}
```

### 2. Get a user profile
- **Method:** `GET`
- **URL:** `/api/admin/users/{userId}`
- **Success response (`200 OK`):**
```json
{
  "id": "68170801c901776f5f01d330",
  "username": "kobirhumayun",
  "email": "kobirhumayun@gmail.com",
  "planId": "plan-pro",
  "plan": "Professional",
  "statusCode": "active",
  "status": "Active",
  "registeredAt": "2024-03-18",
  "lastLoginAt": "2024-12-01",
  "raw": { /* complete upstream payload */ }
}
```

### 3. Create a user
- **Method:** `POST`
- **URL:** `/api/admin/users`
- **Request body:**
```json
{
  "username": "analyticspro",
  "email": "analytics@example.com",
  "password": "optional-when-sending-invite",
  "planId": "plan-enterprise",
  "status": "invited"
}
```
- **Success response (`201 Created`):**
```json
{
  "id": "68170c9ac901776f5f01d37b",
  "username": "analyticspro",
  "email": "analytics@example.com",
  "planId": "plan-enterprise",
  "plan": "Enterprise",
  "statusCode": "invited",
  "status": "Invited",
  "registeredAt": "2025-01-05"
}
```

### 4. Update a user
- **Method:** `PATCH`
- **URL:** `/api/admin/users/{userId}`
- **Request body (partial updates allowed):**
```json
{
  "username": "growthlead",
  "email": "growthlead@example.com",
  "planId": "plan-basic",
  "status": "active"
}
```
- **Success response (`200 OK`):**
```json
{
  "id": "681707f8c901776f5f01d32d",
  "username": "growthlead",
  "email": "growthlead@example.com",
  "planId": "plan-basic",
  "plan": "Business",
  "statusCode": "active",
  "status": "Active",
  "registeredAt": "2024-07-22"
}
```

### 5. Update account status only
- **Method:** `PATCH`
- **URL:** `/api/admin/users/{userId}/status`
- **Request body:**
```json
{
  "status": "suspended"
}
```
- **Success response (`200 OK`):**
```json
{
  "id": "681707f8c901776f5f01d32d",
  "statusCode": "suspended",
  "status": "Suspended"
}
```

### 6. Trigger a password reset
- **Method:** `POST`
- **URL:** `/api/admin/users/{userId}/reset-password`
- **Request body (optional):**
```json
{
  "redirectUri": "https://app.example.com/reset-success"
}
```
- **Success response (`202 Accepted`):**
```json
{
  "message": "Password reset email scheduled"
}
```

These definitions mirror the `adminUserApiSpec` object exported from [`src/lib/queries/admin-users.js`](../../src/lib/queries/admin-users.js), ensuring a single source of truth for frontend calls, Express controllers, and Postman collections.
