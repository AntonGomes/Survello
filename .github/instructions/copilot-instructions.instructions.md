---
applyTo: '**'
---
## Global Instructions

These instructions apply to the entire repository.

---

## Backend Execution

* To run any Python script on the backend, always use:

  ```
  uv run <script>
  ```

---

## Data Models and Types, Source of Truth

* All data models are defined using **SQLModel** in:

  ```
  backend/app/models
  ```
* These models are the **single source of truth** for all data types in the project.
* The models are Pydantic based and their CRUD schemas are returned directly by the FastAPI routes in:

  ```
  backend/app/api/routes
  ```

---

## API, Type Generation, and Frontend Sync

* The FastAPI OpenAPI specification is used with **HeyAPI** and the **TanStack Query plugin** to generate:

  * TypeScript types
  * React Query hooks
* These generated files are used by the frontend.

### Important Rules

* **Never manually edit generated frontend types or hooks.**
* Any change to data types must follow this order:

  1. Update backend models
  2. Regenerate frontend types and hooks using:

     ```
     ./sync-types
     ```
* Manual edits to generated files will be overwritten.

---

## Modifying Models Safely

* You may edit backend models when requested.
* Always consider downstream impact:

  * Backend tests
  * Frontend generated types
  * Frontend query hooks

### Required Validation Steps After Model Changes

* From the backend directory:

  ```
  make ci
  ```
* From the frontend directory:

  ```
  npm run type-check
  npm run lint
  ```

---

## Testing Requirements

* Backend tests currently provide basic smoke test coverage for all endpoints.
* Whenever you implement a new feature:

  * Write **simple, readable smoke tests**
  * Tests should be capable of failing if the feature is broken
  * Do not write tests that are guaranteed to pass

---

## Frontend Development Guidelines

* Always use **shadcn/ui** components where possible.
* Core UI components live in:

  ```
  frontend/src/components/ui
  ```

### Creating New Components

* Prefer composing existing shadcn components for consistency.
* If a required component does not exist:

  * Create it inside the `ui` directory
  * Follow the same patterns as existing components
  * You may reference:

    ```
    https://github.com/shadcn-ui/ui
    ```

---

## Design Consistency

* Maintain consistent styling, structure, and interaction patterns across the frontend.
* Avoid introducing custom components when an existing shadcn component can be reused or extended.
