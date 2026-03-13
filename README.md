# School System Monorepo

School System is a full-stack monorepo-style repository with:

- a NestJS backend API in `backend/`
- an Angular frontend in `frontend/`
- JWT-based authentication and role-based access control already wired across both apps

The repository now exposes root-level dev commands so you can start both apps together from the project root, or run each app individually.

## Overview

This repo currently provides the authentication foundation for a school management platform, including:

- user self-registration
- approval-based account activation
- JWT login/logout
- role-based access control
- forgot-password and reset-password flow
- first-time password change for admin-created users
- user session tracking in MongoDB

## Roles

The backend and frontend share the same role model:

- `user`
- `teacher`
- `admin`
- `super_admin`

## Repository Layout

```text
School-system/
  backend/    NestJS API, MongoDB models, auth module
  frontend/   Angular app, auth screens, route guards, interceptor
```

## Tech Stack

- Backend: NestJS 11, Mongoose, MongoDB, Passport JWT, bcrypt, class-validator
- Frontend: Angular 19, standalone components, Angular Router, HttpClient, Tailwind CSS
- Auth: JWT bearer tokens, role guards, approval workflow, password reset tokens

## Auth Features Implemented

### Backend

- `POST /auth/register` for public self-registration
- `POST /auth/login` for JWT login
- `POST /auth/logout` for session logout tracking
- `POST /auth/forgot-password` for password reset initiation
- `POST /auth/reset-password` for password reset completion
- `GET /auth/profile` for the authenticated user's profile
- `PATCH /auth/update-password` for normal password updates
- `POST /auth/first-time-password-change` for users created with temporary passwords
- admin and super-admin user management endpoints under `/auth/users`

### Frontend

- login page
- registration page
- forgot-password page
- reset-password page
- update-password page
- protected dashboard route
- auth guard for protected routes
- HTTP interceptor that attaches the bearer token automatically

## Approval Flow

The auth flow has two different user creation paths:

1. Public registration creates a `user` account with `isApproved = false`.
2. A `super_admin` must approve that account before the user can log in.
3. Admin-created users are approved immediately and receive a temporary password.
4. Admin-created users must change that password on first login.

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 20+
- npm 10+
- MongoDB available locally or through a hosted connection string

## Root Commands

After installing dependencies inside `backend/` and `frontend/`, use these commands from the repository root:

```bash
npm run dev
npm run dev:api
npm run dev:ui
```

- `npm run dev` starts both the backend and frontend together
- `npm run dev:api` starts only the NestJS API
- `npm run dev:ui` starts only the Angular frontend

The root `dev` command proxies both apps and streams logs from each process in one terminal.

## Backend Setup

Open a terminal in `backend/` and install dependencies:

```bash
npm install
```

Create a `.env` file in `backend/` with at least:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/school-system
JWT_SECRET=replace-with-a-strong-secret
FRONTEND_URL=http://localhost:4200
```

Start the backend in development mode:

```bash
npm run start:dev
```

The API listens on `http://localhost:3000` by default.

## Frontend Setup

Open a terminal in `frontend/` and install dependencies:

```bash
npm install
```

The frontend currently reads its API base URL from:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

The development environment is already configured to call:

```text
http://localhost:3000
```

Start the frontend:

```bash
npm start
```

The Angular app runs on `http://localhost:4200` by default.

## Running Both Apps

From the repository root:

```bash
npm run dev
```

Once both are running:

- frontend: `http://localhost:4200`
- backend: `http://localhost:3000`

## Running Apps Individually

From the repository root:

```bash
npm run dev:api
npm run dev:ui
```

You can still run package-specific commands inside each app directory if needed.

## Key Auth Routes

### Public

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Authenticated

- `POST /auth/logout`
- `GET /auth/profile`
- `PATCH /auth/update-password`
- `POST /auth/first-time-password-change`

### Admin and Super Admin

- `POST /auth/admin-register`
- `GET /auth/users`
- `PATCH /auth/users/:id`
- `DELETE /auth/users/:id`

### Super Admin Only

- `PATCH /auth/users/:id/approve`
- `DELETE /auth/users/:id/reject`

## Frontend Routes

The Angular app currently exposes these routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/update-password`
- `/dashboard`

Unauthenticated users are redirected to `/login`.

## Available Scripts

### Root

```bash
npm run dev
npm run dev:api
npm run dev:ui
```

### Backend

```bash
npm run build
npm run start
npm run start:dev
npm run start:prod
npm run test
npm run test:e2e
```

### Frontend

```bash
npm start
npm run build
npm run watch
npm test
```

## Current Implementation Notes

- Password reset currently generates a short-lived reset token and logs it on the backend instead of sending a real email.
- Session tracking is stored in MongoDB through the `UserSession` model.
- The dashboard is currently a placeholder page for authenticated users.
- Root-level dev scripts proxy into `backend/` and `frontend/` using npm prefix commands.

## Next Recommended Improvements

- add a real mail provider for password reset delivery
- replace the placeholder dashboard with school-specific modules
- add seed scripts for super-admin bootstrap and demo data
- add automated end-to-end tests for the auth flows