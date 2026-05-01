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
