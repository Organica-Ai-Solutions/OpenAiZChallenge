from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator, constr
from datetime import datetime
import logging
from enum import Enum
import numpy as np
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class DataSource(str, Enum):
    SATELLITE = "satellite"
    LIDAR = "lidar"
    HISTORICAL = "historical"
    INDIGENOUS = "indigenous"

class CoordinateData(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    timestamp: Optional[datetime] = None
    source: DataSource
    value: Union[float, Dict[str, Any]]
    metadata: Optional[Dict] = {}
    
    @validator('value')
    def validate_value(cls, v):
        if isinstance(v, float):
            if not np.isfinite(v):
                raise ValueError("Value must be a finite number")
        elif isinstance(v, dict):
            try:
                json.dumps(v)  # Ensure serializable
            except Exception:
                raise ValueError("Dictionary value must be JSON serializable")
        return v

class AnalysisRequest(BaseModel):
    coordinates: List[CoordinateData]
    data_sources: Dict[DataSource, bool] = Field(
        default_factory=lambda: {ds: True for ds in DataSource}
    )
    parameters: Optional[Dict[str, Any]] = {}
    
    @validator('coordinates')
    def validate_coordinates(cls, v):
        if not v:
            raise ValueError("At least one coordinate must be provided")
        return v
    
    @validator('parameters')
    def validate_parameters(cls, v):
        if v is None:
            return {}
        try:
            json.dumps(v)  # Ensure serializable
        except Exception:
            raise ValueError("Parameters must be JSON serializable")
        return v

class DataValidator:
    def __init__(self):
        self.error_log_path = Path("outputs/logs/validation_errors.log")
        self.error_log_path.parent.mkdir(parents=True, exist_ok=True)
    
    def validate_analysis_request(
        self,
        data: Dict
    ) -> Optional[AnalysisRequest]:
        """
        Validate an analysis request.
        
        Args:
            data: Dictionary containing the request data
            
        Returns:
            Validated AnalysisRequest object or None if validation fails
        """
        try:
            # Convert data to AnalysisRequest model
            request = AnalysisRequest(**data)
            return request
            
        except Exception as e:
            self._log_validation_error("analysis_request", data, str(e))
            raise ValueError(f"Invalid analysis request: {str(e)}")
    
    def validate_coordinate_data(
        self,
        data: Dict,
        source: DataSource
    ) -> Optional[CoordinateData]:
        """
        Validate coordinate data from a specific source.
        
        Args:
            data: Dictionary containing coordinate data
            source: Data source type
            
        Returns:
            Validated CoordinateData object or None if validation fails
        """
        try:
            # Add source to data
            data["source"] = source
            
            # Convert data to CoordinateData model
            coord_data = CoordinateData(**data)
            return coord_data
            
        except Exception as e:
            self._log_validation_error(f"coordinate_data_{source}", data, str(e))
            raise ValueError(f"Invalid coordinate data for {source}: {str(e)}")
    
    def validate_batch_data(
        self,
        data: List[Dict]
    ) -> List[CoordinateData]:
        """
        Validate a batch of coordinate data.
        
        Args:
            data: List of dictionaries containing coordinate data
            
        Returns:
            List of validated CoordinateData objects
        """
        validated_data = []
        errors = []
        
        for i, item in enumerate(data):
            try:
                if "source" not in item:
                    raise ValueError("Data source not specified")
                    
                source = DataSource(item["source"])
                validated = self.validate_coordinate_data(item, source)
                validated_data.append(validated)
                
            except Exception as e:
                errors.append({
                    "index": i,
                    "data": item,
                    "error": str(e)
                })
        
        if errors:
            self._log_validation_error("batch_data", errors, "Multiple validation errors")
            raise ValueError(f"Validation failed for {len(errors)} items in batch")
        
        return validated_data
    
    def validate_pattern_data(
        self,
        data: Dict,
        required_fields: List[str] = None
    ) -> Dict:
        """
        Validate pattern detection data.
        
        Args:
            data: Dictionary containing pattern data
            required_fields: List of required field names
            
        Returns:
            Validated data dictionary
        """
        try:
            if required_fields is None:
                required_fields = ["coordinates", "type", "confidence"]
            
            # Check required fields
            missing_fields = [
                field for field in required_fields
                if field not in data
            ]
            
            if missing_fields:
                raise ValueError(f"Missing required fields: {missing_fields}")
            
            # Validate coordinates
            if "coordinates" in data:
                coords = data["coordinates"]
                if not isinstance(coords, list):
                    raise ValueError("Coordinates must be a list")
                
                for coord in coords:
                    if not isinstance(coord, (list, tuple)) or len(coord) != 2:
                        raise ValueError("Each coordinate must be a pair of numbers")
                    
                    try:
                        lat, lon = map(float, coord)
                        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                            raise ValueError("Invalid coordinate values")
                    except (ValueError, TypeError):
                        raise ValueError("Coordinates must be numeric")
            
            # Validate confidence
            if "confidence" in data:
                conf = data["confidence"]
                try:
                    conf = float(conf)
                    if not (0 <= conf <= 1):
                        raise ValueError("Confidence must be between 0 and 1")
                    data["confidence"] = conf
                except (ValueError, TypeError):
                    raise ValueError("Confidence must be a number between 0 and 1")
            
            return data
            
        except Exception as e:
            self._log_validation_error("pattern_data", data, str(e))
            raise ValueError(f"Invalid pattern data: {str(e)}")
    
    def _log_validation_error(
        self,
        context: str,
        data: Any,
        error: str
    ) -> None:
        """Log a validation error."""
        try:
            timestamp = datetime.now().isoformat()
            error_entry = {
                "timestamp": timestamp,
                "context": context,
                "data": data,
                "error": error
            }
            
            with open(self.error_log_path, "a") as f:
                f.write(json.dumps(error_entry) + "\n")
                
        except Exception as e:
            logger.error(f"Error logging validation error: {str(e)}")
    
    def get_validation_errors(
        self,
        context: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Get validation errors from the log.
        
        Args:
            context: Optional context to filter by
            start_time: Optional start time for filtering
            end_time: Optional end time for filtering
            
        Returns:
            List of error entries
        """
        try:
            errors = []
            
            with open(self.error_log_path, "r") as f:
                for line in f:
                    try:
                        error = json.loads(line)
                        
                        # Apply filters
                        if context and error["context"] != context:
                            continue
                            
                        if start_time or end_time:
                            error_time = datetime.fromisoformat(error["timestamp"])
                            
                            if start_time and error_time < start_time:
                                continue
                            if end_time and error_time > end_time:
                                continue
                        
                        errors.append(error)
                        
                    except json.JSONDecodeError:
                        continue
            
            return errors
            
        except Exception as e:
            logger.error(f"Error reading validation errors: {str(e)}")
            return [] 