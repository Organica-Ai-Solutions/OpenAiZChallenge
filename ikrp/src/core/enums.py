from enum import Enum, auto

class DataSourceType(str, Enum):
    """Enumeration of data source types for research processing."""
    SATELLITE = "satellite"
    LIDAR = "lidar"
    HISTORICAL_TEXT = "historical_text"
    INDIGENOUS_MAP = "indigenous_map"

class ValidationStatus(str, Enum):
    """Enumeration of possible validation statuses."""
    PENDING = "PENDING"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    MEDIUM_CONFIDENCE = "MEDIUM_CONFIDENCE"
    HIGH_CONFIDENCE = "HIGH_CONFIDENCE"
    ANALYSIS_ERROR = "ANALYSIS_ERROR" 