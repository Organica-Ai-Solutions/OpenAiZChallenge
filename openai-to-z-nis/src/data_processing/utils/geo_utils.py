from typing import Tuple, List
import math
from shapely.geometry import box
from pyproj import Transformer

def get_bbox_from_coords(
    coordinates: Tuple[float, float],
    radius_km: float
) -> Tuple[float, float, float, float]:
    """
    Calculate bounding box from coordinates and radius.
    
    Args:
        coordinates: (latitude, longitude) tuple
        radius_km: Radius in kilometers
        
    Returns:
        (min_lon, min_lat, max_lon, max_lat) tuple
    """
    lat, lon = coordinates
    
    # Convert radius from km to degrees (approximate)
    lat_radius = radius_km / 111.32  # 1 degree of latitude is approximately 111.32 km
    lon_radius = radius_km / (111.32 * math.cos(math.radians(lat)))
    
    return (
        lon - lon_radius,  # min_lon
        lat - lat_radius,  # min_lat
        lon + lon_radius,  # max_lon
        lat + lat_radius   # max_lat
    )

def transform_coordinates(
    coordinates: Tuple[float, float],
    from_epsg: int,
    to_epsg: int
) -> Tuple[float, float]:
    """
    Transform coordinates between different coordinate reference systems.
    
    Args:
        coordinates: (x, y) tuple in source CRS
        from_epsg: Source EPSG code
        to_epsg: Target EPSG code
        
    Returns:
        (x, y) tuple in target CRS
    """
    transformer = Transformer.from_crs(from_epsg, to_epsg, always_xy=True)
    return transformer.transform(coordinates[0], coordinates[1])

def calculate_area(
    coordinates: List[Tuple[float, float]],
    epsg: int = 4326
) -> float:
    """
    Calculate area of a polygon defined by coordinates.
    
    Args:
        coordinates: List of (x, y) tuples
        epsg: EPSG code of the coordinate system
        
    Returns:
        Area in square meters
    """
    # Create polygon from coordinates
    polygon = box(*get_bbox_from_coords(coordinates[0], 0))
    
    # Transform to a projected CRS for area calculation
    if epsg == 4326:  # WGS84
        # Transform to UTM
        utm_zone = int((coordinates[0][1] + 180) / 6) + 1
        utm_epsg = 32600 + utm_zone
        transformer = Transformer.from_crs(epsg, utm_epsg, always_xy=True)
        transformed_coords = [transformer.transform(x, y) for x, y in coordinates]
        polygon = box(*get_bbox_from_coords(transformed_coords[0], 0))
    
    return polygon.area

def calculate_distance(
    point1: Tuple[float, float],
    point2: Tuple[float, float]
) -> float:
    """
    Calculate distance between two points in kilometers.
    
    Args:
        point1: (latitude, longitude) tuple of first point
        point2: (latitude, longitude) tuple of second point
        
    Returns:
        Distance in kilometers
    """
    lat1, lon1 = point1
    lat2, lon2 = point2
    
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Earth's radius in kilometers
    
    return c * r 