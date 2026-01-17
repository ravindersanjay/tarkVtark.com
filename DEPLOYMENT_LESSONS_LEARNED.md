# Deployment — Lessons Learned (TarkVtark.com)

Date: 2026-01-17

Overview
--------
This document captures deployment-related lessons learned while building and deploying the TarkVtark debate application (React frontend, Spring Boot backend, Postgres). It consolidates incidents we faced during the project, root causes, fixes applied, concrete checklists, debugging playbooks, commands and CI/CD recommendations so future deploys are fast, repeatable and recoverable.

Keep this file in the project root and update it as you learn new items.

Executive summary
-----------------
- Most deployment incidents were caused by configuration mismatches between environments (frontend bake-time envs vs backend runtime envs), outdated/failed pushes (Vercel building older commits), and brittle bootstrap code that threw when required environment variables were missing.
- Practical fixes: align frontend and backend Google client IDs, avoid throwing in client bootstrap when optional envs are missing, set environment variables in hosting provider BEFORE build (Vite), and ensure CI and hosting use consistent build commands.
- Key action: treat CI/hosting as a canonical environment — reproduce builds there and keep secrets out of code.

Concrete incidents and fixes (project-specific)
-----------------------------------------------
1. White page on production (www.debatemanch.com)
   - Symptom: Blank/white page with no console error visible to user.
   - Root cause: `frontend/src/main.jsx` threw during bootstrap if `VITE_GOOGLE_CLIENT_ID` was missing. React never mounted.
   - Fix applied: changed bootstrap to not throw; log helpful message and render app with Google Sign-In disabled. Also committed this change and ensured it gets pushed and built by Vercel.
   - Long-term: ensure `VITE_GOOGLE_CLIENT_ID` is set in Vercel environment variables for production builds.

2. Google OAuth "Invalid token" / 401 `invalid_client`
   - Symptom: When signing-in with Google on local dev or prod, backend returned "Invalid Google token" or Google popup returned `invalid_client`.
   - Root cause: Frontend used a different OAuth client id (Vite env) from what backend expected (`GOOGLE_CLIENT_ID`). ID token `aud` claim didn't match backend verifier audiences.
   - Fix applied: aligned values; updated `backend/.env` to include the same client id as frontend. Backend supports comma-separated audiences.
   - Long-term: Use a single Web OAuth client for the SPA, configure JavaScript origins, and set both frontend and backend envs to the same client id in hosting.

3. Render.com build failed with `./mvnw: No such file or directory`
   - Symptom: Render build failed immediately; wrapper script missing.
   - Root cause: Host build config expected `./mvnw` in the repo root while repo either lacked wrapper or used different location.
   - Fix: Update Render build command to use system `mvn` or include `mvnw` in repo and ensure executable bit is set. Documented the correct `render.yaml` and build steps.

4. Local build blocked by WSL1 / environment mismatch
   - Symptom: `npm run build` failed inside WSL1 with message to upgrade to WSL2.
   - Root cause: Local dev environment didn't match CI environment; developer used WSL1 which some toolchains no longer fully support.
   - Fix: Build in PowerShell or upgrade WSL to v2. Documented local dev prerequisites.

5. Push not reaching remote (Vercel building older commit)
   - Symptom: Site stayed old / broken after local fixes.
   - Root cause: local commit not pushed (or push blocked by credential prompt). Vercel continued to deploy `origin/main` (older SHA).
   - Fix: Push and verify remote HEAD equals local HEAD before expecting a new deployment. Use `git rev-parse --short HEAD` and compare with `git rev-parse --short origin/main`.

Key lessons (short)
-------------------
- Always set required environment variables in the hosting provider BEFORE build (Vite bakes VITE_* variables at build time).
- Client bootstrap code should not crash the entire app on missing non-critical envs; fail gracefully and log clearly.
- Keep a consistent OAuth client setup (Web app client) and ensure `aud` alignment. Backend should support multiple audiences for flexibility.
- CI/build environment differences are a frequent cause of "it works locally but not in CI" — make CI the development reference for builds.
- Verify the deployed commit SHA matches the fix you expect; do not assume push succeeded without checking.

Pre-flight deployment checklist (use before pushing to production)
-----------------------------------------------------------------
- Code & commit
  - [ ] git status clean, all changes committed
  - [ ] Run `npm run build` (frontend) and `./mvnw clean package` (backend) locally to surface build issues

- Environment and secrets
  - [ ] Add required frontend envs to hosting (Vercel env var `VITE_GOOGLE_CLIENT_ID`)
  - [ ] Add required backend envs to hosting (DB credentials, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, etc.)
  - [ ] Do not commit `.env` files; keep `.env.example` up to date

- CI / Hosting
  - [ ] Confirm hosting build command matches project's build expectations (Vercel auto build or custom command)
  - [ ] Check that the hosting provider has necessary runtime (JDK, Node) or that Docker is used with required base images

- Smoke tests locally
  - [ ] Serve frontend build and manually verify homepage, one debate page, Contact form, and Login modal
  - [ ] Start backend locally, verify DB connection, and call `/api/v1/auth/google` with a test token if available

Deploy checklist (run during/after deploy)
------------------------------------------
- [ ] Push to repo and confirm remote HEAD equals local HEAD
  ```bash
  git push origin main
  git fetch origin
  git rev-parse --short HEAD
  git rev-parse --short origin/main
  ```
- [ ] Watch hosting build logs and wait for success
- [ ] Open site in Incognito (hard refresh)
- [ ] DevTools → Console: no uncaught exceptions
- [ ] DevTools → Network: main JS, CSS load 200, no 404 assets
- [ ] Verify core user flows (view debates, open debate, contact form POST, login/modal behavior)

Rollback plan
-------------
- Use hosting UI to redeploy previous working build (Vercel/Render preserve previous builds).
- If using container registry, roll back to previous image tag.
- While investigating, enable maintenance page or redirect to a status page to prevent user confusion.

Debugging playbooks (fast triage)
---------------------------------
1) White page (blank) on production
   - Check Vercel build SHA vs local SHA (see commands above)
   - Open DevTools Console; copy the first error and stacktrace
   - Find the main JS asset in Network and inspect it for thrown messages
   - If message was a thrown error due to missing env, set the env in hosting and redeploy

2) Google OAuth `invalid_client` or "Invalid Google token"
   - Confirm frontend token `aud` value (capture ID token and decode payload):
     ```bash
     # replace TOKEN with the actual token
     echo 'TOKEN' | awk -F. '{print $2}' | base64 --decode | jq .
     ```
   - Confirm backend `GOOGLE_CLIENT_ID` includes the `aud` value
   - If not, align envs in both frontend and backend or set comma-separated list in `GOOGLE_CLIENT_ID`.
   - Confirm the Google Cloud OAuth client is of type "Web application" and includes your origin in Authorized JavaScript origins.

3) Build failed because `./mvnw` missing
   - Fix: either include the Maven wrapper in the repo (recommended) or change build command in hosting to `mvn` and ensure the environment has Maven installed.

4) Slow deploy / queued builds
   - On free-tier hosts builds may be queued. Schedule deploys or upgrade plan if rapid iterates required.

Quick reference commands
------------------------
- Compare local vs remote commits:
  ```bash
  git fetch origin
  git rev-parse --short HEAD
  git rev-parse --short origin/main
  ```
- Local frontend production build:
  ```bash
  cd frontend
  npm ci
  npm run build
  npx http-server dist -p 8080
  ```
- Local backend build & run:
  ```bash
  cd backend
  ./mvnw clean package -DskipTests
  java -jar target/*.jar
  ```
  (If `mvnw` missing, run `mvn` instead)

- Decode ID token payload:
  ```bash
  echo 'ID_TOKEN' | awk -F. '{print $2}' | base64 --decode | jq .
  ```

Vercel tips
-----------
- Set `VITE_GOOGLE_CLIENT_ID` in Vercel project settings → Environment Variables (Production) before build so the value gets baked into the production bundle.
- Confirm the deployed commit SHA in Vercel Deployments matches your pushed commit.
- If a deployment fails, view Build Logs, fix the error locally (reproduce), commit, push and redeploy.

Render.com tips
----------------
- If you use Maven wrapper, ensure `mvnw` and `.mvn` are included in repo and executable bit preserved.
- Otherwise set buildCommand to `cd backend && mvn clean package -DskipTests` and startCommand accordingly.

CI/CD recommendations
---------------------
- Use GitHub Actions for build & test. Example: run frontend build, run backend tests, then deploy.
- Include a post-deploy smoke-test step to hit a small set of endpoints (health, homepage) and fail the workflow if smoke tests fail.

Sample GH Actions smoke-test job (high-level)
```yaml
name: Deploy + Smoke Test
on: [push]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
      - name: Build Backend
        run: |
          cd backend
          ./mvnw clean package -DskipTests
      # Deploy steps depending on host (Vercel, Render, etc.)
      - name: Smoke tests
        run: |
          # example smoke tests
          curl -f https://your-site/ || exit 1
```

Security & operational notes
----------------------------
- Never commit secrets. Use provider env variables or a secrets manager.
- For front-end only variables remember `VITE_` prefix is required for inclusion in the client bundle; avoid putting secrets there.
- Prefer httpOnly cookies for session tokens in production (instead of localStorage) for security.

Next steps (recommended immediate actions)
-----------------------------------------
1. Push local fixes (the tolerant bootstrap change) to GitHub; ensure remote HEAD matches local HEAD.
2. Set `VITE_GOOGLE_CLIENT_ID` in Vercel production envs and trigger a new build.
3. Add a CI smoke-test and a health check endpoint for the backend.
4. Add documentation for production deploy (this file + `DEPLOY.md`) and ensure `.env.example` stays updated.

Appendix: Useful links & references
----------------------------------
- Google OAuth guide (Web apps): https://developers.google.com/identity
- Vite env docs: https://vitejs.dev/guide/env-and-mode.html
- Spring Boot externalized configuration: https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config

---

If you want I can also:
- Create a GitHub Actions workflow and add a smoke test job, or
- Add a small `/api/v1/debug/config` endpoint (admin-protected) to return non-sensitive runtime config for quick verification, or
- Help push the commit and watch Vercel build logs for you.

Tell me which of the above you'd like next and I will implement it.

