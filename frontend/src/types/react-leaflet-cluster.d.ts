declare module 'react-leaflet-cluster' {
  import { ReactNode } from 'react';
  import { LayerGroup } from 'leaflet';

  interface MarkerClusterGroupProps {
    children?: ReactNode;
    chunkedLoading?: boolean;
    iconCreateFunction?: (cluster: any) => any;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
  }

  declare const MarkerClusterGroup: React.ComponentType<MarkerClusterGroupProps>;

  export default MarkerClusterGroup;
} 