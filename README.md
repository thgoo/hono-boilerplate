# Hono Boilerplate

This project serves as a robust boilerplate for building RESTful APIs using **Hono**, a fast and lightweight web framework for the Edge. It integrates **Drizzle ORM** for database management, **Zod** for schema validation, and **Bun** as the runtime and package manager.

## Key Technologies

*   **Hono**: Web framework for fast and lightweight APIs.
*   **Drizzle ORM**: TypeScript-first ORM for relational databases.
*   **Zod**: TypeScript-first schema validation library.
*   **Bun**: JavaScript runtime and package manager.
*   **ESLint**: For code linting and formatting.
*   **Auth.js**: For authentication (via `@hono/auth-js`).

## Setup

1.  **Install Dependencies:**
    ```sh
    bun install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the project root, based on `.env.example`. The essential environment variables are:
    *   `NODE_ENV`: Application environment (e.g., `development`, `production`, `test`).
    *   `PORT`: Port on which the server will run (e.g., `8000`).
    *   `DATABASE_URL`: Database connection URL (e.g., `mysql://user:password@host:port/database`).
    *   `SESSION_SECRET`: A long secret string (minimum 32 characters) for sessions.

    Example `.env`:
    ```
    NODE_ENV=development
    PORT=8000
    DATABASE_URL="mysql://user:password@localhost:3306/hono_db"
    SESSION_SECRET="your_very_long_and_secure_session_secret_here"
    ```

## Available Scripts

*   **`bun run dev`**: Starts the development server with hot-reloading.
    ```sh
    bun run dev
    ```
    Access `http://localhost:3000` (or the port configured in `.env`).

*   **`bun run lint`**: Runs ESLint to check and report code style and quality issues.
    ```sh
    bun run lint
    ```

*   **`bun test`**: Executes the project's unit tests.
    ```sh
    bun test
    ```

## Database (Drizzle ORM)

This boilerplate uses Drizzle ORM to interact with the database.

*   **Schema Definition:** Database schemas are defined in `src/db/schemas/`.
*   **Migrations:**
    *   To generate a new migration after changing schemas:
        ```sh
        bun drizzle-kit generate:mysql
        ```
    *   To apply pending migrations to the database:
        ```sh
        bun drizzle-kit migrate
        ```

## Project Structure

The `src/` directory structure is organized to promote modularity and separation of concerns:

```
src/
├───auth/                 # Authentication module (routes, services, schemas, middleware)
│   ├───middleware/       # Authentication middlewares (e.g., isAuthorized, isGuest)
│   └───services/         # Business logic for authentication (users, sessions, passwords)
├───constants/            # Global constants (e.g., HTTP status codes)
├───db/                   # Database configuration and schemas
│   └───schemas/          # Database table definitions (Drizzle ORM)
├───types/                # TypeScript type definitions
├───utils/                # Utility functions (e.g., error handling)
├───config.ts             # Environment variable loading and validation
└───index.ts              # Application entry point, Hono configuration, middlewares, and routes
```

## Authentication

The `src/auth` module provides a complete authentication system, including:

*   User registration and login.
*   Session management.
*   Route protection with middlewares (`isAuthorized`, `isGuest`).
*   Separate services for password, session, and user handling.

## Error Handling

The project includes a global error handler in `src/index.ts` that centralizes exception handling. Custom errors (`HttpError`) are used to return standardized responses with appropriate HTTP status codes.

## How to Extend

*   **Add New Routes/Modules:** Create new folders within `src/` for specific modules (e.g., `src/products/`) and define their routes and business logic. Import and register these routes in `src/index.ts`.
*   **Add New Services:** Create service classes in their respective modules and inject them via middleware in `src/index.ts` or directly where needed.
*   **Define New Database Schemas:** Add new schema files in `src/db/schemas/` and generate/apply migrations.
