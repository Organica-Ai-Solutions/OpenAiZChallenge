#!/bin/bash

# Base data directories
DATA_DIRS=(
  "data/indigenous_maps"
  "data/historical_texts"
  "data/colonial_texts"
  "data/oral_histories"
  "data/satellite"
  "data/lidar"
)

# Placeholder files to create
PLACEHOLDER_FILES=(
  "data/indigenous_maps/reference_features.json"
  "data/indigenous_maps/known_locations.geojson"
  "data/historical_texts/historical_places.csv"
)

# Create directories
for dir in "${DATA_DIRS[@]}"; do
  mkdir -p "$dir"
  echo "Created directory: $dir"
done

# Create placeholder files with minimal valid content
for file in "${PLACEHOLDER_FILES[@]}"; do
  case "$file" in
    *reference_features.json)
      echo '{"features": [], "type": "FeatureCollection"}' > "$file"
      ;;
    *known_locations.geojson)
      echo '{"type": "FeatureCollection", "features": []}' > "$file"
      ;;
    *historical_places.csv)
      echo "id,name,latitude,longitude" > "$file"
      ;;
  esac
  echo "Created placeholder file: $file"
done

# Verify file contents
for file in "${PLACEHOLDER_FILES[@]}"; do
  echo "File: $file"
  cat "$file"
  echo "---"
done

echo "Data source preparation complete." 