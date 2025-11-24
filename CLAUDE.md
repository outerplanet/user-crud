# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A NestJS-based REST API for user management with JWT authentication, built with Prisma and PostgreSQL. Uses pnpm v10 as the package manager.

## Common Commands

### Development
```bash
pnpm install              # Install dependencies
pnpm dev                  # Run development mode with hot reload and Prisma watch
pnpm build                # Build the application
pnpm start:prod           # Run production build
```

### Testing
```bash
pnpm test                 # Run unit tests
pnpm test:watch           # Run tests in watch mode
pnpm test:e2e             # Run end-to-end tests
pnpm test:cov             # Generate test coverage report
pnpm test:debug           # Run tests in debug mode
```

### Linting
```bash
pnpm lint                 # Check for linting issues
pnpm lint:fix             # Auto-fix linting issues
```

### Database
```bash
pnpm prisma:generate          # Generate Prisma Client
pnpm prisma:migrate:deploy    # Apply migrations to database
pnpm prisma:migrate:new       # Create new migration (without applying)
pnpm prisma:format            # Format schema with case conversion
```

## Architecture

The codebase follows **Clean Architecture** principles with strict layer boundaries enforced by ESLint rules. Each module is organized into four layers:

### Layer Structure (Enforced by eslint-plugin-boundaries)

1. **Domain Layer** (`domain/`)
   - Contains business entities, interfaces, and domain logic
   - CANNOT depend on: presentation, application, infrastructure
   - Includes: models, data types, repository interfaces, filters, enums

2. **Infrastructure Layer** (`infrastructure/`)
   - Implements external dependencies (database, APIs)
   - CANNOT depend on: presentation, application
   - CAN depend on: domain
   - Implements repository interfaces defined in domain

3. **Application Layer** (`application/`)
   - Contains business logic and use cases
   - CANNOT depend on: presentation
   - CAN depend on: domain, infrastructure
   - Includes: services, commands

4. **Presentation Layer** (`presentation/`)
   - Handles HTTP requests/responses
   - CAN depend on: all other layers
   - Includes: controllers, DTOs, response objects, guards, strategies, decorators

### Key Architectural Patterns

- **Repository Pattern**: Repositories are defined as interfaces in the domain layer and implemented in the infrastructure layer using dependency injection tokens (e.g., `USER_REPOSITORY`, `USER_SESSION_REPOSITORY`)

- **Module Organization**: Each feature module (`user`, `auth`) follows the same layered structure. Shared functionality is in `shared/` (config, Prisma) and `common/` (utilities, filters, middleware)

- **Path Aliases**: Three primary aliases are configured:
  - `@common/*` → `src/common/*`
  - `@modules/*` → `src/modules/*`
  - `@shared/*` → `src/shared/*`

### Global Configurations

- **JWT Authentication**: Applied globally via `APP_GUARD` with `JwtAuthGuard`. Use `@Public()` decorator to make endpoints public
- **Class Serialization**: Enabled globally via `APP_INTERCEPTOR`
- **Exception Handling**: Global `HttpExceptionFilter` for consistent error responses
- **Request Logging**: Applied to all routes via `RequestLoggingMiddleware`

## Code Standards

### Naming Conventions
- Files: **kebab-case** (enforced by `check-file` plugin)
- Specific suffixes required: `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.module.ts`

### Import Organization
- Imports are automatically sorted by `perfectionist` plugin
- Use natural sorting with no newlines between import groups
- Organize imports should be handled by Prettier plugin

### Function Return Types
- **MUST** explicitly type return values for: controllers, repositories, services, resolvers
- This is enforced via ESLint for files matching `**/*.{controller,repository,resolver,service}.ts`

### Authentication Flow
1. Sign up creates user and returns access + refresh tokens
2. Log in validates credentials via Passport Local Strategy, returns tokens
3. Access token expires in 15 minutes (configurable via `JWT_EXP_TIME`)
4. Refresh token expires in 30 days (hardcoded in `auth.service.ts`)
5. User sessions are stored in database with hashed refresh tokens
6. Scheduled cleanup job removes expired sessions

## Database

- **ORM**: Prisma with PostgreSQL
- **Models**: `User`, `UserSession`
- **Soft Deletes**: Users have `deletedAt` field for soft deletion
- **Case Formatting**: Use `prisma:format` to apply snake_case to database fields while maintaining camelCase in code

## Environment Variables

Required in `.env`:
```
PORT=5000
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-here
JWT_EXP_TIME=15m
POSTGRES_DB_URL=postgresql://user:password@localhost:5432/dbname
```
