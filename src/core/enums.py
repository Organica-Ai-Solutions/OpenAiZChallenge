from enum import Enum, auto

class DataSourceType(Enum):
    """Enumeration of data source types."""
    SATELLITE = auto()
    LIDAR = auto()
    HISTORICAL_TEXT = auto()
    ARCHAEOLOGICAL_SURVEY = auto()
    INDIGENOUS_MAP = auto()

class ValidationStatus(Enum):
    """Enumeration of validation statuses."""
    PENDING = auto()
    IN_PROGRESS = auto()
    VALIDATED = auto()
    REJECTED = auto()
    REQUIRES_REVIEW = auto()
