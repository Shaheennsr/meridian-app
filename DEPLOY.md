# Deploying Meridian QBank publicly

This app has real registration: passwords are hashed with bcrypt, accounts are
stored in a database, and sessions are handled by Auth.js (NextAuth). It is
fully working locally. To put it on the public internet with a real domain,
you need two free accounts — I can't create these for you, but each takes
under 2 minutes.

## 1. Push the code to GitHub

```bash
git init
git add .
git commit -m "Meridian QBank"
```

Create a new repo at https://github.com/new, then:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Get a free hosted Postgres database (Neon)

SQLite (used locally) doesn't persist on serverless hosts, so production needs
real Postgres.

1. Go to https://neon.tech, sign up, create a project.
2. Copy the connection string it gives you (starts with `postgresql://`).
3. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   to:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run once, locally, against the new database to create the tables:
   ```bash
   DATABASE_URL="<your neon connection string>" npx prisma migrate deploy
   ```

## 3. Deploy to Vercel

1. Go to https://vercel.com, sign up (GitHub login is easiest), click
   **Add New Project**, and import the repo you pushed.
2. Under **Environment Variables**, add:
   - `DATABASE_URL` — the Neon connection string from step 2
   - `AUTH_SECRET` — any random 32+ character string (generate one with
     `openssl rand -base64 32`)
3. Click **Deploy**.

That's it — Vercel gives you a public `https://your-app.vercel.app` URL.
Anyone can visit it, click **Create Account**, and register with a real
email + password; their account will persist.

## Optional: custom domain

In the Vercel project settings → Domains, add your own domain and follow
the DNS instructions it gives you.
