# Supabase Deployment Guide (very simple step-by-step)

This file shows how to connect the backend and frontend to Supabase (database + storage).
I explain it like you're 10 years old: short steps, easy commands, and where to put secrets.

---

Goal
- Use Supabase for the Postgres database and for file storage (attachments).
- Put keys and URLs into the `.env` files we added earlier.

What you will do (high level)
1. Create a Supabase project (database).
2. Copy the database connection info into backend env.
3. Create a Storage bucket called `attachments`.
4. Copy the ANON key to the frontend env and the SERVICE_ROLE key to the backend env.
5. Deploy the backend to a host and set the backend env vars there.
6. Redeploy frontend (Vercel) with the ANON key.

Prerequisites
- A Supabase account: https://app.supabase.com (create one for free).
- Access to your frontend on Vercel (you said frontend is already on Vercel).
- A place to host the backend (Render, Railway, Fly, Heroku, etc.). Vercel cannot host a Java Spring Boot backend.

Steps (simple, one by one)

1) Create Supabase project
- Go to https://app.supabase.com and sign in.
- Click "New project".
- Give a name (for example: `tarkv-tark-prod`).
- Set a password (remember it!).
- Pick a region and click "Create project".

2) Get the database connection (JDBC)
- Open your project in Supabase dashboard.
- Left menu → Settings → Database → Connection string (or Connection info).
- Copy the JDBC string. It looks like:

```
jdbc:postgresql://db.<project>.supabase.co:5432/postgres?sslmode=require
```

- In your backend `.env` (on the server), set:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://db.<project>.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<the-password-you-set>
```

3) Create a Storage bucket
- In Supabase dashboard, left menu → Storage.
- Click "Create a new bucket".
- Name it `attachments`.
- For testing you can set it to Public (easier). For production use Private and sign URLs.

4) Get API keys
- In Supabase dashboard, left menu → Settings → API.
- Copy these two keys:
  - anon public key (safe for frontend) — `VITE_SUPABASE_ANON_KEY`
  - service_role key (secret) — put this in backend only: `SUPABASE_SERVICE_ROLE_KEY`

5) Configure backend env variables (safe, server-side only)
- On your backend host (Render, Railway, etc.) set these environment variables:

```
FILE_PROVIDER=supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key_here>
SUPABASE_STORAGE_BUCKET=attachments
SPRING_DATASOURCE_URL=jdbc:postgresql://db.<project>.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<db-password>
JWT_SECRET=<strong secret>
```

Important: do NOT put `SUPABASE_SERVICE_ROLE_KEY` in frontend env or in git.

6) Configure frontend env variables (Vercel)
- In Vercel dashboard for your frontend project → Settings → Environment Variables.
- Add:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_public_key>
VITE_API_URL=https://api.your-domain.com/api/v1   # or your backend URL
```

- Save and redeploy the frontend.

7) Test file upload using the app
- Open the frontend app in the browser.
- Make a new post and attach a small file, submit.
- In Supabase dashboard → Storage → attachments you should see the file listed.

Manual curl upload (server-side; uses SERVICE_ROLE key)
```
curl -X POST "https://<project>.supabase.co/storage/v1/object/attachments" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -F "file=@/path/to/test.png;filename=attachments/test.png"
```

Manual curl delete (server-side)
```
curl -X DELETE "https://<project>.supabase.co/storage/v1/object/attachments/attachments/test.png" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

8) If the bucket is private (recommended for real data)
- Keep the bucket private.
- Backend should return signed URLs for downloads (we can add an endpoint to request a signed URL). Ask me to add this if you want.

Simple checks and troubleshooting (like a checklist)
- If uploads fail, check backend logs for missing SUPABASE_SERVICE_ROLE_KEY.
- If DB fails, check `SPRING_DATASOURCE_URL` and the password.
- If frontend can't access Supabase client features, make sure you set `VITE_SUPABASE_ANON_KEY` in Vercel and redeploy.

Security tips
- Never commit `.env` with secrets into Git.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Use private buckets for user files and issue signed URLs for downloads.

How to set local dev .env files (quick)
- Backend local: copy `backend/.env.dev` to `backend/.env` and edit values.

```powershell
copy .\backend\.env.dev .\backend\.env
cd backend
mvn -DskipTests spring-boot:run
```

- Frontend local: copy `frontend/.env.dev` to `frontend/.env` and edit values, then run:

```powershell
copy .\frontend\.env.dev .\frontend\.env
cd frontend
npm install
npm run dev
```

Extras I can add for you
- Signed URL generation for private buckets (backend endpoint).
- Streaming multipart upload for very large files (avoid memory buffering).
- Example GitHub Actions workflow to deploy backend and set env variables (CI/CD).

If you want me to add signed-URL support now, reply: "Add signed URL support" and I will implement it.

---

End of guide — you can follow these steps now. If you want, tell me where you host the backend (Render, Railway, etc.) and I will give exact deploy settings for that host.

