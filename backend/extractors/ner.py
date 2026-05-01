import anthropic
import os
import re
import json
import logging

logger = logging.getLogger("cortex.ner")
logging.basicConfig(level=logging.INFO)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

ICD_MAP = {
    "diabetes": "E11.9", "t2dm": "E11.9", "type 2 diabetes": "E11.9",
    "hypertension": "I10", "htn": "I10", "high blood pressure": "I10",
    "ckd": "N18.3", "chronic kidney disease": "N18.3",
    "breast cancer": "C50.9", "cancer": "C80.1",
    "asthma": "J45.909", "copd": "J44.9",
    "heart failure": "I50.9", "chf": "I50.9",
    "atrial fibrillation": "I48.91", "afib": "I48.91",
    "pneumonia": "J18.9", "depression": "F32.9",
    "anxiety": "F41.9", "hypothyroidism": "E03.9",
    "hyperlipidemia": "E78.5", "obesity": "E66.9",
    "anemia": "D64.9", "stroke": "I63.9",
    "myocardial infarction": "I21.9", "mi": "I21.9",
    "sepsis": "A41.9", "covid": "U07.1",
}


def extract_icd_codes(diagnoses: list) -> list:
    codes = []
    for diag in diagnoses:
        diag_lower = (diag or "").lower()
        matched = False
        for condition, code in ICD_MAP.items():
            if condition in diag_lower:
                codes.append({"diagnosis": diag, "icd_code": code})
                matched = True
                break
        if not matched:
            codes.append({"diagnosis": diag, "icd_code": "Unknown"})
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
