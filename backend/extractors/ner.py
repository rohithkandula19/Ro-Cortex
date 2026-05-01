import anthropic
import os
import re
import json
import logging

logger = logging.getLogger("cortex.ner")
logging.basicConfig(level=logging.INFO)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

ICD_MAP = {
    # Endocrine
    "diabetes": "E11.9", "t2dm": "E11.9", "type 2 diabetes": "E11.9",
    "type 1 diabetes": "E10.9", "t1dm": "E10.9",
    "diabetic ketoacidosis": "E11.10", "dka": "E11.10",
    "hypothyroidism": "E03.9", "hyperthyroidism": "E05.9",
    "hyperlipidemia": "E78.5", "obesity": "E66.9", "morbid obesity": "E66.01",
    "metabolic syndrome": "E88.81",
    # Cardiovascular
    "hypertension": "I10", "htn": "I10", "high blood pressure": "I10",
    "heart failure": "I50.9", "chf": "I50.9", "congestive heart failure": "I50.9",
    "atrial fibrillation": "I48.91", "afib": "I48.91", "a-fib": "I48.91",
    "myocardial infarction": "I21.9", "mi": "I21.9", "stemi": "I21.3", "nstemi": "I21.4",
    "stroke": "I63.9", "cva": "I63.9", "cerebral infarction": "I63.9",
    "tia": "G45.9", "transient ischemic attack": "G45.9",
    "angina": "I20.9", "coronary artery disease": "I25.10", "cad": "I25.10",
    "deep vein thrombosis": "I82.40", "dvt": "I82.40",
    "pulmonary embolism": "I26.99", "pe": "I26.99",
    # Renal
    "ckd": "N18.3", "chronic kidney disease": "N18.3",
    "esrd": "N18.6", "end stage renal disease": "N18.6",
    "acute kidney injury": "N17.9", "aki": "N17.9",
    "uti": "N39.0", "urinary tract infection": "N39.0",
    # Respiratory
    "asthma": "J45.909", "copd": "J44.9",
    "pneumonia": "J18.9", "bronchitis": "J40", "bronchiolitis": "J21.9",
    "pulmonary edema": "J81.0", "respiratory failure": "J96.90",
    # Oncology
    "breast cancer": "C50.9", "lung cancer": "C34.90",
    "colon cancer": "C18.9", "prostate cancer": "C61",
    "leukemia": "C95.90", "lymphoma": "C85.90",
    "cancer": "C80.1", "metastatic": "C79.9",
    # Mental health
    "depression": "F32.9", "major depressive disorder": "F32.9", "mdd": "F32.9",
    "anxiety": "F41.9", "generalized anxiety": "F41.1", "gad": "F41.1",
    "ptsd": "F43.10", "bipolar": "F31.9",
    "schizophrenia": "F20.9", "adhd": "F90.9",
    "substance use disorder": "F19.20",
    # GI
    "gerd": "K21.9", "reflux": "K21.9",
    "ibs": "K58.9", "crohn": "K50.90", "ulcerative colitis": "K51.90",
    "cirrhosis": "K74.60", "hepatitis": "B19.9",
    # Musculoskeletal
    "osteoporosis": "M81.0", "osteoarthritis": "M19.90", "rheumatoid arthritis": "M06.9",
    "low back pain": "M54.5", "fibromyalgia": "M79.7",
    # Neuro
    "alzheimer": "G30.9", "dementia": "F03.90",
    "parkinson": "G20", "epilepsy": "G40.909", "seizure": "R56.9",
    "migraine": "G43.909",
    # Infectious / other
    "sepsis": "A41.9", "septic shock": "R65.21",
    "covid": "U07.1", "influenza": "J11.1",
    "anemia": "D64.9", "iron deficiency anemia": "D50.9",
}


ICD_DESCRIPTIONS = {
    # Endocrine
    "E11.9": "Type 2 diabetes mellitus, uncomplicated",
    "E10.9": "Type 1 diabetes mellitus, uncomplicated",
    "E11.10": "Type 2 diabetes with ketoacidosis",
    "E03.9": "Hypothyroidism, unspecified",
    "E05.9": "Thyrotoxicosis, unspecified",
    "E78.5": "Hyperlipidemia, unspecified",
    "E66.9": "Obesity, unspecified",
    "E66.01": "Morbid obesity due to excess calories",
    "E88.81": "Metabolic syndrome",
    # Cardiovascular
    "I10": "Essential hypertension",
    "I50.9": "Heart failure, unspecified",
    "I48.91": "Atrial fibrillation, unspecified",
    "I21.9": "Acute myocardial infarction, unspecified",
    "I21.3": "ST elevation myocardial infarction",
    "I21.4": "Non-ST elevation myocardial infarction",
    "I63.9": "Cerebral infarction, unspecified",
    "G45.9": "Transient cerebral ischemic attack",
    "I20.9": "Angina pectoris, unspecified",
    "I25.10": "Atherosclerotic heart disease",
    "I82.40": "Deep vein thrombosis",
    "I26.99": "Pulmonary embolism without acute cor pulmonale",
    # Renal
    "N18.3": "Chronic kidney disease, stage 3",
    "N18.6": "End stage renal disease",
    "N17.9": "Acute kidney failure, unspecified",
    "N39.0": "Urinary tract infection, site not specified",
    # Respiratory
    "J45.909": "Asthma, unspecified, uncomplicated",
    "J44.9": "Chronic obstructive pulmonary disease, unspecified",
    "J18.9": "Pneumonia, unspecified organism",
    "J40": "Bronchitis, not specified as acute or chronic",
    "J21.9": "Acute bronchiolitis, unspecified",
    "J81.0": "Acute pulmonary edema",
    "J96.90": "Respiratory failure, unspecified",
    # Oncology
    "C50.9": "Malignant neoplasm of breast, unspecified",
    "C34.90": "Malignant neoplasm of bronchus or lung",
    "C18.9": "Malignant neoplasm of colon, unspecified",
    "C61": "Malignant neoplasm of prostate",
    "C95.90": "Leukemia, unspecified",
    "C85.90": "Non-Hodgkin lymphoma, unspecified",
    "C80.1": "Malignant neoplasm, unspecified",
    "C79.9": "Secondary malignant neoplasm, unspecified site",
    # Mental health
    "F32.9": "Major depressive disorder, single episode",
    "F41.9": "Anxiety disorder, unspecified",
    "F41.1": "Generalized anxiety disorder",
    "F43.10": "Post-traumatic stress disorder, unspecified",
    "F31.9": "Bipolar disorder, unspecified",
    "F20.9": "Schizophrenia, unspecified",
    "F90.9": "Attention-deficit hyperactivity disorder",
    "F19.20": "Other psychoactive substance dependence",
    # GI
    "K21.9": "Gastro-esophageal reflux disease",
    "K58.9": "Irritable bowel syndrome without diarrhea",
    "K50.90": "Crohn's disease, unspecified",
    "K51.90": "Ulcerative colitis, unspecified",
    "K74.60": "Cirrhosis of liver, unspecified",
    "B19.9": "Unspecified viral hepatitis",
    # Musculoskeletal
    "M81.0": "Age-related osteoporosis without fracture",
    "M19.90": "Osteoarthritis, unspecified site",
    "M06.9": "Rheumatoid arthritis, unspecified",
    "M54.5": "Low back pain",
    "M79.7": "Fibromyalgia",
    # Neuro
    "G30.9": "Alzheimer's disease, unspecified",
    "F03.90": "Unspecified dementia without behavioral disturbance",
    "G20": "Parkinson's disease",
    "G40.909": "Epilepsy, unspecified, not intractable",
    "R56.9": "Unspecified convulsions",
    "G43.909": "Migraine, unspecified, not intractable",
    # Infectious / other
    "A41.9": "Sepsis, unspecified organism",
    "R65.21": "Severe sepsis with septic shock",
    "U07.1": "COVID-19",
    "J11.1": "Influenza with other respiratory manifestations",
    "D64.9": "Anemia, unspecified",
    "D50.9": "Iron deficiency anemia, unspecified",
    "Unknown": "No matching ICD-10 code in reference",
}


def extract_icd_codes(diagnoses: list) -> list:
    codes = []
    for diag in diagnoses:
        diag_lower = (diag or "").lower()
        matched = False
        for condition, code in ICD_MAP.items():
            if condition in diag_lower:
                codes.append({
                    "diagnosis": diag,
                    "icd_code": code,
                    "description": ICD_DESCRIPTIONS.get(code, ""),
                    "confidence": 0.92,
                })
                matched = True
                break
        if not matched:
            codes.append({
                "diagnosis": diag,
                "icd_code": "Unknown",
                "description": ICD_DESCRIPTIONS["Unknown"],
                "confidence": 0.4,
            })
    return codes


SYSTEM_PROMPT = """You are a clinical NLP system that extracts entities from medical notes.

Return ONLY a single JSON object with this exact shape, no prose, no markdown:
{
  "patient": {"age": null, "gender": null, "patient_id": null},
  "diagnoses": [],
  "medications": [{"name": "", "dose": "", "frequency": "", "route": ""}],
  "vitals": {
    "blood_pressure": null, "heart_rate": null, "temperature": null,
    "weight": null, "height": null, "bmi": null,
    "o2_saturation": null, "respiratory_rate": null
  },
  "procedures": [],
  "lab_results": [{"test": "", "value": "", "unit": "", "flag": ""}],
  "referrals": [],
  "allergies": [],
  "symptoms": [],
  "timeline": {},
  "clinical_summary": ""
}

Rules:
- Pull values verbatim from the note. Do not invent.
- Empty arrays are fine when nothing is mentioned, but extract everything you can find.
- Diagnoses include both spelled out names ("Type 2 diabetes") and abbreviations ("T2DM", "CHF") as written.
- Medications list every drug with dose and frequency when present.
- Vitals must be exact values from the note.
- clinical_summary is one sentence in plain language.
- Output the JSON object only."""


def _strip_to_json(text: str) -> str:
    text = text.strip()
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0].strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]
    return text


async def extract_clinical_entities(note_text: str) -> dict:
    try:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1500,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": f"Clinical note:\n\n{note_text}"}]
        )

        raw = response.content[0].text
        cleaned = _strip_to_json(raw)

        try:
            extracted = json.loads(cleaned)
        except json.JSONDecodeError as je:
            logger.error("NER JSON parse failed: %s\nRaw response head: %s", je, raw[:400])
            return _fallback_extraction(note_text)

        diagnoses = extracted.get("diagnoses") or []
        extracted["icd_codes"] = extract_icd_codes(diagnoses)

        score = 0
        if extracted.get("patient", {}).get("age"): score += 15
        if diagnoses: score += 25
        if extracted.get("medications"): score += 20
        if any((extracted.get("vitals") or {}).values()): score += 15
        if extracted.get("symptoms"): score += 10
        if extracted.get("procedures"): score += 10
        if extracted.get("lab_results"): score += 5
        extracted["confidence_score"] = min(score, 95)

        return extracted

    except anthropic.APIError as ae:
        logger.error("Anthropic API error in NER: %s", ae)
        return _fallback_extraction(note_text)
    except Exception as e:
        logger.exception("Unexpected NER failure: %s", e)
        return _fallback_extraction(note_text)


def _fallback_extraction(text: str) -> dict:
    age_match = re.search(r'(\d+)\s*(?:yo|year[s]?\s*old|y\.o\.)', text, re.IGNORECASE)
    bp_match = re.search(r'(?:BP|blood pressure)[:\s]*(\d+/\d+)', text, re.IGNORECASE)
    hr_match = re.search(r'(?:HR|heart rate)[:\s]*(\d+)', text, re.IGNORECASE)

    return {
        "patient": {
            "age": int(age_match.group(1)) if age_match else None,
            "gender": "male" if re.search(r'\b(male|man|he|him|his)\b', text, re.IGNORECASE) else
                      "female" if re.search(r'\b(female|woman|she|her)\b', text, re.IGNORECASE) else None,
            "patient_id": None
        },
        "diagnoses": [],
        "medications": [],
        "vitals": {
            "blood_pressure": bp_match.group(1) if bp_match else None,
            "heart_rate": hr_match.group(1) if hr_match else None,
        },
        "procedures": [],
        "lab_results": [],
        "referrals": [],
        "allergies": [],
        "symptoms": [],
        "timeline": {},
        "icd_codes": [],
        "clinical_summary": "Extraction completed with fallback method.",
        "confidence_score": 30
    }
