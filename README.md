# Sree Varsha M — Portfolio

A data-driven personal portfolio built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL and Drizzle ORM.

## Run locally

1. Install Node.js (use a current Node.js 22 LTS release) and Git.
2. Create a PostgreSQL database with Neon or Supabase.
3. Copy `.env.example` to `.env.local`.
4. Add your PostgreSQL connection string and a private admin passkey to `.env.local`.
5. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
ADMIN_PASSKEY=replace-with-a-long-private-passkey
```

Do not commit `.env.local`, database passwords, or the Admin Studio passkey to GitHub. Set these variables in your deployment provider's project settings as well.

## Deployment note

This is a **full-stack Next.js application**, not a static HTML website. It uses server API routes and PostgreSQL for portfolio records, Admin Studio changes, contact messages, and resume generation. GitHub Pages cannot run those server/database features. Use a Next.js-compatible host such as Vercel, Railway or Render, and connect your GitHub repository to that host.

GitHub remains the place where you store and edit the source code. The hosting provider builds and serves the live website.

## Editing portfolio content

- Built-in Admin Studio: edit records in the website's Studio interface after configuring the database and `ADMIN_PASSKEY`.
- Source-controlled defaults: edit `src/lib/default-portfolio-data.ts`. These values seed a new/empty database and are also used as fallback data.
- Images: see [`ASSET_UPLOAD_GUIDE.md`](./ASSET_UPLOAD_GUIDE.md).

**Database note:** changing the seed file does not automatically overwrite records already saved in an existing database. For a fresh setup, the updated seed data is inserted when the database is first initialized. For an already-initialized database, edit records through Admin Studio or use its reset/update workflow carefully.

## Preserved template systems

The existing interface and feature components are retained. This ZIP updates the default portfolio content and adds organized asset folders and documentation; it does not redesign the UI.
