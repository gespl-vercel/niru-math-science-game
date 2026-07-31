# Niru Quest Lab

Interactive **Math & Science** learning games built with **Next.js**, **MySQL**, and optional login. Admins can configure **SMTP** to send mail.

## Features

- **Play without login** (guest) or create a student account
- **Math game** with addition, subtraction, multiplication, division
- **Difficulty levels**: Simple · Medium · Hard · Very Hard (grade-wise)
- **Science** subject placeholder (coming soon)
- **Admin panel** to configure SMTP and send a test email
- **Scoreboard** saved in MySQL (guests + logged-in players)

## Stack

- Next.js (App Router) + React + TypeScript + Tailwind CSS
- MySQL (`mysql2`)
- Auth: JWT cookie (`jose`) + `bcryptjs`
- Mail: `nodemailer`

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure MySQL

Copy `.env.example` to `.env.local` (a starter `.env.local` is included) and set your MySQL credentials:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=niru_game
JWT_SECRET=change-me-to-a-long-random-secret
```

### 3. Create tables + admin user

Make sure MySQL is running, then:

```bash
npm run db:seed
```

Default admin:

- Email: `admin@niru.local`
- Password: `Admin@123`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Using the app

| Path | What it does |
|------|----------------|
| `/` | Home |
| `/play` | Choose subject / math level |
| `/play/math?level=simple` | Math round |
| `/login` · `/register` | Optional accounts |
| `/scores` | Leaderboard |
| `/admin` | SMTP settings (admin only) |

## SMTP (admin)

1. Log in as admin → **Admin**
2. Enter host, port, username, password, from email
3. Save, then send a **test email**

## Project layout

```
src/app          Pages + API routes
src/components   UI (game, auth, SMTP form)
src/lib          DB, auth, mail, math engine
scripts/         MySQL schema + seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:seed` | Create DB schema + admin |
