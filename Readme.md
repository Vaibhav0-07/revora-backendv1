# Revora Backend

Backend API for **Revora**, a SaaS platform that helps businesses collect, manage, analyze, and improve customer feedback and Google reviews.

The backend is responsible for business accounts, feedback collection, QR-based review flows, Google review tracking, analytics, reports, authentication, subscriptions, and the business dashboard API.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **JavaScript (ES Modules)**
* **PostgreSQL**
* **Prisma ORM**
* **REST API**
* **Zod** for request validation
* **JWT** for authentication
* **bcrypt** for password hashing
* **Redis** — optional, to be introduced when caching/rate limiting requires it
* **Background jobs/queues** — to be introduced when required

> The backend is intentionally separated from the frontend. The frontend can consume the REST API independently.

---

## Project Goals

Revora allows a business owner to:

* Create and manage their business account
* Create branches/locations
* Generate QR codes for feedback collection
* Allow customers to submit feedback
* Separate positive and negative feedback
* Redirect customers toward Google reviews
* Display business social-media handles after the review flow
* View feedback and review analytics
* View monthly reports
* Manage their subscription
* Monitor their overall customer-feedback performance

The system should be designed so that the public QR/review flow can handle significantly more traffic than the authenticated business dashboard.

---

# Architecture

```text
                    ┌──────────────────┐
                    │    Frontend      │
                    │     Next.js      │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │   Express API    │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
          Controllers     Services    Middleware
                │            │
                └──────┬─────┘
                       ▼
                ┌──────────────┐
                │ Repositories │
                └───────┬──────┘
                        │
                        ▼
                   Prisma ORM
                        │
                        ▼
                  PostgreSQL
```

---

# Core Modules

The backend will be organized around business domains rather than putting everything into a single controller/service structure.

```text
Authentication
Business
Branch
Users
QR Codes
Feedback
Reviews
Google Integration
Analytics
Reports
Subscriptions
Notifications
```

---

# Suggested Project Structure

```text
revora-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.js
│   │   └── database.js
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.schema.js
│   │   │
│   │   ├── business/
│   │   │   ├── business.controller.js
│   │   │   ├── business.service.js
│   │   │   ├── business.repository.js
│   │   │   ├── business.routes.js
│   │   │   └── business.schema.js
│   │   │
│   │   ├── branch/
│   │   ├── qr/
│   │   ├── feedback/
│   │   ├── review/
│   │   ├── analytics/
│   │   ├── reports/
│   │   └── subscription/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── response.js
│   │   └── errors.js
│   │
│   ├── app.js
│   └── server.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# JavaScript Configuration

Revora uses modern JavaScript with **ES Modules**.

The `package.json` should contain:

```json
{
  "type": "module"
}
```

This allows the backend to use:

```js
import express from "express";
```

instead of CommonJS:

```js
const express = require("express");
```

No TypeScript configuration is required.

The backend does **not** use:

```text
.ts
.tsx
tsconfig.json
```

---

# Request Flow

A normal authenticated request should follow this pattern:

```text
Client
  │
  ▼
Route
  │
  ▼
Middleware
  │
  ├── Authentication
  ├── Authorization
  └── Validation
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Repository
  │
  ▼
Prisma
  │
  ▼
PostgreSQL
```

### Responsibilities

**Route**

Defines the HTTP endpoint.

**Middleware**

Handles cross-cutting concerns such as authentication, authorization, validation, and rate limiting.

**Controller**

Handles HTTP-specific concerns:

* request
* response
* status codes

**Service**

Contains business logic.

**Repository**

Handles database access.

**Prisma**

Provides the ORM/database abstraction.

---

# Database

PostgreSQL is the primary database.

Prisma is used as the ORM.

Database schema:

```text
prisma/
└── schema.prisma
```

Migrations should be committed to the repository.

Do not manually modify the production database schema without a corresponding migration.

---

# Environment Variables

Create a `.env` file locally.

Example:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/REVORA"

JWT_SECRET="replace-with-a-secure-secret"

FRONTEND_URL="http://localhost:3000"
```

Additional environment variables will be added as integrations are implemented.

Never commit `.env` to Git.

Commit `.env.example` instead.

---

# Local Development

## 1. Clone the repository

```bash
git clone <repository-url>
cd revora-backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with the local PostgreSQL credentials.

## 4. Generate Prisma Client

```bash
npx prisma generate
```

## 5. Run database migrations

```bash
npx prisma migrate dev
```

## 6. Start development server

```bash
npm run dev
```

The API should then be available at:

```text
http://localhost:5000
```

---

# API Versioning

API endpoints should be versioned from the beginning.

Base URL:

```text
/api/v1
```

Example:

```text
GET /api/v1/business
POST /api/v1/feedback
GET /api/v1/analytics
```

This allows future API versions to coexist without immediately breaking existing clients.

---

# Authentication

Authentication will protect business-owner and dashboard endpoints.

Example flow:

```text
POST /api/v1/auth/register
        │
        ▼
Create User
        │
        ▼
Create Business
        │
        ▼
Return authentication credentials
```

Login:

```text
POST /api/v1/auth/login
        │
        ▼
Validate credentials
        │
        ▼
Generate authentication token
        │
        ▼
Return token/session
```

Protected endpoints require authentication.

Public customer feedback endpoints should **not** require business-owner authentication.

---

# Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to access?

For example:

```text
User A
  │
  └── Business A
       ├── Branch A
       ├── QR A
       └── Feedback A
```

User A must not be able to access:

```text
Business B
Feedback B
QR B
```

Every protected resource must therefore be scoped to the authenticated user's business/tenant.

---

# Multi-Tenant Architecture

Revora is a SaaS application, so the backend should be designed as a multi-tenant system.

Conceptually:

```text
                 REVORA
                    │
        ┌───────────┼───────────┐
        │           │           │
     Business A  Business B  Business C
        │           │           │
      Data A      Data B      Data C
```

Business-owned data must always contain or be resolvable to its owning business.

Queries should never return data belonging to another business.

---

# Public QR Flow

The QR flow is one of the most important parts of Revora.

Conceptually:

```text
Customer scans QR
        │
        ▼
Public QR URL
        │
        ▼
Identify business/branch
        │
        ▼
Feedback page
        │
        ▼
Customer submits rating
        │
        ├───────────────┐
        │               │
     Positive        Negative
        │               │
        ▼               ▼
Google Review       Internal
                    Feedback
```

The QR endpoint is public and therefore requires additional consideration for:

* rate limiting
* abuse prevention
* caching
* validation
* analytics/event tracking

---

# Feedback

Feedback should be treated as a core domain rather than simply a database record.

A feedback submission may contain:

```text
Business
Branch
QR code
Rating
Comment
Customer information (if collected)
Timestamp
Source
Status
```

The backend should record enough information to support:

* feedback history
* rating trends
* sentiment analysis
* monthly reports
* branch-level analytics
* QR performance

---

# Google Reviews

Google review functionality should be isolated into its own module.

```text
modules/
└── review/
    ├── review.controller.js
    ├── review.service.js
    ├── review.repository.js
    └── review.routes.js
```

The Google integration should not be tightly coupled to the core feedback logic.

This allows the integration to change without rewriting the feedback system.

---

# Analytics

Analytics should be calculated from stored events/data rather than hard-coded into the frontend.

Examples:

```text
Total Feedback
Positive Feedback
Negative Feedback
Average Rating
Feedback Growth
Google Review Count
Google Rating
Branch Performance
QR Scan Count
Conversion Rate
```

Example dashboard request:

```text
GET /api/v1/analytics/overview
```

Response structure can eventually contain:

```json
{
  "totalFeedback": 1240,
  "positiveFeedback": 1030,
  "negativeFeedback": 210,
  "averageRating": 4.3,
  "googleReviews": 842
}
```

The exact response schema should be finalized alongside the database and frontend requirements.

---

# Monthly Reports

The report system should support:

```text
Monthly
    │
    ├── Total feedback
    ├── Positive feedback
    ├── Negative feedback
    ├── Average rating
    ├── Google review performance
    ├── Branch performance
    └── Trends
```

Reports may eventually be generated asynchronously using a background job system.

For the initial MVP, report generation can remain synchronous if the dataset is small enough.

---

# Error Handling

All API errors should follow a consistent response format.

Example:

```json
{
  "success": false,
  "message": "Business not found",
  "code": "BUSINESS_NOT_FOUND"
}
```

Avoid returning raw database errors to clients.

Production responses should not expose:

* SQL errors
* stack traces
* secrets
* internal implementation details

---

# Validation

Every external input should be validated before reaching business logic.

Validation should cover:

```text
Request body
Query parameters
Route parameters
Headers
```

Example:

```text
POST /api/v1/feedback

rating → required integer
rating → valid range
comment → optional string
qrCode → required
```

Invalid input should return an appropriate `4xx` response.

---

# Security Requirements

The backend should implement, at minimum:

* Password hashing
* Authentication
* Authorization
* Request validation
* Rate limiting
* CORS configuration
* Secure HTTP headers
* Environment-based secrets
* Input sanitization where appropriate
* Protection against cross-tenant data access
* Proper database constraints

Security should be considered during implementation rather than added after the MVP is complete.

---

# Testing

Testing should be introduced alongside modules.

Suggested structure:

```text
tests/
├── unit/
├── integration/
└── e2e/
```

Priority:

1. Authentication
2. Authorization
3. Feedback submission
4. QR flow
5. Business/branch isolation
6. Analytics
7. Subscription logic

The most important tests are those protecting business data isolation and public feedback submission.

---

# Development Order

Do not implement every module simultaneously.

Recommended order:

```text
Phase 1
Project setup
    ↓
Express
JavaScript / ES Modules
Environment configuration
Error handling
Logging

Phase 2
Database
    ↓
Prisma
PostgreSQL
Migrations
Seed data

Phase 3
Authentication
    ↓
Register
Login
Authentication middleware
Authorization

Phase 4
Business
    ↓
Business profile
Branches
Business settings

Phase 5
QR
    ↓
QR creation
QR management
Public QR endpoint

Phase 6
Feedback
    ↓
Feedback submission
Feedback retrieval
Feedback filtering

Phase 7
Analytics
    ↓
Dashboard metrics
Aggregations
Time-based analytics

Phase 8
Google Reviews
    ↓
Google integration
Review synchronization

Phase 9
Reports
    ↓
Monthly reports
Report generation

Phase 10
Subscriptions
    ↓
Plans
Subscription status
Billing integration
Usage limits
```

---

# Initial Backend Milestone

The first working backend milestone should **not** be the entire Revora system.

The first goal is:

```text
User
  │
  ▼
Register
  │
  ▼
Business created
  │
  ▼
Login
  │
  ▼
Create Branch
  │
  ▼
Create QR
  │
  ▼
Customer scans QR
  │
  ▼
Submit Feedback
  │
  ▼
Business sees Feedback
```

Once this vertical slice works end-to-end, the remaining features can be built on top of it.

---

# Development Principles

### 1. Keep business logic out of controllers

Bad:

```text
Controller
 └── 200 lines of business logic
```

Prefer:

```text
Controller
   ↓
Service
   ↓
Repository
```

### 2. Keep modules independent

For example, the QR module should not directly manipulate unrelated subscription tables.

Use services and clear domain boundaries.

### 3. Use database constraints

Do not rely exclusively on application code to maintain data integrity.

### 4. Design for multi-tenancy from day one

Every business-owned query should respect the authenticated business context.

### 5. Don't prematurely optimize

Start with:

```text
PostgreSQL
+
Prisma
+
Express
```

Introduce Redis, queues, workers, caching, and additional infrastructure when actual requirements justify them.

---

# Useful Commands

```bash
# Start development server
npm run dev

# Build
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio
npx prisma studio

# Check Prisma schema
npx prisma validate

# Format Prisma schema
npx prisma format

# Run tests
npm test
```

---

# Current Status

## Backend

* [x] Project initialization
* [x] Express setup
* [x] JavaScript / ES Modules setup
* [ ] Environment configuration
* [ ] PostgreSQL connection
* [ ] Prisma setup
* [ ] Database schema implementation
* [ ] Initial migration
* [ ] Authentication
* [ ] Authorization
* [ ] Business management
* [ ] Branch management
* [ ] QR management
* [ ] Public feedback flow
* [ ] Feedback management
* [ ] Analytics
* [ ] Google Reviews integration
* [ ] Monthly reports
* [ ] Subscription management
* [ ] Automated tests
* [ ] Production deployment

---

# Important

Revora should initially be built as a **modular monolithic backend**.

Do not start with microservices.

The architecture should be:

```text
                    REVORA BACKEND
                           │
                    Modular Monolith
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
      Auth             Feedback            QR
        │                  │                  │
     Business          Analytics          Reviews
        │                  │                  │
     Branches           Reports         Subscription
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                        Prisma
                           │
                      PostgreSQL
```

This keeps the system simple enough to develop while preserving clear domain boundaries for future scaling.
