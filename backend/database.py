from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cortex:cortex123@localhost:5432/cortex")
SYNC_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(SYNC_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"
    id = Column(Integer, primary_key=True, index=True)
    raw_text = Column(Text)
    patient_id = Column(String, nullable=True)
    extracted_data = Column(JSON)
    icd_codes = Column(JSON)
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    diagnoses = Column(JSON, default=[])
    medications = Column(JSON, default=[])
    conditions = Column(JSON, default=[])
    embedding = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"
    id = Column(Integer, primary_key=True, index=True)
    trial_id = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text)
    inclusion_criteria = Column(JSON, default=[])
    exclusion_criteria = Column(JSON, default=[])
    conditions = Column(JSON, default=[])
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    gender_required = Column(String, nullable=True)
    embedding = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TrialMatch(Base):
    __tablename__ = "trial_matches"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String)
    trial_id = Column(String)
    match_score = Column(Float)
    match_reasons = Column(JSON, default=[])
    eligible = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
