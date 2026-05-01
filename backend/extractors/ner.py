import anthropic
import os
import re
import json

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ICD-10 code mapping for common conditions
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
        diag_lower = diag.lower()
        for condition, code in ICD_MAP.items():
            if condition in diag_lower:
                codes.append({"diagnosis": diag, "icd_code": code})
                break
        else:
            codes.append({"diagnosis": diag, "icd_code": "Unknown"})
    return codes


async def extract_clinical_entities(note_text: str) -> dict:
    """
    Deep learning-powered clinical NER using Claude as the LLM backbone.
    Extracts structured entities from unstructured clinical notes.
    """
    try:
        prompt = f"""You are a clinical NLP system specialized in Named Entity Recognition (NER) for medical text.

Extract ALL clinical entities from this medical note and return ONLY valid JSON.

Clinical Note:
{note_text}

Extract and return this exact JSON structure:
{{
  "patient": {{
    "age": null,
    "gender": null,
    "patient_id": null
  }},
  "diagnoses": [],
  "medications": [
    {{"name": "", "dose": "", "frequency": "", "route": ""}}
  ],
  "vitals": {{
    "blood_pressure": null,
    "heart_rate": null,
    "temperature": null,
    "weight": null,
    "height": null,
    "bmi": null,
    "o2_saturation": null,
    "respiratory_rate": null
  }},
  "procedures": [],
  "lab_results": [
    {{"test": "", "value": "", "unit": "", "flag": ""}}
  ],
  "referrals": [],
  "allergies": [],
  "symptoms": [],
  "timeline": {{}},
  "clinical_summary": ""
}}

Rules:
- Extract exact values from the note, do not infer
- For medications include name, dose, frequency if mentioned
- For vitals extract exact numbers
- For timeline include relevant dates or timeframes mentioned
- clinical_summary should be 1-2 sentences
- Return ONLY the JSON, no explanation"""

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.content[0].text.strip()

        # Clean JSON
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        extracted = json.loads(text)

        # Add ICD codes
        diagnoses = extracted.get("diagnoses", [])
        extracted["icd_codes"] = extract_icd_codes(diagnoses)

        # Confidence score based on completeness
        score = 0
        if extracted.get("patient", {}).get("age"): score += 15
        if extracted.get("diagnoses"): score += 25
        if extracted.get("medications"): score += 20
        if extracted.get("vitals"): score += 15
        if extracted.get("symptoms"): score += 10
        if extracted.get("procedures"): score += 10
        if extracted.get("lab_results"): score += 5
        extracted["confidence_score"] = min(score, 95)

        return extracted

    except json.JSONDecodeError:
        return _fallback_extraction(note_text)
    except Exception as e:
        return _fallback_extraction(note_text)


def _fallback_extraction(text: str) -> dict:
    """Regex-based fallback NER when LLM fails"""
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
