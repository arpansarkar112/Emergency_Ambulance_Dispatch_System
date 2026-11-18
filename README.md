# CallAmbulance — Emergency Ambulance Dispatch System API

A modular, scalable RESTful backend built with **Node.js**, **Express 5**, **TypeScript**, **Zod**, and **Prisma ORM (PostgreSQL)**.

## Core Capabilities
- **3 Roles & RBAC:** `ADMIN`, `PATIENT`, and `DRIVER` protected by JWT authentication & role-based authorization middleware
- **Authentication:** Email/password with bcrypt hashing, Google OAuth verification, and authenticated password updates (`PATCH /api/v1/users/me/password`)
- **Public Fleet Catalog & Details:** Backend search, multi-filter (tier, category, status, price range, rating), sorting, and pagination (`GET /api/v1/ambulances/public`, `GET /api/v1/ambulances/public/:id`)
- **Verified Reviews:** Transactional review submission & live average fleet rating recalculation (`POST /api/v1/ambulances/:id/reviews`, `GET /api/v1/public/reviews`)
- **Emergency Dispatch Lifecycle:** Strict criticality-matched ICU/BLS ambulance allocation in Prisma transactions, live driver milestones, and audit logging
- **Payments:** Stripe Checkout sessions, webhook handler, and manual session verification
- **Content & Operations:** Fleet categories CRUD (`/api/v1/categories`), medical safety blog (`/api/v1/blogs`), contact desk inbox (`/api/v1/contact`), newsletter subscriptions (`/api/v1/newsletter`), and live dashboard analytics (`/api/v1/admin/analytics`, `/api/v1/requests/my-stats`)

## Local Setup
1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `BCRYPT_SALT_ROUNDS`, and `STRIPE_SECRET_KEY`.
2. Install dependencies: `npm install`
3. Sync database schema: `npx prisma db push`
4. Seed demo users, categories, enriched fleet units, reviews & blog posts: `npx tsx prisma/seed.ts`
5. Start dev server: `npm run dev`
6. Build for production: `npm run build`
