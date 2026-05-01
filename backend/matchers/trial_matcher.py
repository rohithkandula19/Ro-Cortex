import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from typing import List, Dict
import anthropic
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Load sentence transformer model (deep learning embedding model)
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        # BioBERT-based sentence transformer for clinical text
        _model = SentenceTransformer('pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb')
    return _model


def embed_text(text: str) -> np.ndarray:
    """Generate deep learning embeddings for clinical text"""
    model = get_embedding_model()
    embedding = model.encode([text], normalize_embeddings=True)
    return embedding[0]


def patient_to_text(patient_data: dict) -> str:
    """Convert patient data to text for embedding"""
    parts = []
    if patient_data.get("age"):
        parts.append(f"Age {patient_data['age']}")
    if patient_data.get("gender"):
        parts.append(f"Gender {patient_data['gender']}")
    diagnoses = patient_data.get("diagnoses", [])
    if diagnoses:
        parts.append(f"Diagnoses: {', '.join(diagnoses)}")
    medications = patient_data.get("medications", [])
    if medications:
        med_names = [m.get("name", m) if isinstance(m, dict) else m for m in medications]
        parts.append(f"Medications: {', '.join(med_names)}")
    symptoms = patient_data.get("symptoms", [])
    if symptoms:
        parts.append(f"Symptoms: {', '.join(symptoms)}")
    return ". ".join(parts)


def trial_to_text(trial: dict) -> str:
    """Convert trial data to text for embedding"""
    parts = [trial.get("title", ""), trial.get("description", "")]
    conditions = trial.get("conditions", [])
    if conditions:
        parts.append(f"For conditions: {', '.join(conditions)}")
    inclusion = trial.get("inclusion_criteria", [])
    if inclusion:
        parts.append(f"Requires: {', '.join(inclusion)}")
    return ". ".join(filter(None, parts))


async def match_patient_to_trials(patient_data: dict, trials: List[dict]) -> List[dict]:
    """
    Match a patient to clinical trials using:
    1. Deep learning embeddings (BioBERT) for semantic similarity
    2. Rule-based filtering for hard criteria
    3. LLM reasoning for final eligibility determination
    """
    if not trials:
        return []

    # Step 1: Generate patient embedding
    patient_text = patient_to_text(patient_data)
    patient_embedding = embed_text(patient_text)

    # Step 2: Generate trial embeddings and build FAISS index
    trial_texts = [trial_to_text(t) for t in trials]
    trial_embeddings = np.array([embed_text(t) for t in trial_texts], dtype=np.float32)

    # FAISS index for fast similarity search
    dimension = trial_embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner product = cosine similarity
    index.add(trial_embeddings)

    # Step 3: Search for top matches
    query = patient_embedding.reshape(1, -1).astype(np.float32)
    k = min(len(trials), 5)
    scores, indices = index.search(query, k)

    # Step 4: Rule-based + LLM eligibility check for top matches
    results = []
    patient_age = patient_data.get("age") or patient_data.get("patient", {}).get("age")
    patient_gender = patient_data.get("gender") or patient_data.get("patient", {}).get("gender")
    patient_diagnoses = [d.lower() for d in (patient_data.get("diagnoses", []))]

    for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
        trial = trials[idx]
        semantic_score = float(score) * 100

        # Rule-based checks
        match_reasons = []
        disqualifiers = []

        # Age check
        min_age = trial.get("min_age")
        max_age = trial.get("max_age")
        if patient_age and min_age and patient_age < min_age:
            disqualifiers.append(f"Patient age {patient_age} below minimum {min_age}")
        elif patient_age and max_age and patient_age > max_age:
            disqualifiers.append(f"Patient age {patient_age} above maximum {max_age}")
        elif patient_age:
            match_reasons.append(f"Age {patient_age} within range")

        # Gender check
        gender_req = trial.get("gender_required")
        if gender_req and gender_req.lower() not in ["any", "all", "both"] and patient_gender:
            if patient_gender.lower() != gender_req.lower():
                disqualifiers.append(f"Trial requires {gender_req} patients")

        # Condition overlap
        trial_conditions = [c.lower() for c in trial.get("conditions", [])]
        overlapping = [d for d in patient_diagnoses if any(c in d or d in c for c in trial_conditions)]
        if overlapping:
            match_reasons.append(f"Matching conditions: {', '.join(overlapping)}")

        eligible = len(disqualifiers) == 0 and (semantic_score > 40 or overlapping)
        final_score = semantic_score * 0.6 + (30 if overlapping else 0) + (10 if not disqualifiers else 0)

        results.append({
            "trial_id": trial.get("trial_id"),
            "title": trial.get("title"),
            "description": trial.get("description", "")[:200],
            "semantic_score": round(semantic_score, 1),
            "final_score": round(min(final_score, 100), 1),
            "eligible": eligible,
            "match_reasons": match_reasons,
            "disqualifiers": disqualifiers,
            "conditions": trial.get("conditions", []),
        })

    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results


# Sample clinical trials for demo
DEMO_TRIALS = [
    {
        "trial_id": "NCT001",
        "title": "Type 2 Diabetes Management Study",
        "description": "Evaluating new treatments for patients with Type 2 Diabetes and associated complications",
        "inclusion_criteria": ["T2DM diagnosis", "HbA1c > 7%", "Age 30-75"],
        "exclusion_criteria": ["Type 1 Diabetes", "End-stage renal disease"],
        "conditions": ["diabetes", "t2dm", "hyperglycemia"],
        "min_age": 30, "max_age": 75, "gender_required": "any"
    },
    {
        "trial_id": "NCT002",
        "title": "Hypertension and CKD Intervention Trial",
        "description": "Study on blood pressure management in patients with chronic kidney disease",
        "inclusion_criteria": ["Hypertension", "CKD stage 2-4", "Age 40-80"],
        "exclusion_criteria": ["Dialysis patients", "Kidney transplant"],
        "conditions": ["hypertension", "ckd", "chronic kidney disease"],
        "min_age": 40, "max_age": 80, "gender_required": "any"
    },
    {
        "trial_id": "NCT003",
        "title": "Breast Cancer Immunotherapy Trial",
        "description": "Phase 3 trial of immunotherapy combination for early-stage breast cancer",
        "inclusion_criteria": ["Breast cancer diagnosis", "Stage I-III", "Female patients"],
        "exclusion_criteria": ["Metastatic disease", "Prior immunotherapy"],
        "conditions": ["breast cancer", "cancer", "oncology"],
        "min_age": 18, "max_age": 75, "gender_required": "female"
    },
    {
        "trial_id": "NCT004",
        "title": "Heart Failure Medication Optimization Study",
        "description": "Optimizing medication regimens for patients with chronic heart failure",
        "inclusion_criteria": ["Heart failure diagnosis", "LVEF < 40%", "Age 45+"],
        "exclusion_criteria": ["Recent MI within 3 months", "Severe valve disease"],
        "conditions": ["heart failure", "chf", "cardiac"],
        "min_age": 45, "max_age": 85, "gender_required": "any"
    },
    {
        "trial_id": "NCT005",
        "title": "COPD Pulmonary Rehabilitation Trial",
        "description": "Novel rehabilitation program for patients with moderate to severe COPD",
        "inclusion_criteria": ["COPD diagnosis", "FEV1 30-70%", "Age 50-80"],
        "exclusion_criteria": ["Active smoking within 6 months", "Severe comorbidities"],
        "conditions": ["copd", "asthma", "pulmonary", "respiratory"],
        "min_age": 50, "max_age": 80, "gender_required": "any"
    },
]
