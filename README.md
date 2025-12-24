# CRM - Multi-Tenant SaaS Application

A comprehensive Customer Relationship Management (CRM) system built as a multi-tenant SaaS application. This project demonstrates enterprise-level architecture, security, and scalability.

## 🎯 Problem Solved

Many small and medium businesses:
- Manage clients in Excel
- Don't separate data between companies
- Lack clear metrics
- Don't control access by role

This CRM allows:
- ✅ Manage clients by company (multi-tenant)
- ✅ Control users and roles
- ✅ Visualize clear metrics
- ✅ Scale easily as SaaS

## 🏗️ Architecture

```
Frontend (Next.js)
        ↓
API Gateway (NestJS)
        ↓
Auth Module
Tenant Resolver Middleware
        ↓
Business Modules
        ↓
PostgreSQL
```

### Multi-Tenant Strategy

**Single Database + Tenant ID**

- All tables include `tenant_id UUID NOT NULL`
- Middleware extracts tenant from JWT
- All queries are automatically filtered by tenant
- ✅ Scalable
- ✅ Realistic
- ✅ Used in real SaaS applications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - SSR, SEO, SaaS-ready
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components

### Backend
- **NestJS** - Enterprise Node.js framework
- **Prisma** - Modern ORM
- **PostgreSQL** - Robust relational database
- **JWT** - Authentication with refresh tokens

### Payments
- **Stripe** (Test Mode) - Subscription management

## 👤 User Types

1. **Super Admin** - SaaS owner (you)
2. **Company Admin** - Company owner
3. **User** - Employee

## 🧩 System Modules

### 🔐 Auth Module
- Company registration
- Login
- Refresh token
- Role-based access

### 🏢 Tenant Module
- Create company
- Activate/deactivate tenant
- Assign plan

### 👥 Users Module
- Create users
- Assign roles
- Invite users

### 👤 Clients Module
- CRUD clients
- Search
- Filters
- Client status

### 📊 Dashboard Module
- Metrics:
  - Total clients
  - New clients
  - Active clients
  - Monthly growth
- Charts (Line, Bar)

### 💳 Subscription Module
- Free Plan
- Pro Plan
- Payment simulation
- Stripe webhooks

## 📦 Project Structure

```
crm/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── tenant/
│   │   ├── users/
│   │   ├── clients/
│   │   ├── dashboard/
│   │   └── subscription/
│   └── prisma/
├── frontend/         # Next.js App
│   └── app/
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd crm
```

2. Install dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables

Create `.env` in `backend/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm?schema=public"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
```

Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. Set up database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Run the application
```bash
# From root directory
npm run dev
```

Backend will run on `http://localhost:3001`
Frontend will run on `http://localhost:3000`

## 🔒 Security Features

- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Tenant isolation (data never leaks between tenants)
- Password hashing with bcrypt
- CORS configuration
- Input validation

## 📊 Database Schema

### Tenant
- `id` (UUID)
- `name` (String)
- `plan` (Enum: FREE, PRO)
- `isActive` (Boolean)
- `stripeCustomerId` (String, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### User
- `id` (UUID)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (Enum: SUPER_ADMIN, COMPANY_ADMIN, USER)
- `tenantId` (UUID, nullable for SUPER_ADMIN)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Client
- `id` (UUID)
- `name` (String)
- `email` (String)
- `phone` (String, optional)
- `status` (Enum: ACTIVE, INACTIVE, LEAD)
- `tenantId` (UUID)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Subscription
- `id` (UUID)
- `plan` (Enum: FREE, PRO)
- `status` (Enum: ACTIVE, CANCELLED, PAST_DUE)
- `stripeSubscriptionId` (String, optional)
- `tenantId` (UUID)
- `currentPeriodEnd` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## 🧪 Testing

```bash
cd backend
npm run test
npm run test:e2e
```

## 📝 API Documentation

API documentation will be available at `http://localhost:3001/api` (Swagger)

## 🎨 UI Screenshots

_Add screenshots here once the UI is complete_

## 🔄 Development Workflow

1. Make changes in respective directories
2. Backend changes require restart
3. Frontend supports hot reload
4. Database migrations: `npx prisma migrate dev`

## 📄 License

See LICENSE file

## 🤝 Contributing

This is a demonstration project. Contributions are welcome!

## 📧 Contact

For questions or suggestions, please open an issue.

---

**Built with ❤️ to demonstrate enterprise-level SaaS architecture**

