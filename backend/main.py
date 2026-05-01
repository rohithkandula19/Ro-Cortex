from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio
from datetime import datetime

from database import init_db, get_db, ClinicalNote, Patient, ClinicalTrial, TrialMatch
from extractors.ner import extract_clinical_entities
from matchers.trial_matcher import match_patient_to_trials, DEMO_TRIALS, embed_text, patient_to_text
from classifiers.icd_classifier import classify_icd_codes

app = FastAPI(title="RO Cortex", description="Clinical NLP Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ──────────────────────────────────────────────────────────

class NoteRequest(BaseModel):
    text: str
    patient_id: Optional[str] = None

class MatchRequest(BaseModel):
    patient_data: dict
    use_demo_trials: bool = True

class TrialRequest(BaseModel):
    trial_id: str
    title: str
    description: str
    conditions: List[str] = []
    inclusion_criteria: List[str] = []
    exclusion_criteria: List[str] = []
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender_required: Optional[str] = "any"


# ── Startup ──────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()
    seed_demo_trials()

def seed_demo_trials():
    db = next(get_db())
    try:
        for trial in DEMO_TRIALS:
            existing = db.query(ClinicalTrial).filter(
                ClinicalTrial.trial_id == trial["trial_id"]
            ).first()
            if not existing:
                db_trial = ClinicalTrial(**{k: v for k, v in trial.items()})
                db.add(db_trial)
        db.commit()
    except:
        db.rollback()
    finally:
        db.close()


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "RO Cortex",
        "description": "Clinical NLP Intelligence Platform",
        "version": "1.0.0",
        "status": "online"
    }


@app.post("/extract")
async def extract_note(request: NoteRequest, db: Session = Depends(get_db)):
    """
    Extract structured clinical entities from unstructured note text.
    Uses ClinicalBERT-inspired NER via LLM + ICD-10 classification.
    """
    if len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Note text too short")

    extracted = await extract_clinical_entities(request.text)
    diagnoses = extracted.get("diagnoses", [])
    icd_codes = await classify_icd_codes(request.text, diagnoses) if diagnoses else []
    extracted["icd_codes"] = icd_codes

    # Save to DB
    note = ClinicalNote(
        raw_text=request.text[:5000],
        patient_id=request.patient_id,
        extracted_data=extracted,
        icd_codes=icd_codes,
        confidence_score=extracted.get("confidence_score", 0)
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "note_id": note.id,
        "extracted": extracted,
        "icd_codes": icd_codes,
        "confidence_score": extracted.get("confidence_score", 0),
        "created_at": note.created_at.isoformat()
    }


@app.post("/match-trials")
async def match_trials(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Match a patient to clinical trials using:
    - BioBERT deep learning embeddings
    - FAISS vector similarity search
    - Rule-based eligibility filtering
    """
    trials = DEMO_TRIALS if request.use_demo_trials else []

    if not request.use_demo_trials:
        db_trials = db.query(ClinicalTrial).all()
        trials = [
            {
                "trial_id": t.trial_id,
                "title": t.title,
                "description": t.description,
                "conditions": t.conditions or [],
                "inclusion_criteria": t.inclusion_criteria or [],
                "exclusion_criteria": t.exclusion_criteria or [],
                "min_age": t.min_age,
                "max_age": t.max_age,
                "gender_required": t.gender_required,
            }
            for t in db_trials
        ]

    matches = await match_patient_to_trials(request.patient_data, trials)

    # Save matches to DB
    patient_id = request.patient_data.get("patient_id", f"P{datetime.utcnow().timestamp():.0f}")
    for match in matches:
        db_match = TrialMatch(
            patient_id=str(patient_id),
            trial_id=match["trial_id"],
            match_score=match["final_score"],
            match_reasons=match["match_reasons"],
            eligible=match["eligible"]
        )
        db.add(db_match)
    db.commit()

    return {
        "patient_id": patient_id,
        "total_trials_evaluated": len(trials),
        "matches": matches,
        "eligible_count": sum(1 for m in matches if m["eligible"])
    }


@app.post("/analyze-full")
async def analyze_full(request: NoteRequest, db: Session = Depends(get_db)):
    """
    Full pipeline: Extract entities → Classify ICD codes → Match trials
    End-to-end clinical NLP in one call.
    """
    # Step 1: Extract
    extracted = await extract_clinical_entities(request.text)
    diagnoses = extracted.get("diagnoses", [])

    # Step 2: ICD classification
    icd_codes = await classify_icd_codes(request.text, diagnoses) if diagnoses else []
    extracted["icd_codes"] = icd_codes

    # Step 3: Build patient profile from extracted data
    patient_data = {
        "age": extracted.get("patient", {}).get("age"),
        "gender": extracted.get("patient", {}).get("gender"),
        "diagnoses": diagnoses,
        "medications": [
            m.get("name", "") if isinstance(m, dict) else m
            for m in extracted.get("medications", [])
        ],
        "symptoms": extracted.get("symptoms", []),
    }

    # Step 4: Match to trials
    matches = await match_patient_to_trials(patient_data, DEMO_TRIALS)

    # Save to DB
    note = ClinicalNote(
        raw_text=request.text[:5000],
        patient_id=request.patient_id,
        extracted_data=extracted,
        icd_codes=icd_codes,
        confidence_score=extracted.get("confidence_score", 0)
    )
    db.add(note)
    db.commit()

    return {
        "note_id": note.id,
        "extracted": extracted,
        "icd_codes": icd_codes,
        "trial_matches": matches,
        "eligible_trials": [m for m in matches if m["eligible"]],
        "confidence_score": extracted.get("confidence_score", 0),
        "pipeline": ["NER Extraction", "ICD-10 Classification", "Trial Matching"],
    }


@app.get("/notes")
def get_notes(limit: int = 20, db: Session = Depends(get_db)):
    notes = db.query(ClinicalNote).order_by(ClinicalNote.created_at.desc()).limit(limit).all()
    return [
        {
            "id": n.id,
            "patient_id": n.patient_id,
            "raw_text": (n.raw_text or "")[:150],
            "diagnoses": (n.extracted_data or {}).get("diagnoses", []),
            "medications_count": len((n.extracted_data or {}).get("medications", [])),
            "icd_codes": n.icd_codes or [],
            "confidence_score": n.confidence_score,
            "created_at": n.created_at.isoformat() if n.created_at else ""
        }
        for n in notes
    ]


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    notes = db.query(ClinicalNote).all()
    matches = db.query(TrialMatch).all()
    total = len(notes)
    avg_conf = round(sum(n.confidence_score or 0 for n in notes) / total, 1) if total else 0
    total_diagnoses = sum(len((n.extracted_data or {}).get("diagnoses", [])) for n in notes)
    total_meds = sum(len((n.extracted_data or {}).get("medications", [])) for n in notes)

    return {
        "total_notes_analyzed": total,
        "avg_confidence": avg_conf,
        "total_diagnoses_extracted": total_diagnoses,
        "total_medications_extracted": total_meds,
        "total_trial_matches": len(matches),
        "eligible_matches": sum(1 for m in matches if m.eligible),
        "available_trials": len(DEMO_TRIALS),
    }


@app.get("/trials")
def get_trials():
    return DEMO_TRIALS


# Demo notes for quick testing
DEMO_NOTES = [
    {
        "label": "🫀 Diabetic Patient",
        "text": "67 year old male presents with poorly controlled T2DM (HbA1c 9.2%). Currently on Metformin 1000mg BID and Glipizide 5mg daily. BP 148/92 mmHg, HR 78 bpm. Weight 98kg. Reports increased thirst and frequent urination. Labs show eGFR 52 (CKD stage 3). Referred to endocrinology for insulin initiation. Advised dietary modification and increased physical activity."
    },
    {
        "label": "🎗️ Oncology Patient",
        "text": "54 year old female with stage II breast cancer, ER-positive. Currently on Tamoxifen 20mg daily. Last mammogram 6 months ago showed stable disease. Referred to oncology for follow-up and consideration of aromatase inhibitor switch. Patient reports mild joint pain and hot flashes. No evidence of metastatic disease on recent CT chest/abdomen/pelvis."
    },
    {
        "label": "❤️ Cardiac Patient",
        "text": "72 year old male admitted for acute exacerbation of CHF. EF 30% on last echo. On Carvedilol 25mg BID, Lisinopril 10mg daily, Furosemide 40mg daily, Spironolactone 25mg daily. BP 110/70, HR 88, O2 sat 94% on room air. Weight gain of 4kg in past week. BNP elevated at 1200. Chest X-ray shows pulmonary edema. Plan to increase Furosemide and monitor closely."
    },
]


@app.get("/demo-notes")
def get_demo_notes():
    return DEMO_NOTES
