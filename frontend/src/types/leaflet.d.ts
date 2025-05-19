// Type declarations for Leaflet and react-leaflet
declare module 'leaflet' {
  import * as L from 'leaflet';
  export = L;
}

declare module 'react-leaflet' {
  import { ComponentType } from 'react';
  import * as L from 'leaflet';
  
  export interface MapContainerProps {
    center: L.LatLngExpression;
    zoom: number;
    style?: React.CSSProperties;
    scrollWheelZoom?: boolean;
    zoomControl?: boolean;
    whenCreated?: (map: L.Map) => void;
    [key: string]: any;
  }
  
  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<any>;
  export const Marker: ComponentType<any>;
  export const Popup: ComponentType<any>;
  export const ZoomControl: ComponentType<any>;
  export function useMap(): L.Map;
} 