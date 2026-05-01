# RO Cortex — Clinical NLP Intelligence Platform

End-to-end clinical NLP platform that transforms unstructured doctor notes into structured intelligence.

## What it does

1. **Clinical NER** — Extracts diagnoses, medications, vitals, lab results, referrals from unstructured notes
2. **ICD-10 Classification** — Deep learning multi-label classifier assigns standardized medical codes
3. **Patient-Trial Matching** — BioBERT embeddings + FAISS vector search matches patients to clinical trials
4. **Full Pipeline** — All 3 steps in one call, end-to-end

## Deep Learning Stack

- **ClinicalBERT** — Named Entity Recognition on clinical text
- **BioBERT (sentence-transformers)** — Clinical text embeddings for semantic matching
- **FAISS** — Fast vector similarity search for trial matching
- **Claude Sonnet** — LLM backbone for NER + ICD classification
- **Multi-label Classification** — ICD-10 code assignment

## Quick Start

### With Docker (recommended)
```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY

docker-compose up --build
```

### Without Docker
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Open
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## Pages

| Page | What it does |
|---|---|
| Dashboard | Overview, pipeline visualization, recent analyses |
| NER Extract | Paste a clinical note → get structured entities + ICD codes |
| Trial Matcher | Enter patient profile → match to clinical trials |
| Full Pipeline | One note → NER + ICD + Trial matching in one flow |
| History | All past analyses with expandable detail |

## API

| Endpoint | Description |
|---|---|
| POST /extract | Clinical NER + ICD classification |
| POST /match-trials | BioBERT patient-trial matching |
| POST /analyze-full | Full pipeline in one call |
| GET /notes | Analysis history |
| GET /stats | Aggregate statistics |
| GET /trials | Available clinical trials |
| GET /demo-notes | Sample clinical notes for testing |

## Relevant for Optum AI

This directly mirrors the core clinical NLP work at Optum:
- Extracting structured data from unstructured clinical notes
- ICD-10 code classification from free text
- Patient matching for clinical trial identification
- Production-ready FastAPI + PostgreSQL + Docker architecture
