# PADDOX Next.js Foundation — Phase R1

Safe new frontend foundation for the PADDOX premium React/Next.js migration.

## Run locally

```bash
cd paddox-next
npm install
npm run dev
```

Open: http://localhost:3000

## Environment

Copy `.env.example` to `.env.local` and update the backend API URL if needed.

```bash
cp .env.example .env.local
```

## Important

This folder is designed to sit beside the current working project:

```txt
backend/
frontend/
paddox-next/
```

Do not delete the old `frontend/` until the new Next.js version is fully tested and approved.
