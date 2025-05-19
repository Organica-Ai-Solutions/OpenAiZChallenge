declare module '@/types' {
  export interface SiteData {
    id: string;
    name?: string;
    type?: string;
    coordinates: string;
    confidence: number;
    description?: string;
  }
}

declare module '@/components/DynamicMapViewer' {
  import { SiteData } from '@/types';
  
  interface DynamicMapViewerProps {
    sites: SiteData[];
    selectedSite: SiteData | null;
    onSiteSelect: (site: SiteData) => void;
    initialCoordinates?: string;
    onCoordinateSelect?: (coords: string) => void;
    className?: string;
  }
  
  const DynamicMapViewer: React.FC<DynamicMapViewerProps>;
  export default DynamicMapViewer;
} 