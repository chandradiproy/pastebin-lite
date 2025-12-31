# Pastebin Lite

A secure, ephemeral text sharing application built with **Node.js**, **React**, and **PostgreSQL**. This project allows users to create text pastes that automatically expire based on time (TTL) or view counts ("Burn after reading").

🔗 **Repository:** [https://github.com/chandradiproy/pastebin-lite/](https://github.com/chandradiproy/pastebin-lite/)

---

## 🚀 Features

- **Ephemeral Pastes:** Set expiration times (Minutes, Hours, Days) or infinite duration.
- **Burn After Reading:** Set a maximum view count (e.g., "Delete after 5 views").
- **Atomic View Counting:** Uses database-level locking to ensure view counts are strictly enforced, even under high concurrency.
- **Modern UI:** Clean, responsive design built with **React** and **Tailwind CSS**.
- **Dark Mode:** Fully supported dark theme with manual toggle and system preference detection.
- **Secure:** Content is rendered safely to prevent XSS attacks.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS (v3), Lucide React.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (via Neon Tech / `pg` driver).
- **Architecture:** Monorepo (Client + Server).
- **Deployment:** Render (Web Service).

---

## ⚙️ Persistence & Design Decisions

### Why PostgreSQL?

For this project, **PostgreSQL** was chosen over NoSQL (MongoDB) or Key-Value stores (Redis) primarily for **ACID compliance** regarding the "View Limit" feature.

- **Atomic Decrements:** When a paste has `views_left = 1` and multiple users request it simultaneously, a standard read-then-write approach causes race conditions (allowing more views than intended).
- **Solution:** I utilized PostgreSQL's `UPDATE ... RETURNING` syntax to atomically decrement the counter and fetch the data in a single transaction. This ensures strict adherence to the view limit constraint.

### Monorepo Structure

The project uses a monorepo structure to keep frontend and backend logic tightly coupled but independently manageable:

- `/server`: Express.js API logic.
- `/client`: Vite + React Frontend.
- `Root`: Orchestrates build and start commands for easier deployment (e.g., on Render).

---

## 💻 Local Setup Guide

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database (Local or Cloud like Neon/Supabase)

### 1. Clone the Repository

```bash
git clone https://github.com/chandradiproy/pastebin-lite.git
cd pastebin-lite

```

### 2. Install Dependencies

This project is configured to install dependencies for both client and server from the root.

```bash
npm install
# This triggers a post-install script that runs npm install in both subfolders

```

### 3. Database Setup

Connect to your PostgreSQL database and run the following SQL to create the required table:

```sql
CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  views_left INTEGER
);

```

### 4. Environment Variables

Create a `.env` file in the **root** directory:

```env
# Connection string to your PostgreSQL database
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Optional: Server Port (Default is 5000)
PORT=5000

# Optional: Enable x-test-now-ms header for grading scripts
TEST_MODE=1

```

### 5. Run Locally (Development)

For the best development experience (with Hot Reloading), run the client and server in separate terminals.

**Terminal 1 (Backend):**

```bash
cd server
npm run dev
# Runs on http://localhost:5000

```

**Terminal 2 (Frontend):**

```bash
cd client
npm run dev
# Runs on http://localhost:5173

```

_Note: The frontend is configured to proxy `/api` requests to port 5000._

---

## 🚀 Deployment (Render)

This project is optimized for deployment on **Render** as a Web Service.

1. **Build Command:** `npm install && npm run build`

- _Installs dependencies and builds the React frontend to `client/dist`._

2. **Start Command:** `npm start`

- _Starts the Express server which serves the API and the static React files._

3. **Environment Variables:** Add your `DATABASE_URL` in the Render dashboard.

---

## 🔌 API Endpoints

### `GET /api/healthz`

Checks if the service and database are reachable.

- **Response:** `200 OK` `{ "ok": true }`

### `POST /api/pastes`

Create a new paste.

- **Body:**

```json
{
  "content": "Hello World",
  "ttl_seconds": 3600, // Optional
  "max_views": 5 // Optional
}
```

- **Response:** `{ "id": "...", "url": "..." }`

### `GET /api/pastes/:id`

Retrieve a paste. **Note:** This action decrements the view count.

- **Response:**

```json
{
  "content": "Hello World",
  "remaining_views": 4,
  "expires_at": "2024-03-20T10:00:00.000Z"
}
```

- **Error:** `404 Not Found` (If ID is invalid, expired, or burned).

---
