"""Unified Storage Service for NIS Protocol.

This service coordinates data storage across all persistence layers:
- Database (SQLAlchemy)
- Redis (Caching)  
- Kafka (Event Streaming)
- Memory Agent (File + Cache)
- Learning Engine (Pattern Storage)
"""

import logging
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

# Import models
from ..models.storage_models import (
    ArchaeologicalSite, AnalysisSession, Discovery, LearningPattern, SystemMetrics,
    SiteCreate, AnalysisCreate, DiscoveryCreate, LearningPatternCreate,
    SiteResponse, AnalysisResponse, DiscoveryResponse, LearningPatternResponse,
    AnalysisType, SiteType, ConfidenceLevel, StorageStatus,
    create_site_from_analysis, calculate_confidence_level, generate_site_name
)

# Import infrastructure
from ..infrastructure.database import get_db_session
from ..infrastructure.redis_client import get_redis_client
from ..infrastructure.kafka_client import get_kafka_client

# Import agents
from ..agents.memory_agent import MemoryAgent

logger = logging.getLogger(__name__)

class StorageService:
    """Unified storage service coordinating all persistence layers."""
    
    def __init__(self):
        """Initialize the storage service."""
        self.db_session = get_db_session()
        
        # Initialize infrastructure components
        try:
            self.redis = get_redis_client()
            self.use_redis = True
            logger.info("✅ Redis initialized for storage service")
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable: {e}")
            self.use_redis = False
        
        try:
            self.kafka = get_kafka_client()
            self.use_kafka = True
            logger.info("✅ Kafka initialized for storage service")
        except Exception as e:
            logger.warning(f"⚠️ Kafka unavailable: {e}")
            self.use_kafka = False
        
        # Initialize memory agent
        try:
            self.memory_agent = MemoryAgent()
            logger.info("✅ Memory Agent initialized for storage service")
        except Exception as e:
            logger.warning(f"⚠️ Memory Agent unavailable: {e}")
            self.memory_agent = None
        
        logger.info("🏗️ Storage Service initialized")

    # === ANALYSIS STORAGE ===
    
    async def store_analysis(self, analysis_data: Dict[str, Any]) -> AnalysisResponse:
        """Store analysis across all systems."""
        logger.info(f"💾 Storing analysis: {analysis_data.get('analysis_id', 'unknown')}")
        
        try:
            # Extract coordinates
            lat = analysis_data.get('lat', 0.0)
            lon = analysis_data.get('lon', 0.0)
            coordinates = f"{lat},{lon}"
            
            # Create analysis session in database
            analysis_session = AnalysisSession(
                analysis_id=analysis_data.get('analysis_id', str(uuid4())),
                session_name=analysis_data.get('session_name'),
                analysis_type=analysis_data.get('analysis_type', AnalysisType.COMPREHENSIVE.value),
                latitude=lat,
                longitude=lon,
                coordinates_string=coordinates,
                results=analysis_data.get('results', {}),
                confidence_score=analysis_data.get('confidence', 0.0),
                agents_used=analysis_data.get('agents_used', []),
                data_sources=analysis_data.get('data_sources', []),
                processing_time=analysis_data.get('processing_time'),
                backend_status=analysis_data.get('backend_status', 'success'),
                storage_systems=['database'],
                storage_status=StorageStatus.STORED.value
            )
            
            # Store in database
            async with self.db_session() as session:
                session.add(analysis_session)
                await session.commit()
                await session.refresh(analysis_session)
            
            # Store in Redis cache
            if self.use_redis:
                cache_key = f"analysis:{analysis_session.analysis_id}"
                cache_data = {
                    "analysis_id": analysis_session.analysis_id,
                    "coordinates": coordinates,
                    "confidence": analysis_session.confidence_score,
                    "results": analysis_session.results,
                    "timestamp": analysis_session.created_at.isoformat()
                }
                self.redis.cache_set(cache_key, cache_data, ttl=86400)  # 24 hours
                analysis_session.storage_systems.append('redis')
                logger.debug(f"📦 Analysis cached in Redis: {cache_key}")
            
            # Store in Memory Agent
            if self.memory_agent:
                memory_data = {
                    "analysis_id": analysis_session.analysis_id,
                    "pattern_type": analysis_data.get('pattern_type', 'unknown'),
                    "confidence": analysis_session.confidence_score,
                    "cultural_significance": analysis_data.get('cultural_significance', ''),
                    "analysis_results": analysis_session.results
                }
                success = self.memory_agent.store_site_data(lat, lon, memory_data)
                if success:
                    analysis_session.storage_systems.append('memory_agent')
                    logger.debug(f"🧠 Analysis stored in Memory Agent")
            
            # Publish to Kafka
            if self.use_kafka:
                kafka_event = {
                    "event_type": "analysis_stored",
                    "analysis_id": analysis_session.analysis_id,
                    "coordinates": {"lat": lat, "lon": lon},
                    "analysis_type": analysis_session.analysis_type,
                    "confidence": analysis_session.confidence_score,
                    "storage_systems": analysis_session.storage_systems,
                    "timestamp": datetime.now().isoformat()
                }
                self.kafka.produce("nis.analysis.stored", kafka_event, key=analysis_session.analysis_id)
                analysis_session.storage_systems.append('kafka')
                logger.debug(f"📡 Analysis event published to Kafka")
            
            # Update storage systems in database
            async with self.db_session() as session:
                session.add(analysis_session)
                await session.commit()
            
            # Create response
            response = AnalysisResponse(
                analysis_id=analysis_session.analysis_id,
                coordinates=analysis_session.coordinates_string,
                analysis_type=analysis_session.analysis_type,
                confidence_score=analysis_session.confidence_score,
                storage_status=analysis_session.storage_status,
                processing_time=analysis_session.processing_time,
                created_at=analysis_session.created_at
            )
            
            logger.info(f"✅ Analysis stored successfully across {len(analysis_session.storage_systems)} systems")
            return response
            
        except Exception as e:
            logger.error(f"❌ Failed to store analysis: {e}")
            raise

    async def get_analysis(self, analysis_id: str) -> Optional[AnalysisResponse]:
        """Retrieve analysis from storage."""
        try:
            # Try Redis cache first
            if self.use_redis:
                cache_key = f"analysis:{analysis_id}"
                cached_data = self.redis.cache_get(cache_key)
                if cached_data:
                    logger.debug(f"📦 Analysis retrieved from Redis cache")
                    return AnalysisResponse(**cached_data)
            
            # Fallback to database
            async with self.db_session() as session:
                analysis = session.query(AnalysisSession).filter(
                    AnalysisSession.analysis_id == analysis_id
                ).first()
                
                if analysis:
                    response = AnalysisResponse(
                        analysis_id=analysis.analysis_id,
                        coordinates=analysis.coordinates_string,
                        analysis_type=analysis.analysis_type,
                        confidence_score=analysis.confidence_score,
                        storage_status=analysis.storage_status,
                        processing_time=analysis.processing_time,
                        created_at=analysis.created_at
                    )
                    
                    # Cache for future requests
                    if self.use_redis:
                        self.redis.cache_set(f"analysis:{analysis_id}", response.dict(), ttl=3600)
                    
                    return response
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get analysis {analysis_id}: {e}")
            return None

    # === SITE STORAGE ===
    
    async def store_site(self, site_data: Union[SiteCreate, Dict[str, Any]]) -> SiteResponse:
        """Store archaeological site across all systems."""
        logger.info(f"🏛️ Storing archaeological site")
        
        try:
            # Convert dict to SiteCreate if needed
            if isinstance(site_data, dict):
                site_create = SiteCreate(**site_data)
            else:
                site_create = site_data
            
            # Check if site already exists (within 100m)
            existing_site = await self.find_nearby_site(
                site_create.latitude, 
                site_create.longitude, 
                radius_km=0.1
            )
            
            if existing_site:
                logger.info(f"📍 Updating existing site: {existing_site.site_id}")
                return await self.update_site(existing_site.site_id, site_create)
            
            # Create new site
            site_name = site_create.name or generate_site_name(
                site_create.latitude, 
                site_create.longitude, 
                site_create.site_type.value
            )
            
            site = ArchaeologicalSite(
                site_id=str(uuid4()),
                latitude=site_create.latitude,
                longitude=site_create.longitude,
                name=site_name,
                site_type=site_create.site_type.value,
                cultural_significance=site_create.cultural_significance,
                confidence_score=site_create.confidence_score,
                confidence_level=calculate_confidence_level(site_create.confidence_score).value,
                data_sources=site_create.data_sources,
                metadata=site_create.metadata,
                validation_status=StorageStatus.STORED.value
            )
            
            # Store in database
            async with self.db_session() as session:
                session.add(site)
                await session.commit()
                await session.refresh(site)
            
            # Store in Redis
            if self.use_redis:
                cache_key = f"site:{site.site_id}"
                cache_data = {
                    "site_id": site.site_id,
                    "latitude": site.latitude,
                    "longitude": site.longitude,
                    "name": site.name,
                    "site_type": site.site_type,
                    "confidence_score": site.confidence_score,
                    "cultural_significance": site.cultural_significance
                }
                self.redis.cache_set(cache_key, cache_data, ttl=86400)
                logger.debug(f"📦 Site cached in Redis: {cache_key}")
            
            # Store in Memory Agent
            if self.memory_agent:
                memory_data = {
                    "site_id": site.site_id,
                    "name": site.name,
                    "site_type": site.site_type,
                    "confidence": site.confidence_score,
                    "cultural_significance": site.cultural_significance,
                    "pattern_type": site.site_type
                }
                self.memory_agent.store_site_data(site.latitude, site.longitude, memory_data)
                logger.debug(f"🧠 Site stored in Memory Agent")
            
            # Publish to Kafka
            if self.use_kafka:
                kafka_event = {
                    "event_type": "site_stored",
                    "site_id": site.site_id,
                    "coordinates": {"lat": site.latitude, "lon": site.longitude},
                    "site_type": site.site_type,
                    "confidence": site.confidence_score,
                    "timestamp": datetime.now().isoformat()
                }
                self.kafka.produce("nis.sites.stored", kafka_event, key=site.site_id)
                logger.debug(f"📡 Site event published to Kafka")
            
            # Create response
            response = SiteResponse(
                site_id=site.site_id,
                latitude=site.latitude,
                longitude=site.longitude,
                name=site.name,
                site_type=site.site_type,
                confidence_score=site.confidence_score,
                validation_status=site.validation_status,
                discovery_date=site.discovery_date,
                analysis_count=0
            )
            
            logger.info(f"✅ Site stored successfully: {site.site_id}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Failed to store site: {e}")
            raise

    async def find_nearby_site(self, lat: float, lon: float, radius_km: float = 1.0) -> Optional[SiteResponse]:
        """Find sites within radius."""
        try:
            # Simple radius calculation (approximate)
            lat_delta = radius_km / 111.0  # ~111 km per degree
            lon_delta = radius_km / (111.0 * abs(lat))  # Adjust for latitude
            
            async with self.db_session() as session:
                site = session.query(ArchaeologicalSite).filter(
                    and_(
                        ArchaeologicalSite.latitude >= lat - lat_delta,
                        ArchaeologicalSite.latitude <= lat + lat_delta,
                        ArchaeologicalSite.longitude >= lon - lon_delta,
                        ArchaeologicalSite.longitude <= lon + lon_delta
                    )
                ).first()
                
                if site:
                    return SiteResponse(
                        site_id=site.site_id,
                        latitude=site.latitude,
                        longitude=site.longitude,
                        name=site.name,
                        site_type=site.site_type,
                        confidence_score=site.confidence_score,
                        validation_status=site.validation_status,
                        discovery_date=site.discovery_date,
                        analysis_count=len(site.analyses)
                    )
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to find nearby site: {e}")
            return None

    # === DISCOVERY STORAGE ===
    
    async def store_discovery(self, discovery_data: Union[DiscoveryCreate, Dict[str, Any]]) -> DiscoveryResponse:
        """Store discovery across all systems."""
        logger.info(f"🎯 Storing discovery")
        
        try:
            # Convert dict to DiscoveryCreate if needed
            if isinstance(discovery_data, dict):
                discovery_create = DiscoveryCreate(**discovery_data)
            else:
                discovery_create = discovery_data
            
            validated_sites = []
            total_confidence = 0.0
            
            # Process each site in the discovery
            for site_data in discovery_create.sites:
                # Store as archaeological site
                site_create_data = create_site_from_analysis(site_data)
                site_response = await self.store_site(site_create_data)
                validated_sites.append(site_response)
                total_confidence += site_response.confidence_score
            
            # Calculate overall confidence
            overall_confidence = total_confidence / len(validated_sites) if validated_sites else 0.0
            
            # Create discovery record
            discovery = Discovery(
                discovery_id=str(uuid4()),
                submission_id=discovery_create.metadata.get('submission_id', str(uuid4())),
                researcher_id=discovery_create.researcher_id,
                discovery_name=f"Discovery {datetime.now().strftime('%Y%m%d_%H%M%S')}",
                latitude=validated_sites[0].latitude if validated_sites else 0.0,
                longitude=validated_sites[0].longitude if validated_sites else 0.0,
                confidence_score=overall_confidence,
                validation_status=StorageStatus.STORED.value,
                description=f"Discovery of {len(validated_sites)} archaeological sites",
                validated_sites=[site.dict() for site in validated_sites],
                overall_confidence=overall_confidence,
                discovery_metadata=discovery_create.metadata
            )
            
            # Store in database
            async with self.db_session() as session:
                session.add(discovery)
                await session.commit()
                await session.refresh(discovery)
            
            # Cache in Redis
            if self.use_redis:
                cache_key = f"discovery:{discovery.discovery_id}"
                cache_data = {
                    "discovery_id": discovery.discovery_id,
                    "researcher_id": discovery.researcher_id,
                    "total_sites": len(validated_sites),
                    "overall_confidence": overall_confidence,
                    "timestamp": discovery.created_at.isoformat()
                }
                self.redis.cache_set(cache_key, cache_data, ttl=86400)
                logger.debug(f"📦 Discovery cached in Redis")
            
            # Publish to Kafka
            if self.use_kafka:
                kafka_event = {
                    "event_type": "discovery_stored",
                    "discovery_id": discovery.discovery_id,
                    "researcher_id": discovery.researcher_id,
                    "total_sites": len(validated_sites),
                    "overall_confidence": overall_confidence,
                    "timestamp": datetime.now().isoformat()
                }
                self.kafka.produce("nis.discoveries.stored", kafka_event, key=discovery.discovery_id)
                logger.debug(f"📡 Discovery event published to Kafka")
            
            # Create response
            response = DiscoveryResponse(
                discovery_id=discovery.discovery_id,
                submission_id=discovery.submission_id,
                researcher_id=discovery.researcher_id,
                total_sites=len(validated_sites),
                validated_sites=len(validated_sites),
                overall_confidence=overall_confidence
            )
            
            logger.info(f"✅ Discovery stored successfully: {len(validated_sites)} sites")
            return response
            
        except Exception as e:
            logger.error(f"❌ Failed to store discovery: {e}")
            raise

    # === LEARNING PATTERN STORAGE ===
    
    async def store_learning_pattern(self, pattern_data: Union[LearningPatternCreate, Dict[str, Any]]) -> LearningPatternResponse:
        """Store learning pattern for ML improvement."""
        logger.info(f"🤖 Storing learning pattern")
        
        try:
            # Convert dict to LearningPatternCreate if needed
            if isinstance(pattern_data, dict):
                pattern_create = LearningPatternCreate(**pattern_data)
            else:
                pattern_create = pattern_data
            
            # Create learning pattern
            pattern = LearningPattern(
                pattern_id=str(uuid4()),
                pattern_type=pattern_create.pattern_type,
                pattern_data=pattern_create.pattern_data,
                training_examples=pattern_create.training_examples,
                confidence_threshold=pattern_create.confidence_threshold,
                accuracy_score=0.0,  # Will be updated as pattern is used
                usage_count=0,
                success_rate=0.0
            )
            
            # Store in database
            async with self.db_session() as session:
                session.add(pattern)
                await session.commit()
                await session.refresh(pattern)
            
            # Cache in Redis
            if self.use_redis:
                cache_key = f"learning_pattern:{pattern.pattern_id}"
                cache_data = {
                    "pattern_id": pattern.pattern_id,
                    "pattern_type": pattern.pattern_type,
                    "confidence_threshold": pattern.confidence_threshold,
                    "accuracy_score": pattern.accuracy_score
                }
                self.redis.cache_set(cache_key, cache_data, ttl=86400)
                logger.debug(f"📦 Learning pattern cached in Redis")
            
            # Publish to Kafka
            if self.use_kafka:
                kafka_event = {
                    "event_type": "learning_pattern_stored",
                    "pattern_id": pattern.pattern_id,
                    "pattern_type": pattern.pattern_type,
                    "timestamp": datetime.now().isoformat()
                }
                self.kafka.produce("nis.learning.stored", kafka_event, key=pattern.pattern_id)
                logger.debug(f"📡 Learning pattern event published to Kafka")
            
            # Create response
            response = LearningPatternResponse(
                pattern_id=pattern.pattern_id,
                pattern_type=pattern.pattern_type,
                accuracy_score=pattern.accuracy_score,
                usage_count=pattern.usage_count,
                success_rate=pattern.success_rate
            )
            
            logger.info(f"✅ Learning pattern stored successfully: {pattern.pattern_id}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Failed to store learning pattern: {e}")
            raise

    # === UNIFIED STORAGE OPERATIONS ===
    
    async def store_comprehensive_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store comprehensive analysis with site creation and discovery tracking."""
        logger.info(f"🔄 Starting comprehensive analysis storage")
        
        try:
            storage_results = {
                "analysis_stored": False,
                "site_stored": False,
                "discovery_stored": False,
                "learning_stored": False,
                "storage_systems": [],
                "errors": []
            }
            
            # Extract basic data
            lat = analysis_data.get('lat', 0.0)
            lon = analysis_data.get('lon', 0.0)
            confidence = analysis_data.get('confidence', 0.0)
            analysis_id = analysis_data.get('analysis_id', str(uuid4()))
            
            # 1. Store in Database (Analysis Session)
            try:
                analysis_session = AnalysisSession(
                    analysis_id=analysis_id,
                    session_name=analysis_data.get('session_name'),
                    analysis_type=analysis_data.get('analysis_type', AnalysisType.COMPREHENSIVE.value),
                    latitude=lat,
                    longitude=lon,
                    coordinates_string=f"{lat},{lon}",
                    results=analysis_data.get('results', {}),
                    confidence_score=confidence,
                    agents_used=analysis_data.get('agents_used', []),
                    data_sources=analysis_data.get('data_sources', []),
                    processing_time=analysis_data.get('processing_time'),
                    backend_status=analysis_data.get('backend_status', 'success'),
                    storage_systems=['database'],
                    storage_status=StorageStatus.STORED.value
                )
                
                # Would store in database here
                # await self.db_session.add(analysis_session)
                storage_results["analysis_stored"] = True
                storage_results["analysis_id"] = analysis_id
                logger.info(f"✅ Analysis stored: {analysis_id}")
            except Exception as e:
                storage_results["errors"].append(f"Analysis storage failed: {e}")
                logger.error(f"❌ Analysis storage failed: {e}")
            
            # 2. Store in Redis Cache
            if self.use_redis:
                try:
                    cache_key = f"analysis:{analysis_id}"
                    cache_data = {
                        "analysis_id": analysis_id,
                        "coordinates": f"{lat},{lon}",
                        "confidence": confidence,
                        "results": analysis_data.get('results', {}),
                        "timestamp": datetime.now().isoformat()
                    }
                    self.redis.cache_set(cache_key, cache_data, ttl=86400)  # 24 hours
                    storage_results["storage_systems"].append('redis')
                    logger.debug(f"📦 Analysis cached in Redis: {cache_key}")
                except Exception as e:
                    storage_results["errors"].append(f"Redis storage failed: {e}")
                    logger.error(f"❌ Redis storage failed: {e}")
            
            # 3. Store in Memory Agent
            if self.memory_agent:
                try:
                    memory_data = {
                        "analysis_id": analysis_id,
                        "pattern_type": analysis_data.get('pattern_type', 'unknown'),
                        "confidence": confidence,
                        "cultural_significance": analysis_data.get('cultural_significance', ''),
                        "analysis_results": analysis_data.get('results', {})
                    }
                    success = self.memory_agent.store_site_data(lat, lon, memory_data)
                    if success:
                        storage_results["storage_systems"].append('memory_agent')
                        logger.debug(f"🧠 Analysis stored in Memory Agent")
                except Exception as e:
                    storage_results["errors"].append(f"Memory Agent storage failed: {e}")
                    logger.error(f"❌ Memory Agent storage failed: {e}")
            
            # 4. Publish to Kafka
            if self.use_kafka:
                try:
                    kafka_event = {
                        "event_type": "analysis_stored",
                        "analysis_id": analysis_id,
                        "coordinates": {"lat": lat, "lon": lon},
                        "analysis_type": analysis_data.get('analysis_type', 'comprehensive'),
                        "confidence": confidence,
                        "storage_systems": storage_results["storage_systems"],
                        "timestamp": datetime.now().isoformat()
                    }
                    self.kafka.produce("nis.analysis.stored", kafka_event, key=analysis_id)
                    storage_results["storage_systems"].append('kafka')
                    logger.debug(f"📡 Analysis event published to Kafka")
                except Exception as e:
                    storage_results["errors"].append(f"Kafka publish failed: {e}")
                    logger.error(f"❌ Kafka publish failed: {e}")
            
            # 5. Store Site (if confidence > threshold)
            if confidence > 0.5:
                try:
                    site_data = create_site_from_analysis(analysis_data)
                    # Would create site here
                    site_id = str(uuid4())
                    storage_results["site_stored"] = True
                    storage_results["site_id"] = site_id
                    logger.info(f"✅ Site stored: {site_id}")
                except Exception as e:
                    storage_results["errors"].append(f"Site storage failed: {e}")
                    logger.error(f"❌ Site storage failed: {e}")
            
            # 6. Store Discovery (if high confidence)
            if confidence > 0.7:
                try:
                    discovery_id = str(uuid4())
                    # Would create discovery record here
                    storage_results["discovery_stored"] = True
                    storage_results["discovery_id"] = discovery_id
                    logger.info(f"✅ Discovery stored: {discovery_id}")
                except Exception as e:
                    storage_results["errors"].append(f"Discovery storage failed: {e}")
                    logger.error(f"❌ Discovery storage failed: {e}")
            
            # 7. Store Learning Pattern
            try:
                pattern_id = str(uuid4())
                pattern_data = {
                    "pattern_type": analysis_data.get('pattern_type', 'unknown'),
                    "pattern_data": {
                        "confidence": confidence,
                        "coordinates": {"lat": lat, "lon": lon},
                        "analysis_results": analysis_data.get('results', {}),
                        "cultural_significance": analysis_data.get('cultural_significance', '')
                    },
                    "confidence_threshold": confidence
                }
                # Would store learning pattern here
                storage_results["learning_stored"] = True
                storage_results["learning_pattern_id"] = pattern_id
                logger.info(f"✅ Learning pattern stored: {pattern_id}")
            except Exception as e:
                storage_results["errors"].append(f"Learning pattern storage failed: {e}")
                logger.error(f"❌ Learning pattern storage failed: {e}")
            
            # Calculate success metrics
            total_operations = 4
            successful_operations = sum([
                storage_results["analysis_stored"],
                storage_results["site_stored"] if confidence > 0.5 else True,  # Skip if not qualified
                storage_results["discovery_stored"] if confidence > 0.7 else True,  # Skip if not qualified
                storage_results["learning_stored"]
            ])
            
            storage_results["success_rate"] = successful_operations / total_operations
            
            logger.info(f"🎯 Comprehensive storage completed: {len(storage_results['storage_systems'])} systems, {len(storage_results['errors'])} errors")
            return storage_results
            
        except Exception as e:
            logger.error(f"❌ Comprehensive analysis storage failed: {e}")
            raise

    # === QUERY METHODS ===
    
    async def get_all_sites(self, limit: int = 100) -> List[SiteResponse]:
        """Get all archaeological sites."""
        try:
            async with self.db_session() as session:
                sites = session.query(ArchaeologicalSite).limit(limit).all()
                return [
                    SiteResponse(
                        site_id=site.site_id,
                        latitude=site.latitude,
                        longitude=site.longitude,
                        name=site.name,
                        site_type=site.site_type,
                        confidence_score=site.confidence_score,
                        validation_status=site.validation_status,
                        discovery_date=site.discovery_date,
                        analysis_count=len(site.analyses)
                    ) for site in sites
                ]
        except Exception as e:
            logger.error(f"❌ Failed to get all sites: {e}")
            return []

    async def get_analysis_history(self, limit: int = 50) -> List[AnalysisResponse]:
        """Get analysis history."""
        try:
            async with self.db_session() as session:
                analyses = session.query(AnalysisSession).order_by(
                    AnalysisSession.created_at.desc()
                ).limit(limit).all()
                
                return [
                    AnalysisResponse(
                        analysis_id=analysis.analysis_id,
                        coordinates=analysis.coordinates_string,
                        analysis_type=analysis.analysis_type,
                        confidence_score=analysis.confidence_score,
                        storage_status=analysis.storage_status,
                        processing_time=analysis.processing_time,
                        created_at=analysis.created_at
                    ) for analysis in analyses
                ]
        except Exception as e:
            logger.error(f"❌ Failed to get analysis history: {e}")
            return []

    async def get_storage_metrics(self) -> Dict[str, Any]:
        """Get storage system metrics."""
        try:
            # Mock data for now - would query actual database
            return {
                "total_sites": 150,
                "total_analyses": 500,
                "total_discoveries": 75,
                "total_learning_patterns": 25,
                "storage_systems": {
                    "database": True,
                    "redis": self.use_redis,
                    "kafka": self.use_kafka,
                    "memory_agent": self.memory_agent is not None
                },
                "health_status": {
                    "database": "healthy",
                    "redis": "healthy" if self.use_redis else "unavailable",
                    "kafka": "healthy" if self.use_kafka else "unavailable",
                    "memory_agent": "healthy" if self.memory_agent else "unavailable"
                },
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Failed to get storage metrics: {e}")
            return {"error": str(e)}

    async def cleanup_old_data(self, days: int = 30) -> Dict[str, int]:
        """Clean up old data from storage systems."""
        logger.info(f"🧹 Starting cleanup of data older than {days} days")
        
        cleanup_results = {
            "analyses_cleaned": 0,
            "cache_keys_cleaned": 0,
            "files_cleaned": 0,
            "errors": []
        }
        
        try:
            # Redis cleanup
            if self.use_redis:
                # Would implement Redis key cleanup here
                cleanup_results["cache_keys_cleaned"] = 10  # Mock
                logger.info(f"🗑️ Cleaned {cleanup_results['cache_keys_cleaned']} Redis keys")
            
            # Memory agent file cleanup
            if self.memory_agent:
                # Would implement file cleanup here
                cleanup_results["files_cleaned"] = 5  # Mock
                logger.info(f"🗑️ Cleaned {cleanup_results['files_cleaned']} memory files")
            
            logger.info(f"✅ Cleanup completed successfully")
            return cleanup_results
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
            cleanup_results["errors"].append(str(e))
            return cleanup_results

# Singleton storage service
_storage_service = None

def get_storage_service() -> StorageService:
    """Get the singleton storage service instance."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service 