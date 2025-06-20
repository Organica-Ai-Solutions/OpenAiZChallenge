#!/usr/bin/env python3
"""Enhanced Learning Agent for Archaeological Discovery System.

This agent learns from each analysis, improves predictions, and provides
intelligent recommendations for future discoveries.
"""

import json
import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
from dataclasses import dataclass
import sqlite3
import aiosqlite

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LearningPattern:
    """Represents a learned pattern from archaeological data."""
    pattern_id: str
    pattern_type: str  # 'geographic', 'confidence', 'cultural', 'site_type'
    pattern_data: Dict[str, Any]
    confidence: float
    learned_from_count: int
    last_updated: datetime
    effectiveness_score: float = 0.0

@dataclass
class Prediction:
    """Represents a prediction about archaeological potential."""
    location: Tuple[float, float]  # (lat, lon)
    predicted_confidence: float
    predicted_type: str
    reasoning: List[str]
    supporting_patterns: List[str]
    prediction_quality: str  # 'high', 'medium', 'low'

class ArchaeologicalLearningAgent:
    """Advanced learning agent for archaeological discovery system."""
    
    def __init__(self, db_path: str = "archaeological_learning.db"):
        self.db_path = db_path
        self.patterns: Dict[str, LearningPattern] = {}
        self.learning_history: List[Dict[str, Any]] = []
        self.prediction_cache: Dict[str, Prediction] = {}
        
        # Learning parameters
        self.min_confidence_threshold = 0.6
        self.pattern_update_threshold = 0.05
        self.max_patterns_per_type = 100
        
        # Initialize database
        asyncio.create_task(self._init_database())
        
    async def _init_database(self):
        """Initialize the learning database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS learning_patterns (
                        pattern_id TEXT PRIMARY KEY,
                        pattern_type TEXT NOT NULL,
                        pattern_data TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        learned_from_count INTEGER NOT NULL,
                        last_updated TEXT NOT NULL,
                        effectiveness_score REAL DEFAULT 0.0
                    )
                """)
                
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS learning_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        analysis_id TEXT NOT NULL,
                        learned_at TEXT NOT NULL,
                        patterns_extracted INTEGER DEFAULT 0,
                        confidence_learned REAL DEFAULT 0.0,
                        learning_quality TEXT DEFAULT 'unknown'
                    )
                """)
                
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS predictions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        location_key TEXT NOT NULL,
                        lat REAL NOT NULL,
                        lon REAL NOT NULL,
                        predicted_confidence REAL NOT NULL,
                        predicted_type TEXT NOT NULL,
                        reasoning TEXT NOT NULL,
                        supporting_patterns TEXT NOT NULL,
                        prediction_quality TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    )
                """)
                
                await db.commit()
                logger.info("✅ Learning database initialized")
                
                # Load existing patterns
                await self._load_patterns()
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize learning database: {e}")
    
    async def _load_patterns(self):
        """Load existing patterns from database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                async with db.execute("SELECT * FROM learning_patterns") as cursor:
                    rows = await cursor.fetchall()
                    
                for row in rows:
                    pattern = LearningPattern(
                        pattern_id=row[0],
                        pattern_type=row[1],
                        pattern_data=json.loads(row[2]),
                        confidence=row[3],
                        learned_from_count=row[4],
                        last_updated=datetime.fromisoformat(row[5]),
                        effectiveness_score=row[6]
                    )
                    self.patterns[pattern.pattern_id] = pattern
                    
                logger.info(f"📚 Loaded {len(self.patterns)} learning patterns")
                
        except Exception as e:
            logger.error(f"❌ Failed to load patterns: {e}")
    
    async def learn_from_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Learn from a completed archaeological analysis."""
        try:
            logger.info(f"🧠 Learning from analysis: {analysis_data.get('analysis_id', 'unknown')}")
            
            # Extract patterns from the analysis
            patterns_extracted = 0
            patterns_extracted += await self._learn_geographic_patterns(analysis_data)
            patterns_extracted += await self._learn_confidence_patterns(analysis_data)
            patterns_extracted += await self._learn_cultural_patterns(analysis_data)
            patterns_extracted += await self._learn_site_type_patterns(analysis_data)
            
            # Record learning event
            learning_record = {
                "analysis_id": analysis_data.get("analysis_id", "unknown"),
                "learned_at": datetime.now().isoformat(),
                "patterns_extracted": patterns_extracted,
                "confidence_learned": analysis_data.get("confidence", 0.0),
                "learning_quality": self._assess_learning_quality(analysis_data, patterns_extracted)
            }
            
            await self._save_learning_record(learning_record)
            self.learning_history.append(learning_record)
            
            # Generate recommendations based on new learning
            recommendations = await self._generate_recommendations(analysis_data)
            
            logger.info(f"✅ Learning complete: {patterns_extracted} patterns extracted")
            
            return {
                "status": "success",
                "patterns_extracted": patterns_extracted,
                "confidence_learned": analysis_data.get("confidence", 0.0),
                "recommendations_generated": len(recommendations),
                "learning_quality": learning_record["learning_quality"],
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"❌ Learning failed: {e}")
            return {"status": "error", "error": str(e)}
    
    async def _learn_geographic_patterns(self, analysis_data: Dict[str, Any]) -> int:
        """Learn geographic patterns from analysis data."""
        try:
            lat = analysis_data.get("lat", 0.0)
            lon = analysis_data.get("lon", 0.0)
            confidence = analysis_data.get("confidence", 0.0)
            
            if confidence < self.min_confidence_threshold:
                return 0
            
            # Create geographic pattern
            pattern_id = f"geo_{lat:.2f}_{lon:.2f}_{confidence:.2f}"
            
            pattern_data = {
                "center_lat": lat,
                "center_lon": lon,
                "radius_km": 50.0,  # 50km radius for geographic clustering
                "avg_confidence": confidence,
                "site_density": 1,
                "discovery_method": analysis_data.get("data_sources", ["satellite"])
            }
            
            await self._update_or_create_pattern(
                pattern_id, "geographic", pattern_data, confidence
            )
            
            return 1
            
        except Exception as e:
            logger.error(f"❌ Geographic pattern learning failed: {e}")
            return 0
    
    async def _learn_confidence_patterns(self, analysis_data: Dict[str, Any]) -> int:
        """Learn confidence prediction patterns."""
        try:
            confidence = analysis_data.get("confidence", 0.0)
            data_sources = analysis_data.get("data_sources", [])
            agents_used = analysis_data.get("agents_used", [])
            
            pattern_id = f"conf_{len(data_sources)}_{len(agents_used)}"
            
            pattern_data = {
                "data_source_count": len(data_sources),
                "agent_count": len(agents_used),
                "data_sources": data_sources,
                "agents_used": agents_used,
                "confidence_range": self._get_confidence_range(confidence),
                "success_indicators": self._extract_success_indicators(analysis_data)
            }
            
            await self._update_or_create_pattern(
                pattern_id, "confidence", pattern_data, confidence
            )
            
            return 1
            
        except Exception as e:
            logger.error(f"❌ Confidence pattern learning failed: {e}")
            return 0
    
    async def _learn_cultural_patterns(self, analysis_data: Dict[str, Any]) -> int:
        """Learn cultural significance patterns."""
        try:
            cultural_sig = analysis_data.get("cultural_significance", "")
            pattern_type = analysis_data.get("pattern_type", "unknown")
            
            if not cultural_sig or len(cultural_sig) < 10:
                return 0
            
            pattern_id = f"cultural_{pattern_type}"
            
            # Extract cultural keywords
            cultural_keywords = self._extract_cultural_keywords(cultural_sig)
            
            pattern_data = {
                "pattern_type": pattern_type,
                "cultural_keywords": cultural_keywords,
                "significance_length": len(cultural_sig),
                "common_terms": self._get_common_cultural_terms(cultural_sig),
                "importance_indicators": self._extract_importance_indicators(cultural_sig)
            }
            
            await self._update_or_create_pattern(
                pattern_id, "cultural", pattern_data, analysis_data.get("confidence", 0.0)
            )
            
            return 1
            
        except Exception as e:
            logger.error(f"❌ Cultural pattern learning failed: {e}")
            return 0
    
    async def _learn_site_type_patterns(self, analysis_data: Dict[str, Any]) -> int:
        """Learn site type prediction patterns."""
        try:
            pattern_type = analysis_data.get("pattern_type", "unknown")
            confidence = analysis_data.get("confidence", 0.0)
            results = analysis_data.get("results", {})
            
            pattern_id = f"site_type_{pattern_type}"
            
            pattern_data = {
                "site_type": pattern_type,
                "features_detected": results.get("features_detected", 0),
                "typical_confidence": confidence,
                "common_characteristics": self._extract_site_characteristics(results),
                "geographic_preferences": self._get_geographic_preferences(analysis_data)
            }
            
            await self._update_or_create_pattern(
                pattern_id, "site_type", pattern_data, confidence
            )
            
            return 1
            
        except Exception as e:
            logger.error(f"❌ Site type pattern learning failed: {e}")
            return 0
    
    async def predict_site_potential(self, lat: float, lon: float, data_sources: List[str]) -> Dict[str, Any]:
        """Predict archaeological potential for given coordinates."""
        try:
            location_key = f"{lat:.4f}_{lon:.4f}"
            
            # Check cache first
            if location_key in self.prediction_cache:
                cached = self.prediction_cache[location_key]
                return {
                    "predicted_confidence": cached.predicted_confidence,
                    "predicted_type": cached.predicted_type,
                    "reasoning": cached.reasoning,
                    "supporting_patterns": cached.supporting_patterns,
                    "prediction_quality": cached.prediction_quality,
                    "cached": True
                }
            
            # Generate new prediction
            prediction = await self._generate_prediction(lat, lon, data_sources)
            
            # Cache the prediction
            self.prediction_cache[location_key] = prediction
            
            # Save to database
            await self._save_prediction(prediction)
            
            return {
                "predicted_confidence": prediction.predicted_confidence,
                "predicted_type": prediction.predicted_type,
                "reasoning": prediction.reasoning,
                "supporting_patterns": prediction.supporting_patterns,
                "prediction_quality": prediction.prediction_quality,
                "cached": False
            }
            
        except Exception as e:
            logger.error(f"❌ Prediction failed: {e}")
            return {"error": str(e)}
    
    async def _generate_prediction(self, lat: float, lon: float, data_sources: List[str]) -> Prediction:
        """Generate a prediction for the given location."""
        reasoning = []
        supporting_patterns = []
        confidence_scores = []
        predicted_types = []
        
        # Analyze geographic patterns
        for pattern in self.patterns.values():
            if pattern.pattern_type == "geographic":
                distance = self._calculate_distance(
                    lat, lon, 
                    pattern.pattern_data["center_lat"], 
                    pattern.pattern_data["center_lon"]
                )
                
                if distance <= pattern.pattern_data["radius_km"]:
                    confidence_scores.append(pattern.confidence * 0.8)  # Geographic proximity bonus
                    reasoning.append(f"Located within {distance:.1f}km of known archaeological area")
                    supporting_patterns.append(pattern.pattern_id)
        
        # Analyze confidence patterns
        for pattern in self.patterns.values():
            if pattern.pattern_type == "confidence":
                data_match = len(set(data_sources) & set(pattern.pattern_data.get("data_sources", [])))
                if data_match > 0:
                    confidence_scores.append(pattern.confidence * (data_match / len(data_sources)))
                    reasoning.append(f"Data source compatibility: {data_match}/{len(data_sources)} match")
                    supporting_patterns.append(pattern.pattern_id)
        
        # Analyze cultural patterns
        for pattern in self.patterns.values():
            if pattern.pattern_type == "cultural":
                # Cultural patterns contribute to type prediction
                predicted_types.append(pattern.pattern_data.get("pattern_type", "unknown"))
        
        # Calculate final prediction
        if confidence_scores:
            predicted_confidence = min(np.mean(confidence_scores), 0.95)  # Cap at 95%
        else:
            predicted_confidence = 0.3  # Default low confidence
        
        if predicted_types:
            predicted_type = max(set(predicted_types), key=predicted_types.count)
        else:
            predicted_type = "unknown"
        
        # Assess prediction quality
        prediction_quality = self._assess_prediction_quality(
            len(supporting_patterns), len(reasoning), predicted_confidence
        )
        
        if not reasoning:
            reasoning = ["No historical patterns available for this area"]
        
        return Prediction(
            location=(lat, lon),
            predicted_confidence=predicted_confidence,
            predicted_type=predicted_type,
            reasoning=reasoning,
            supporting_patterns=supporting_patterns,
            prediction_quality=prediction_quality
        )
    
    async def get_learning_summary(self) -> Dict[str, Any]:
        """Get a comprehensive summary of learning progress."""
        try:
            pattern_counts = {}
            for pattern in self.patterns.values():
                pattern_counts[pattern.pattern_type] = pattern_counts.get(pattern.pattern_type, 0) + 1
            
            recent_learning = [record for record in self.learning_history 
                             if datetime.fromisoformat(record["learned_at"]) > datetime.now() - timedelta(days=7)]
            
            avg_patterns_per_analysis = (
                np.mean([record["patterns_extracted"] for record in self.learning_history])
                if self.learning_history else 0
            )
            
            return {
                "learning_metrics": {
                    "total_patterns": len(self.patterns),
                    "pattern_breakdown": pattern_counts,
                    "total_analyses_learned": len(self.learning_history),
                    "recent_analyses": len(recent_learning),
                    "avg_patterns_per_analysis": round(avg_patterns_per_analysis, 2),
                    "patterns_discovered": len(self.patterns)
                },
                "learning_quality": self._assess_overall_learning_quality(),
                "prediction_capabilities": {
                    "geographic_coverage": len([p for p in self.patterns.values() if p.pattern_type == "geographic"]),
                    "confidence_models": len([p for p in self.patterns.values() if p.pattern_type == "confidence"]),
                    "cultural_insights": len([p for p in self.patterns.values() if p.pattern_type == "cultural"]),
                    "site_type_models": len([p for p in self.patterns.values() if p.pattern_type == "site_type"])
                },
                "recommendations": await self._get_learning_recommendations()
            }
            
        except Exception as e:
            logger.error(f"❌ Learning summary failed: {e}")
            return {"error": str(e)}
    
    # Helper methods
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers."""
        from math import radians, cos, sin, asin, sqrt
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        return 2 * asin(sqrt(a)) * 6371  # Earth's radius in km
    
    def _get_confidence_range(self, confidence: float) -> str:
        """Categorize confidence into ranges."""
        if confidence >= 0.8:
            return "high"
        elif confidence >= 0.6:
            return "medium"
        else:
            return "low"
    
    def _extract_cultural_keywords(self, text: str) -> List[str]:
        """Extract important cultural keywords from text."""
        keywords = []
        cultural_terms = [
            "settlement", "ceremonial", "temple", "plaza", "burial", "agricultural",
            "sacred", "ritual", "defensive", "trading", "residential", "astronomical"
        ]
        
        text_lower = text.lower()
        for term in cultural_terms:
            if term in text_lower:
                keywords.append(term)
                
        return keywords
    
    def _assess_learning_quality(self, analysis_data: Dict[str, Any], patterns_extracted: int) -> str:
        """Assess the quality of learning from this analysis."""
        confidence = analysis_data.get("confidence", 0.0)
        
        if patterns_extracted >= 3 and confidence >= 0.8:
            return "excellent"
        elif patterns_extracted >= 2 and confidence >= 0.6:
            return "good"
        elif patterns_extracted >= 1:
            return "fair"
        else:
            return "poor"
    
    def _assess_prediction_quality(self, pattern_count: int, reasoning_count: int, confidence: float) -> str:
        """Assess the quality of a prediction."""
        if pattern_count >= 3 and reasoning_count >= 3 and confidence >= 0.7:
            return "high"
        elif pattern_count >= 2 and reasoning_count >= 2 and confidence >= 0.5:
            return "medium"
        else:
            return "low"
    
    def _assess_overall_learning_quality(self) -> str:
        """Assess overall learning system quality."""
        if len(self.patterns) >= 20 and len(self.learning_history) >= 10:
            return "excellent"
        elif len(self.patterns) >= 10 and len(self.learning_history) >= 5:
            return "good"
        elif len(self.patterns) >= 5:
            return "developing"
        else:
            return "initial"
    
    # Database operations
    async def _update_or_create_pattern(self, pattern_id: str, pattern_type: str, 
                                      pattern_data: Dict[str, Any], confidence: float):
        """Update existing pattern or create new one."""
        try:
            if pattern_id in self.patterns:
                # Update existing pattern
                existing = self.patterns[pattern_id]
                existing.pattern_data.update(pattern_data)
                existing.confidence = (existing.confidence + confidence) / 2  # Average
                existing.learned_from_count += 1
                existing.last_updated = datetime.now()
            else:
                # Create new pattern
                pattern = LearningPattern(
                    pattern_id=pattern_id,
                    pattern_type=pattern_type,
                    pattern_data=pattern_data,
                    confidence=confidence,
                    learned_from_count=1,
                    last_updated=datetime.now()
                )
                self.patterns[pattern_id] = pattern
            
            # Save to database
            await self._save_pattern(self.patterns[pattern_id])
            
        except Exception as e:
            logger.error(f"❌ Pattern update failed: {e}")
    
    async def _save_pattern(self, pattern: LearningPattern):
        """Save pattern to database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    INSERT OR REPLACE INTO learning_patterns 
                    (pattern_id, pattern_type, pattern_data, confidence, learned_from_count, last_updated, effectiveness_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    pattern.pattern_id,
                    pattern.pattern_type,
                    json.dumps(pattern.pattern_data),
                    pattern.confidence,
                    pattern.learned_from_count,
                    pattern.last_updated.isoformat(),
                    pattern.effectiveness_score
                ))
                await db.commit()
                
        except Exception as e:
            logger.error(f"❌ Pattern save failed: {e}")
    
    async def _save_learning_record(self, record: Dict[str, Any]):
        """Save learning record to database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    INSERT INTO learning_history 
                    (analysis_id, learned_at, patterns_extracted, confidence_learned, learning_quality)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    record["analysis_id"],
                    record["learned_at"],
                    record["patterns_extracted"],
                    record["confidence_learned"],
                    record["learning_quality"]
                ))
                await db.commit()
                
        except Exception as e:
            logger.error(f"❌ Learning record save failed: {e}")
    
    async def _save_prediction(self, prediction: Prediction):
        """Save prediction to database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                location_key = f"{prediction.location[0]:.4f}_{prediction.location[1]:.4f}"
                await db.execute("""
                    INSERT INTO predictions 
                    (location_key, lat, lon, predicted_confidence, predicted_type, reasoning, supporting_patterns, prediction_quality, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    location_key,
                    prediction.location[0],
                    prediction.location[1],
                    prediction.predicted_confidence,
                    prediction.predicted_type,
                    json.dumps(prediction.reasoning),
                    json.dumps(prediction.supporting_patterns),
                    prediction.prediction_quality,
                    datetime.now().isoformat()
                ))
                await db.commit()
                
        except Exception as e:
            logger.error(f"❌ Prediction save failed: {e}")
    
    # Additional helper methods (simplified implementations)
    def _extract_success_indicators(self, analysis_data: Dict[str, Any]) -> List[str]:
        """Extract indicators of successful analysis."""
        indicators = []
        if analysis_data.get("confidence", 0) > 0.8:
            indicators.append("high_confidence")
        if analysis_data.get("results", {}).get("features_detected", 0) > 10:
            indicators.append("multiple_features")
        return indicators
    
    def _get_common_cultural_terms(self, text: str) -> List[str]:
        """Get common cultural terms from text."""
        return self._extract_cultural_keywords(text)  # Simplified
    
    def _extract_importance_indicators(self, text: str) -> List[str]:
        """Extract importance indicators from cultural significance text."""
        indicators = []
        if any(word in text.lower() for word in ["sacred", "important", "significant"]):
            indicators.append("high_importance")
        if any(word in text.lower() for word in ["rare", "unique", "exceptional"]):
            indicators.append("unique_characteristics")
        return indicators
    
    def _extract_site_characteristics(self, results: Dict[str, Any]) -> List[str]:
        """Extract site characteristics from results."""
        characteristics = []
        if results.get("features_detected", 0) > 15:
            characteristics.append("complex_site")
        if "structures" in results:
            characteristics.append("architectural_features")
        return characteristics
    
    def _get_geographic_preferences(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get geographic preferences for site type."""
        return {
            "latitude_range": [analysis_data.get("lat", 0) - 1, analysis_data.get("lat", 0) + 1],
            "longitude_range": [analysis_data.get("lon", 0) - 1, analysis_data.get("lon", 0) + 1]
        }
    
    async def _generate_recommendations(self, analysis_data: Dict[str, Any]) -> List[str]:
        """Generate learning-based recommendations."""
        recommendations = []
        confidence = analysis_data.get("confidence", 0.0)
        
        if confidence > 0.8:
            recommendations.append("Consider expanding search radius around this high-confidence discovery")
        
        if len(self.patterns) > 10:
            recommendations.append("Sufficient patterns learned - predictions available for new locations")
        
        return recommendations
    
    async def _get_learning_recommendations(self) -> List[str]:
        """Get recommendations for improving learning system."""
        recommendations = []
        
        if len(self.patterns) < 10:
            recommendations.append("Perform more analyses to improve pattern recognition")
        
        if len([p for p in self.patterns.values() if p.pattern_type == "geographic"]) < 5:
            recommendations.append("Analyze more diverse geographic locations")
        
        return recommendations


# Global learning agent instance
learning_agent = ArchaeologicalLearningAgent()

# Convenience functions for external use
async def learn_from_analysis(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """Learn from analysis data - external interface."""
    return await learning_agent.learn_from_analysis(analysis_data)

async def predict_site_potential(lat: float, lon: float, data_sources: List[str]) -> Dict[str, Any]:
    """Predict site potential - external interface."""
    return await learning_agent.predict_site_potential(lat, lon, data_sources)

async def get_learning_summary() -> Dict[str, Any]:
    """Get learning summary - external interface."""
    return await learning_agent.get_learning_summary()

def get_learning_agent() -> ArchaeologicalLearningAgent:
    """Get the global learning agent instance."""
    return learning_agent 