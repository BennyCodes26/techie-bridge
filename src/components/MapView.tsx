
import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import 'ol/ol.css';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  markers?: Array<{
    id: string;
    position: [number, number]; // [longitude, latitude]
    selected?: boolean;
  }>;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  onMarkerClick?: (id: string) => void;
}

export function MapView({ 
  markers = [], 
  center = [-73.9857, 40.7484], // Default: NYC
  zoom = 12,
  onMarkerClick
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    
    try {
      // Create map
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat(center), // convert from [lon, lat] to map projection
          zoom: zoom,
        }),
        controls: [],
      });
      
      mapInstanceRef.current = map;
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map. Please refresh and try again.');
      setIsLoading(false);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    // Remove any existing marker layers
    map.getLayers().getArray()
      .filter(layer => layer instanceof VectorLayer)
      .forEach(layer => map.removeLayer(layer));
    
    // Create marker features
    const markerFeatures = markers.map(marker => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(marker.position)),
        id: marker.id,
      });
      
      // Style based on selected state
      const style = new Style({
        image: new Icon({
          src: marker.selected
            ? 'https://cdn.jsdelivr.net/npm/ol-contextmenu@latest/dist/ol-contextmenu.css'
            : 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/build/img/marker-icon.png',
          scale: marker.selected ? 1.2 : 1,
          anchor: [0.5, 1],
        }),
      });
      
      feature.setStyle(style);
      return feature;
    });
    
    // Create vector source and layer
    const vectorSource = new VectorSource({
      features: markerFeatures,
    });
    
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    
    // Add layer to map
    map.addLayer(vectorLayer);
    
    // Add click handler if provided
    if (onMarkerClick) {
      map.on('click', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);
        if (feature) {
          const id = feature.get('id');
          onMarkerClick(id);
        }
      });
    }
  }, [markers, onMarkerClick]);
  
  // Update center and zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    map.getView().animate({
      center: fromLonLat(center),
      zoom: zoom,
      duration: 500,
    });
  }, [center, zoom]);
  
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-destructive mb-3">{error}</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg border shadow-sm overflow-hidden"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}
