# Backend

Node + Express API layer for Budget Buddy.

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
```

3. Run:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `GET /api/expenses`
- `POST /api/expenses`
- `DELETE /api/expenses/:id`

## Database

Run the schema in [`db/supabase-schema.sql`](./db/supabase-schema.sql) in Supabase SQL Editor.
