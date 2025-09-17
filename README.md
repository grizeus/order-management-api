# Order Management API

A robust NestJS-based backend for the Order Management System, featuring authentication with Clerk and PostgreSQL for data storage.

## Prerequisites

- Node.js (v22 or later)
- npm (v10 or later) or yarn
- PostgreSQL (v16 or later) or [NeonDB](https://neon.tech/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/grizeus/order-management-api.git
cd order-management-api
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/order_management"
PORT=3000
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 4. Database Setup

#### Option 1: Local PostgreSQL

1. Create a new PostgreSQL database:
   ```bash
   createdb order_management
   ```

#### Option 2: NeonDB (Cloud PostgreSQL)

1. Create a new project on [NeonDB](https://neon.tech/)
2. Copy the connection string and update `DATABASE_URL` in your `.env` file

### 5. Run Database Migrations

```bash
npm run typeorm:run-migrations
```

### 6. Start the Development Server

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Documentation

When running in development mode, you can access the Swagger documentation at:
`http://localhost:3000/api`

## Project Structure

```
src/
├── auth/               # Authentication module
│   ├── dto/           # Data Transfer Objects
│   ├── auth.controller.ts
│   └── auth.service.ts
├── order/              # Order management module
│   ├── dto/
│   ├── order.controller.ts
│   └── order.service.ts
├── db/                 # Database configuration
│   ├── entities/       # TypeORM entities
│   ├── config.ts       # Database configuration
│   └── datasource.ts   # TypeORM data source
└── main.ts             # Application entry point
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run test:cov` - Run tests with coverage
- `npm run typeorm` - Run TypeORM CLI
- `npm run typeorm:run-migrations` - Run pending migrations
- `npm run typeorm:generate-migration` - Generate a new migration
- `npm run typeorm:create-migration` - Create a new migration file
- `npm run lint` - Run ESLint

## Environment Variables

| Variable           | Description                         | Required | Default |
| ------------------ | ----------------------------------- | -------- | ------- |
| `DATABASE_URL`     | PostgreSQL connection string        | Yes      | -       |
| `PORT`             | Port to run the server on           | No       | 3000    |
| `CLERK_SECRET_KEY` | Clerk secret key for authentication | Yes      | -       |

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Migrations

### Create a new migration

```bash
npm run typeorm:create-migration
```

### Generate migration from entity changes

```bash
npm run typeorm:generate-migration -- -n MigrationName
```

### Run pending migrations

```bash
npm run typeorm:run-migrations
```

### Revert last migration

```bash
npm run typeorm:revert-migration
```

## Deployment

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm run start:prod
```

## Technologies Used

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Clerk (Authentication)
- Swagger (API Documentation)
- Jest (Testing)
