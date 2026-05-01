# RO Cortex

Turn unstructured clinical notes into structured patient data, then match those patients to clinical trials.

## What it does

1. **Note extraction** pulls diagnoses, medications with doses, vitals, lab results, symptoms, and referrals out of free text clinical notes
2. **ICD-10 coding** assigns standardized billing codes to each diagnosis with a confidence score
3. **Trial matching** ranks active clinical trials for a given patient using semantic similarity plus rule based eligibility
4. **End to end pipeline** runs all three steps in a single call

## Stack

- **Claude Haiku 4.5** for the extraction and coding work, with prompt caching on the ICD reference list
- **BioBERT sentence transformer** (`pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb`) for clinical text embeddings
- **FAISS** for fast nearest neighbor search over trial embeddings
- **FastAPI** backend, **PostgreSQL** for persistence, **React + Vite** frontend, all wired up with Docker Compose

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
| Dashboard | Live counters, pipeline diagram, and recent activity |
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
| `GET /demo-notes` | Sample notes for testing |

## Why this exists

This mirrors the kind of clinical NLP work that sits behind real payer and provider workflows: pulling structured data out of unstructured prose, assigning codes for billing and analytics, and connecting eligible patients to research opportunities.
