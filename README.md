# Emergency Ambulance Dispatch System

A robust, scalable RESTful API built with Node.js, Express, TypeScript, and Prisma (PostgreSQL).

## Features
- **3 Roles**: ADMIN, PATIENT, DRIVER
- **Auth**: JWT Email/Password & GCP Social Login support
- **Payments**: Stripe Checkout and Webhooks
- **Safety**: Zod validations, Helmet, Rate Limiting, Soft Deletes, Audit Logs
- **Operations**: Transactions for ambulance dispatching

## Setup
1. Copy `.env.example` to `.env` and fill variables (including DATABASE_URL).
2. Run `npm install`
3. Run `npx prisma migrate dev`
4. Run `npm run seed` to create Admin user (`admin@ambulance.com` / `admin123`)
5. Run `npm run dev` to start server
