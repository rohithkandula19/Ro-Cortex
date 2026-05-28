> **⚠️ All Rights Reserved.** This repository is published for viewing and portfolio purposes only. The code is **not** open source — reuse, redistribution, modification, or derivative works are not permitted without written permission. See [LICENSE](./LICENSE).
# RO Cortex

Clinical NLP that ships to production. Cortex extracts structured data from unstructured clinical notes, identifies patients for active trials, and feeds the result into downstream healthcare systems.

> A short demo gif lives at `docs/demo.gif` once recorded. Capture with `Cmd+Shift+5`, convert via `ffmpeg -i out.mov -vf "fps=12,scale=1200:-1" docs/demo.gif`.

## What it does

This mirrors the three jobs that real clinical AI teams (Optum AI, large payer and provider data orgs) ship every day:

1. **Extract structured clinical data from unstructured text.** Pull diagnoses, medications with doses, vitals, lab results, symptoms, and referrals out of free text notes. ICD-10 codes attached with per-field confidence scores.
2. **Identify patients for clinical trials.** BioBERT embeddings plus FAISS rank active trials by semantic fit, then rule based eligibility filters cut the list to who actually qualifies.
3. **Improve downstream healthcare decision making.** Clean deterministic JSON flows into your data warehouse, EHR write back, or analytics layer so coders, researchers, and clinicians work off the same source of truth.

## Stack

- **Claude Haiku 4.5** for the extraction work, with prompt caching on the ICD reference list for sub second second-call latency
- **BioBERT sentence transformer** (`pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb`) for clinical text embeddings
- **FAISS** for fast nearest neighbor search over trial embeddings
- **FastAPI + PostgreSQL** backend, **React + Vite + Tailwind** frontend, **Docker Compose** for local + reproducible deploy

## Quick start

```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

docker-compose up --build
```

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## Pages

| Page | What it does |
|---|---|
| Dashboard | Marketing surface plus live counters, sample JSON output, and FAQ |
| Extract | Paste a note, get back structured entities and ICD codes |
| Trial Matcher | Drop in a patient profile, see ranked trial matches with eligibility reasons |
| Pipeline | Run extraction, coding, and trial matching together on a single note |
| History | Browse every analysis your team has run |

## API

| Endpoint | What it returns |
|---|---|
| `POST /extract` | Structured entities plus ICD-10 codes for one note |
| `POST /match-trials` | Ranked trial matches for a patient profile |
| `POST /analyze-full` | Extraction, coding, and trial matching together |
| `GET /notes` | Recent analyses |
| `GET /stats` | Aggregate counters |
| `GET /trials` | Available demo trials |
| `GET /demo-notes` | Ten realistic sample notes spanning specialties |

## Why this matches Optum AI

Optum AI is hiring senior, lead, and director ML engineers to build large scale AI and NLP systems on top of billions of clinical notes. Their three explicit pillars are:

> extracting structured clinical data from unstructured text
> identifying patients for clinical trials
> improving downstream healthcare decision making

Cortex is a working, deployable take on all three pillars in one repo. It runs on a real LLM, real embeddings, real vector search, and a real Postgres + FastAPI + React stack with Docker Compose, the same shape you would expect from a production ML platform team.

## Deploy

### AWS (Amplify + App Runner + RDS)

The most "Optum-shaped" deploy. App Runner runs the same Docker image you use
locally, RDS gives you managed Postgres, Amplify hosts the static frontend.

1. **Push the backend image to ECR**
   ```bash
   aws ecr create-repository --repository-name ro-cortex-backend
   docker build -f backend/Dockerfile.prod -t ro-cortex-backend backend/
   docker tag ro-cortex-backend:latest <acct>.dkr.ecr.<region>.amazonaws.com/ro-cortex-backend:latest
   aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.<region>.amazonaws.com
   docker push <acct>.dkr.ecr.<region>.amazonaws.com/ro-cortex-backend:latest
   ```

2. **Spin up RDS Postgres** (db.t3.micro for free tier). Note the connection string.

3. **Create the App Runner service** — point at your ECR image, set env vars
   `ANTHROPIC_API_KEY` and `DATABASE_URL` in the console. App Runner reads
   `apprunner.yaml` automatically.

4. **Connect Amplify** — in the Amplify console, connect this GitHub repo. It
   reads `amplify.yml` and builds the `frontend/` directory. Add `VITE_API_URL`
   pointing at your App Runner URL.

### Firebase Hosting + Cloud Run + Supabase

Cheaper, scales to zero, no Cloud SQL bill. The frontend lives on Firebase
Hosting, the backend container runs on Cloud Run, and Supabase handles Postgres.

1. **Build and deploy the backend to Cloud Run**
   ```bash
   gcloud builds submit backend --tag gcr.io/<project>/ro-cortex-backend
   gcloud run deploy ro-cortex-api \
     --image gcr.io/<project>/ro-cortex-backend \
     --region us-central1 \
     --memory 2Gi \
     --set-env-vars "ANTHROPIC_API_KEY=...,DATABASE_URL=postgresql://..."
   ```

2. **Provision Supabase Postgres** (free tier). Copy the connection string into
   the Cloud Run env var above.

3. **Deploy the frontend to Firebase Hosting**
   ```bash
   cd frontend && npm run build && cd ..
   firebase deploy --only hosting
   ```
   `firebase.json` and `.firebaserc` are already set up. Set `VITE_API_URL`
   in `frontend/.env.production` before building so the bundle points at your
   Cloud Run URL.

## Architecture

```
┌──────────────┐    ┌──────────────────────────────┐    ┌─────────────┐
│  React + UI  │───▶│  FastAPI (Cortex services)   │───▶│ PostgreSQL  │
└──────────────┘    │                              │    └─────────────┘
                    │  • /extract  (NER + ICD)     │
                    │  • /match-trials (BioBERT)   │           
                    │  • /analyze-full (pipeline)  │    ┌─────────────┐
                    └──────────────┬───────────────┘    │   FAISS     │
                                   │                    │ trial index │
                                   ▼                    └─────────────┘
                            ┌────────────┐
                            │ Claude API │
                            │ (Haiku 4.5)│
                            └────────────┘
```