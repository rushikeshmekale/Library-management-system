# LBS Library Management System — Frontend

React + Vite + TypeScript SPA. Deployed on Vercel.

## Setup

```bash
npm install
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# http://localhost:5173
```

## Deploy to Vercel

1. Push to GitHub
2. Import on vercel.com → Framework: Vite
3. Add env variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Librarian | admin@library.com | admin123 |
| Member | Register via /auth | — |

## Pages

| Route | Role | Description |
|-------|------|-------------|
| /auth | Public | Sign in / Sign up |
| /dashboard | All | Browse and borrow books |
| /my-books | Member | View and return borrowed books |
| /manage | Librarian | Books, Members, All Loans |
