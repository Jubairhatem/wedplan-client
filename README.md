# WedPlan Client

Wedding Planning Platform — Frontend (Next.js 16, TypeScript, Tailwind CSS v4, ShadCN UI)

## Description

WedPlan is a full-stack wedding planning platform. Customers can browse and book wedding services (venues, photographers, florists, caterers, makeup artists, bridal fashion). Vendors can list and manage their services with free or premium subscription tiers. Admins can moderate users, services, and view transactions.

This is the **client** repository (Next.js App Router). The server lives in [`wedplan-server`](https://github.com/Jubairhatem/wedplan-server).

## Important Features

- **Authentication**: Email/password and Google OAuth via Better Auth, with role-based access (customer/vendor/admin)
- **Browse Services**: Search, category/location filters, price sorting, pagination, shareable URL query state
- **Service Details**: Image gallery, vendor info, booking dialog with role-based restrictions
- **Bookings**: Create, view, and cancel booking requests; vendor accept/reject
- **Dashboards**: Role-based vendor, customer, and admin dashboards with stat cards and management tables
- **Subscriptions**: Stripe Checkout for premium vendor upgrades, webhook-activated premium status
- **Admin Moderation**: Approve/reject services, block/unblock users, read-only transactions
- **Payments**: Stripe Checkout integration with webhook verification

## Technology Stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Animation**: Framer Motion
- **Auth**: Better Auth (email/password + Google OAuth)
- **Payments**: Stripe Checkout
- **Images**: ImgBB API
- **Validation**: Zod, react-hook-form
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React

## Installation Instructions

```bash
# Clone the repository
git clone https://github.com/Jubairhatem/wedplan-client.git
cd wedplan-client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in all required values (see Environment Variables below)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How to Run Locally

1. Ensure the server is running at `http://localhost:5000` (see server repo)
2. Copy `.env.example` to `.env.local` and configure all variables
3. Run `npm run dev`
4. The client will proxy API calls to `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`)

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of this client (Better Auth base URL) | Yes |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB API key for image uploads | No (fallback used if missing) |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session encryption | Yes |
| `BETTER_AUTH_URL` | URL of the Better Auth API route | Yes |
| `MONGODB_URI` | MongoDB connection string (Better Auth adapter) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No (Google login disabled if missing) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `JWT_SECRET` | Shared secret for backend JWT generation | Yes |

> **Never commit `.env.local` or any `.env*` file.** Only `.env.example` is committed.

## Repository Links

- **Client**: https://github.com/Jubairhatem/wedplan-client
- **Server**: https://github.com/Jubairhatem/wedplan-server

## Test Credentials (Optional)

- **Admin**: `admin@wedplan.com` / `Admin123!@#` (seeded via server `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Stripe test card**: `4242 4242 4242 4242` (test mode only)

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
