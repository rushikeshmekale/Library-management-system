# LBS Library Management System — Backend

A RESTful backend API built with **Node.js + Express.js + MongoDB Atlas**.

Supports role-based authentication (Librarian & Member) with JWT.

---

## 🚀 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Free Tier)
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcrypt
- **Validation:** express-validator

---

## 📁 Project Structure

```
library-backend/
├── config/db.js                   # MongoDB connection
├── controllers/
│   ├── authController.js          # Register, Login
│   ├── bookController.js          # Book CRUD + borrow/return
│   └── memberController.js        # Member management + loans
├── middleware/
│   ├── authMiddleware.js          # JWT verification
│   ├── roleMiddleware.js          # Role-based access control
│   └── errorMiddleware.js         # Centralized error handler
├── models/
│   ├── User.js                    # User schema (member/librarian)
│   ├── Book.js                    # Book schema
│   └── Borrow.js                  # Borrow record schema
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── memberRoutes.js
├── validators/validationRules.js  # express-validator rules
├── seed-librarian.js              # One-time librarian seed script
├── server.js                      # Entry point
└── .env                           # Environment variables (not committed)
```

---

## ⚙️ Installation & Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Edit the `.env` file:

```env
PORT=5000
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/library?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Set up MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com → Create free account
2. Create a free M0 cluster
3. Add a database user (Database Access)
4. Allow all IPs: 0.0.0.0/0 (Network Access)
5. Get connection string → paste into `DATABASE_URL` in `.env`

### 4. Seed the librarian account

Librarians cannot self-register (per requirements). Run this once:

```bash
npm run seed
```

This creates:
- **Email:** `admin@library.com`
- **Password:** `admin123`

### 5. Run the development server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

---

## 🔌 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register as member |
| POST | `/api/auth/login` | Login (returns JWT token) |

**Register Request Body:**
```json
{
  "name": "Rohith Kumar",
  "email": "rohith@markanthony.com",
  "password": "password123"
}
```

**Login Request Body:**
```json
{
  "email": "rohith@markanthony.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": { "id": "...", "name": "Rohith Kumar", "email": "...", "role": "member" }
}
```

---

### Books (Authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/books` | All | Get all books (supports ?search=&category=&page=&limit=) |
| GET | `/api/books/:id` | All | Get single book |
| POST | `/api/books` | Librarian | Add new book |
| PUT | `/api/books/:id` | Librarian | Update book |
| DELETE | `/api/books/:id` | Librarian | Delete book |
| POST | `/api/books/:id/borrow` | Member | Borrow a book |
| POST | `/api/books/:id/return` | Member | Return a book |

**Add/Update Book Body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0-13-235088-4",
  "category": "Programming",
  "quantity": 5
}
```

---

### Members (Authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/members` | Librarian | Get all members |
| GET | `/api/members/me/books` | Member | Get my borrowed books |
| GET | `/api/members/all-borrows` | Librarian | Get all borrow records |
| DELETE | `/api/members/:id` | Librarian | Delete a member |

---

## 🔐 Authentication

All protected routes require a Bearer token in the header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## ✅ Validation Rules

- **name** — required, non-empty
- **email** — valid email format, unique
- **password** — minimum 6 characters
- **title, author, isbn** — required for books
- **quantity** — non-negative integer
- **:id params** — valid MongoDB ObjectId

---

## ❌ Error Response Format

```json
{
  "success": false,
  "message": "Book is currently unavailable."
}
```

---

## 🔑 Authorization Rules

| Action | Member | Librarian |
|--------|--------|-----------|
| View books | ✅ | ✅ |
| Borrow books | ✅ | ❌ |
| Return books | ✅ | ❌ |
| Add/Edit/Delete books | ❌ | ✅ |
| View all members | ❌ | ✅ |
| Delete members | ❌ | ✅ |
| View all loans | ❌ | ✅ |

---

## 🚢 Deploy to Render

1. Push code to GitHub (without `.env`)
2. Go to https://render.com → New Web Service
3. Connect your GitHub repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables (same as `.env`)
6. Click Deploy
7. After deploy, run seed via Render Shell: `node seed-librarian.js`

---

## 🎁 Bonus Features Implemented

- ✅ **Pagination** — `GET /api/books?page=1&limit=10`
- ✅ **Search** — `GET /api/books?search=clean+code`
- ✅ **Category filter** — `GET /api/books?category=Programming`
