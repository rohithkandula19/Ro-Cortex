import anthropic
import os
import json

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Comprehensive ICD-10 reference
ICD10_REFERENCE = {
    "E11.9": "Type 2 diabetes mellitus without complications",
    "E11.65": "Type 2 diabetes mellitus with hyperglycemia",
    "I10": "Essential (primary) hypertension",
    "N18.3": "Chronic kidney disease, stage 3",
    "N18.4": "Chronic kidney disease, stage 4",
    "C50.9": "Malignant neoplasm of breast, unspecified",
    "I50.9": "Heart failure, unspecified",
    "I48.91": "Unspecified atrial fibrillation",
    "J44.9": "Chronic obstructive pulmonary disease, unspecified",
    "J45.909": "Unspecified asthma, uncomplicated",
    "F32.9": "Major depressive disorder, single episode, unspecified",
    "F41.9": "Anxiety disorder, unspecified",
    "E03.9": "Hypothyroidism, unspecified",
    "E78.5": "Hyperlipidemia, unspecified",
    "E66.9": "Obesity, unspecified",
    "I21.9": "Acute myocardial infarction, unspecified",
    "I63.9": "Cerebral infarction, unspecified",
    "D64.9": "Anemia, unspecified",
    "A41.9": "Sepsis, unspecified organism",
    "U07.1": "COVID-19",
    "M79.3": "Panniculitis, unspecified",
    "K21.0": "Gastro-esophageal reflux disease with esophagitis",
    "G43.909": "Migraine, unspecified, not intractable",
    "M54.5": "Low back pain",
    "R05.9": "Cough, unspecified",
    "J18.9": "Pneumonia, unspecified organism",
}


async def classify_icd_codes(clinical_text: str, diagnoses: list) -> list:
    """
    Deep learning-powered ICD-10 code classification.
    Uses LLM for multi-label classification of clinical diagnoses.
    """
    if not diagnoses and not clinical_text:
        return []

    try:
        prompt = f"""You are a medical coding specialist. Assign ICD-10-CM codes to these diagnoses.

Clinical Note Context: {clinical_text[:500]}

Diagnoses to code: {json.dumps(diagnoses)}

Available ICD-10 codes:
{json.dumps(ICD10_REFERENCE, indent=2)}

Return ONLY a JSON array:
[
  {{
    "diagnosis": "original diagnosis text",
    "icd_code": "ICD-10 code",
    "description": "official ICD-10 description",
    "confidence": 0.95
  }}
]

Rules:
- Use exact ICD-10 codes from the reference above
- If no match found use "Z99.89" with description "Other dependence on enabling machines and devices"
- Confidence 0.9+ for exact match, 0.7-0.89 for close match, below 0.7 for uncertain
- Return ONLY the JSON array"""

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.content[0].text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        codes = json.loads(text)
        return codes

    except Exception as e:
        # Fallback: simple string matching
        results = []
        for diag in diagnoses:
            diag_lower = diag.lower()
            matched = False
            for code, desc in ICD10_REFERENCE.items():
                if any(word in desc.lower() for word in diag_lower.split() if len(word) > 3):
                    results.append({
                        "diagnosis": diag,
                        "icd_code": code,
                        "description": desc,
                        "confidence": 0.65
                    })
                    matched = True
                    break
            if not matched:
                results.append({
                    "diagnosis": diag,
                    "icd_code": "Z99.89",
                    "description": "Other specified condition",
                    "confidence": 0.3
                })
        return results
