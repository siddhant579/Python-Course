# PyLearn — Python Learning Management Platform

A production-ready, full-stack LMS built with **React (Vite)** + **Node.js/Express** + **MongoDB (Mongoose)**.
Course content — weeks, topics, lessons, exercises, quizzes — is **never hardcoded**. It comes exclusively from
PDF course material uploaded and reviewed through the Admin Dashboard, via the pipeline:

```
Upload PDF → Process (extract text) → Draft structure → Admin review/edit → Publish → MongoDB → Student site
```

## Architecture

```
React (Vite, Tailwind, Axios) ──REST──▶ Express API ──Mongoose──▶ MongoDB Atlas
```

React never talks to MongoDB directly. Every write is authorized server-side (JWT + role middleware), not just
hidden in the UI.

```
client/   React frontend (Vite, Tailwind, React Router, Axios, Recharts, Lucide)
server/   Node.js/Express REST API (Mongoose models, controllers, routes, middleware)
```

See [`client/src`](client/src) and [`server`](server) for the full folder layout — components/pages/layouts/
services on the frontend; controllers/models/routes/middleware/services on the backend.

## Tech stack

- **Frontend:** React 18, Vite, React Router 6, Tailwind CSS, Axios, Lucide React, Recharts, react-hot-toast
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, multer (PDF upload), pdf-parse (text extraction), helmet, express-rate-limit, express-mongo-sanitize
- **Database:** MongoDB Atlas

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB for development) and its connection string

## 1. Clone & install

```bash
git clone <your-repo-url> pylearn
cd pylearn

cd server && npm install
cd ../client && npm install
```

## 2. Environment variables

**server/.env** (copy from `server/.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=ChangeMe123!
MAX_UPLOAD_SIZE_MB=25
```

**client/.env** (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files — they're already in `.gitignore`. `.env.example` files are committed so collaborators
know which variables to set.

## 3. MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user (username/password).
3. Under Network Access, allow your IP (or `0.0.0.0/0` for development).
4. Copy the connection string into `server/.env` as `MONGODB_URI`, with your database name (e.g. `/lms`) appended.

## 4. Seed the first admin account

Course content is **not** seeded — only the admin user, so you can log in and start uploading PDFs.

```bash
cd server
npm run seed
```

This creates one admin using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`. Change the password after
first login in production.

## 5. Run locally

```bash
# Terminal 1 — API
cd server
npm run dev        # nodemon, http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev         # Vite, http://localhost:5173
```

Log in as the seeded admin, go to **Admin → PDF Documents**, create a course under **Admin → Courses**, upload
your Python course PDF, click **Process**, review/edit the extracted draft under **Content Review**, then
**Publish**. Publish the resulting weeks/topics/lessons individually (or via their list pages) once you're happy
with them — publishing a document creates content as drafts by design, so nothing reaches students unreviewed.

## 6. Building the frontend for production

```bash
cd client
npm run build      # outputs client/dist
npm run preview    # sanity-check the production build locally
```

## GitHub

```bash
git init
git add .
git commit -m "Initial commit: PyLearn LMS"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Deployment

### Frontend → Vercel

1. Import the repo in Vercel, set the project root to `client/`.
2. Framework preset: **Vite**. Build command `npm run build`, output dir `dist` (auto-detected).
3. Environment variable: `VITE_API_URL` = your deployed API's `/api` base URL.
4. `client/vercel.json` adds an SPA rewrite so client-side routes (e.g. `/courses/123`) don't 404 on refresh.

### Backend → two supported paths

**Option A — Vercel serverless (same repo, `server/` as its own Vercel project):**

`server/api/index.js` re-exports the same Express app used locally, and `server/vercel.json` routes all
requests to it. This works for every JSON API route. **Caveat:** Vercel's filesystem is read-only/ephemeral, so
the PDF upload flow (`multer` disk storage + `/uploads` static route) won't persist files across invocations.
For production PDF uploads on Vercel, swap `server/middleware/upload.js`'s storage engine for an object store
(S3, Cloudinary, Vercel Blob) — the rest of the document pipeline (process/draft/review/publish) is unaffected
since it only needs the file to exist long enough to run `pdf-parse` during the same request/short-lived
container.

**Option B — a traditional Node host (Render, Railway, Fly.io, a VPS, etc.):**

Simplest for the PDF workflow since local disk storage just works. Deploy `server/` with `npm start`, set the
same environment variables, and point `client`'s `VITE_API_URL` at it. This is the **recommended default** if
you plan to rely on PDF uploads heavily; use Option A if you want everything on Vercel and are fine adding an
object-storage step later.

Either way, set these in your host's environment variable settings — never in code:

```
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL      (your deployed frontend URL, for CORS)
NODE_ENV=production
```

### MongoDB Atlas (production)

Use a dedicated production database/user, restrict Network Access to your backend host's IP (or use Atlas's
"allow access from anywhere" only if your host has no static IP), and rotate `JWT_SECRET` if it's ever exposed.

## API overview

All responses follow `{ success: true, data }` or `{ success: false, message }`. Full route list lives in
[`server/routes`](server/routes) — auth, courses (+ nested weeks/topics/lessons/exercises), quizzes + questions
+ submit/results, progress, documents (PDF workflow), users/admin stats. Admin-only routes are enforced by
`middleware/auth.js`'s `authorize('admin')` — never trust the frontend hiding a button.

## Notes on scalability

`Course.category` is a free-text field (not an enum), so the same schema hosts Python, SQL, Excel, Data
Analytics, ML or JS courses without any model changes — only the PDF content and admin-entered category differ.
