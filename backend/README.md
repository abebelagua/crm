# Backend - NestJS CRM API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm?schema=public"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

3. Setup database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Run the server:
```bash
npm run start:dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new company
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Clients
- `GET /api/clients` - List clients (filtered by tenant)
- `GET /api/clients/stats` - Get client statistics
- `GET /api/clients/:id` - Get client
- `POST /api/clients` - Create client
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tenant
- `GET /api/tenant` - List tenants (Super Admin only)
- `GET /api/tenant/:id` - Get tenant
- `PATCH /api/tenant/:id` - Update tenant

### Subscription
- `GET /api/subscription` - Get subscription
- `POST /api/subscription/checkout` - Create checkout session
- `POST /api/subscription/webhook` - Stripe webhook

## Multi-Tenant Architecture

All data is isolated by `tenantId`. The middleware automatically extracts the tenant from the JWT token and filters all queries.

## Testing

```bash
npm run test
npm run test:e2e
```

