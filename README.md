# Yaest · Я есть

A Russian-language prototype for requesting help with everyday errands and tracking service orders.

Customers can describe a task, sign in by email and follow an order. The administrative side covers review, pricing, status changes and event history.

[Deployment link](https://next-js-site-znea.vercel.app) · [Routes](./src/app) · [Database schema](./prisma/schema.prisma)

## Main flows

- A service landing page and request form with city, task, date and contact fields.
- Email magic-link sign-in, customer profiles and personal order lists.
- An administrative order view with search and status/date filters.
- Order pricing, status changes, event history and notification templates.
- Payment initialization, callback and result routes for T-Bank / Tinkoff.

The order lifecycle is `REVIEW → AWAITING_PAYMENT → IN_PROGRESS → DONE`, with a separate `CANCELED` state.

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, PostgreSQL and Prisma. Authentication uses Auth.js / NextAuth with Resend email delivery. The project started from Create T3 App.

## Code map

- `src/app/`: pages, server actions and API routes.
- `src/components/`: shared UI and landing-page sections.
- `src/server/`: authentication, database and server utilities.
- `src/emails/`: transactional email templates.
- `prisma/`: database schema and migrations.

## Running locally

Use npm 10.9.3, a compatible Node.js runtime and a separate PostgreSQL development database.

Configuration needs attention before the first run. Read [src/server/env.ts](./src/server/env.ts), [src/env.js](./src/env.js) and the Prisma schema together:
- The application uses PostgreSQL, but `.env.example` still contains a SQLite URL.
- Legacy validation requires Discord variables, while the active authentication flow uses email.
- Authentication enables secure cookies, so plain HTTP localhost sign-in needs a configuration review.

Create a private `.env` with the database URLs, authentication secret, base URL and test email settings. Never use production credentials for a demo.

After resolving configuration:

```bash
npm ci
npm run db:migrate
npm run dev
```

`npm ci` generates the Prisma client. The migration command changes the configured database. `vercel-build` also applies migrations; it is not a build-only command.

The repository includes `build`, `typecheck`, `lint` and `check` scripts. No automated test script is defined. These commands and the live deployment were not verified during this README update.

## Demo and current limits

A useful walkthrough is a synthetic request moving from the customer order list to administrative review and status history. Use test recipients: order actions can send email.

This is a portfolio prototype, not a claim of a production-ready service. Payment authorization, amount validation and callbacks need review and provider test-mode checks before real transactions. Access controls and personal-data handling also need verification before use with real customers.

The landing page's “9,000+ performers” and “18,523 completed orders” are hardcoded presentation figures, not measured business results.
