"""Comprehensive Storage Models for NIS Protocol.

This module defines all database models for archaeological data storage,
analysis persistence, discovery tracking, and learning accumulation.
"""

from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime, timezone
from uuid import uuid4
import json

from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field

Base = declarative_base()

# Enums for data classification
class AnalysisType(str, Enum):
    SATELLITE = "satellite"
    LIDAR = "lidar"
    COMPREHENSIVE = "comprehensive"
    VISION = "vision"
    CULTURAL = "cultural"
    TEMPORAL = "temporal"

class SiteType(str, Enum):
    SETTLEMENT = "settlement"
    CEREMONIAL = "ceremonial"
    AGRICULTURAL = "agricultural"
    BURIAL = "burial"
    DEFENSIVE = "defensive"
    TRADE = "trade"
    UNKNOWN = "unknown"

class ConfidenceLevel(str, Enum):
    HIGH = "high"        # > 0.8
    MEDIUM = "medium"    # 0.5 - 0.8
    LOW = "low"         # < 0.5

class StorageStatus(str, Enum):
    PENDING = "pending"
    STORED = "stored"
    VERIFIED = "verified"
    ARCHIVED = "archived"

# === CORE ARCHAEOLOGICAL MODELS ===

class ArchaeologicalSite(Base):
    """Comprehensive archaeological site model."""
    __tablename__ = 'archaeological_sites'
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    
    # Location data
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    elevation = Column(Float, nullable=True)
    
    # Site metadata
    name = Column(String, nullable=True)
    site_type = Column(String, default=SiteType.UNKNOWN.value)
    cultural_significance = Column(Text, nullable=True)
    historical_period = Column(String, nullable=True)
    
    # Confidence and validation
    confidence_score = Column(Float, default=0.0)
    confidence_level = Column(String, default=ConfidenceLevel.LOW.value)
    validation_status = Column(String, default=StorageStatus.PENDING.value)
    
    # Discovery metadata
    discovery_date = Column(DateTime, default=datetime.utcnow)
    discovery_method = Column(String, nullable=True)
    researcher_id = Column(String, nullable=True)
    
    # Analysis data
    data_sources = Column(JSON, default=list)  # ["satellite", "lidar", "historical"]
    analysis_results = Column(JSON, default=dict)
    metadata = Column(JSON, default=dict)
    
    # Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    analyses = relationship("AnalysisSession", back_populates="site")
    discoveries = relationship("Discovery", back_populates="site")

class AnalysisSession(Base):
    """Analysis session tracking for comprehensive analysis storage."""
    __tablename__ = 'analysis_sessions'
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    
    # Session metadata
    session_name = Column(String, nullable=True)
    analysis_type = Column(String, default=AnalysisType.COMPREHENSIVE.value)
    
    # Location data
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    coordinates_string = Column(String, nullable=False)
    
    # Analysis results
    results = Column(JSON, default=dict)
    confidence_score = Column(Float, default=0.0)
    agents_used = Column(JSON, default=list)
    data_sources = Column(JSON, default=list)
    
    # Processing metadata
    processing_time = Column(String, nullable=True)
    backend_status = Column(String, default="pending")
    
    # Storage tracking
    storage_systems = Column(JSON, default=list)  # ["database", "redis", "kafka"]
    storage_status = Column(String, default=StorageStatus.PENDING.value)
    
    # Relationships
    site_id = Column(Integer, ForeignKey('archaeological_sites.id'), nullable=True)
    site = relationship("ArchaeologicalSite", back_populates="analyses")
    
    # Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Discovery(Base):
    """Discovery tracking for validated archaeological finds."""
    __tablename__ = 'discoveries'
    
    id = Column(Integer, primary_key=True, index=True)
    discovery_id = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    
    # Discovery metadata
    submission_id = Column(String, nullable=True)
    researcher_id = Column(String, nullable=False)
    discovery_name = Column(String, nullable=True)
    
    # Location and validation
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.0)
    validation_status = Column(String, default="pending")
    
    # Discovery data
    description = Column(Text, nullable=True)
    cultural_significance = Column(Text, nullable=True)
    data_sources = Column(JSON, default=list)
    discovery_metadata = Column(JSON, default=dict)
    
    # Validation results
    validated_sites = Column(JSON, default=list)
    overall_confidence = Column(Float, default=0.0)
    
    # Relationships
    site_id = Column(Integer, ForeignKey('archaeological_sites.id'), nullable=True)
    site = relationship("ArchaeologicalSite", back_populates="discoveries")
    
    # Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LearningPattern(Base):
    """Learning pattern storage for ML improvement."""
    __tablename__ = 'learning_patterns'
    
    id = Column(Integer, primary_key=True, index=True)
    pattern_id = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    
    # Pattern metadata
    pattern_type = Column(String, nullable=False)
    pattern_category = Column(String, nullable=True)
    confidence_threshold = Column(Float, default=0.0)
    
    # Pattern data
    pattern_data = Column(JSON, default=dict)
    training_examples = Column(JSON, default=list)
    validation_results = Column(JSON, default=dict)
    
    # Performance tracking
    accuracy_score = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    # Geographic relevance
    region = Column(String, nullable=True)
    cultural_context = Column(String, nullable=True)
    
    # Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemMetrics(Base):
    """System performance and usage metrics."""
    __tablename__ = 'system_metrics'
    
    id = Column(Integer, primary_key=True, index=True)
    metric_id = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    
    # Metric metadata
    metric_type = Column(String, nullable=False)
    metric_category = Column(String, nullable=True)
    
    # Metric data
    metric_value = Column(Float, default=0.0)
    metric_data = Column(JSON, default=dict)
    
    # Context
    session_id = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    
    # Tracking
    recorded_at = Column(DateTime, default=datetime.utcnow)

# === PYDANTIC MODELS FOR API ===

class SiteCreate(BaseModel):
    """Site creation model."""
    latitude: float
    longitude: float
    name: Optional[str] = None
    site_type: SiteType = SiteType.UNKNOWN
    cultural_significance: Optional[str] = None
    confidence_score: float = 0.0
    data_sources: List[str] = []
    metadata: Dict[str, Any] = {}

class SiteResponse(BaseModel):
    """Site response model."""
    site_id: str
    latitude: float
    longitude: float
    name: Optional[str]
    site_type: str
    confidence_score: float
    validation_status: str
    discovery_date: datetime
    analysis_count: int = 0
    
    class Config:
        from_attributes = True

class AnalysisCreate(BaseModel):
    """Analysis creation model."""
    coordinates: str
    analysis_type: AnalysisType = AnalysisType.COMPREHENSIVE
    agents_used: List[str] = []
    data_sources: List[str] = []
    results: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}

class AnalysisResponse(BaseModel):
    """Analysis response model."""
    analysis_id: str
    coordinates: str
    analysis_type: str
    confidence_score: float
    storage_status: str
    processing_time: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class DiscoveryCreate(BaseModel):
    """Discovery creation model."""
    researcher_id: str
    sites: List[Dict[str, Any]]
    metadata: Dict[str, Any] = {}

class DiscoveryResponse(BaseModel):
    """Discovery response model."""
    discovery_id: str
    submission_id: str
    researcher_id: str
    total_sites: int
    validated_sites: int
    overall_confidence: float
    
    class Config:
        from_attributes = True

class LearningPatternCreate(BaseModel):
    """Learning pattern creation model."""
    pattern_type: str
    pattern_data: Dict[str, Any]
    training_examples: List[Dict[str, Any]] = []
    confidence_threshold: float = 0.0

class LearningPatternResponse(BaseModel):
    """Learning pattern response model."""
    pattern_id: str
    pattern_type: str
    accuracy_score: float
    usage_count: int
    success_rate: float
    
    class Config:
        from_attributes = True

# === UTILITY FUNCTIONS ===

def create_site_from_analysis(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create site data from analysis results."""
    return {
        "latitude": analysis_data.get("lat", 0.0),
        "longitude": analysis_data.get("lon", 0.0),
        "confidence_score": analysis_data.get("confidence", 0.0),
        "site_type": analysis_data.get("pattern_type", SiteType.UNKNOWN.value),
        "cultural_significance": analysis_data.get("cultural_significance", ""),
        "data_sources": analysis_data.get("data_sources", []),
        "metadata": analysis_data.get("metadata", {})
    }

def calculate_confidence_level(score: float) -> ConfidenceLevel:
    """Calculate confidence level from score."""
    if score >= 0.8:
        return ConfidenceLevel.HIGH
    elif score >= 0.5:
        return ConfidenceLevel.MEDIUM
    else:
        return ConfidenceLevel.LOW

def generate_site_name(lat: float, lon: float, site_type: str) -> str:
    """Generate a descriptive site name."""
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{site_type.title()} Site {abs(lat):.3f}{lat_dir} {abs(lon):.3f}{lon_dir}" 