import { SiteData } from './site-data';

declare module '@/components/MapViewerImpl' {
  export interface MapViewerImplProps {
    sites: SiteData[];
    selectedSite: SiteData | null;
    onSiteSelect: (site: SiteData) => void;
    className?: string;
    initialCoordinates?: string;
    onCoordinateSelect?: (coords: string) => void;
  }

  export default function MapViewerImpl(props: MapViewerImplProps): JSX.Element;
} 