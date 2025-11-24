# User Management API

A NestJS-based REST API for user management with JWT authentication, built with Prisma and PostgreSQL.

## Prerequisites

- Node.js (v20 or higher)
- PostgreSQL database
- pnpm (v10)

### Installing pnpm

If you don't have pnpm installed, you can install it using one of the following methods:

**Using npm:**

```bash
npm install -g pnpm@10
```

**Using standalone script (recommended):**

```bash
# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Using Corepack (Node.js 16.13+):**

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

For more installation options, visit [pnpm.io/installation](https://pnpm.io/installation)

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=5000
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-here
JWT_EXP_TIME=15m
POSTGRES_DB_URL=postgresql://user:password@localhost:5432/dbname
```

### 3. Setup Database

Generate Prisma Client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate:deploy
```

### 4. Run the Application

**Development mode** (with hot reload):

```bash
pnpm dev
```

**Production mode**:

```bash
pnpm build
pnpm start:prod
```

The API will be available at `http://localhost:5000` (or your configured PORT).

## API Endpoints

### Authentication

- `POST /auth/sign-up` - Create new user account
- `POST /auth/log-in` - Log in with credentials
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/log-out` - Log out and invalidate session

### Users (Protected)

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `GET /users/me` - Get current user
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user

## Additional Commands

**Testing**:

```bash
pnpm test              # Run unit tests
pnpm test:e2e          # Run e2e tests
pnpm test:cov          # Test coverage
```

**Linting**:

```bash
pnpm lint              # Check for issues
pnpm lint:fix          # Auto-fix issues
```

**Database**:

```bash
pnpm prisma:migrate:new   # Create new migration
pnpm prisma:format        # Format schema file
```

## Tech Stack

- NestJS - Backend framework
- Prisma - ORM
- PostgreSQL - Database
- JWT - Authentication
- Passport - Auth strategies
