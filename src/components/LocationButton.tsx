
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LocationButtonProps {
  onLocationDetected: (latitude: number, longitude: number, formattedAddress?: string) => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function LocationButton({ onLocationDetected, className, variant = 'outline' }: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const getLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Attempt to get address from coordinates using reverse geocoding API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            // Format the address
            let formattedAddress = '';
            if (data && data.display_name) {
              // Simplified address format
              const address = data.address;
              const parts = [];
              
              if (address.road) parts.push(address.road);
              if (address.city || address.town || address.village) {
                parts.push(address.city || address.town || address.village);
              }
              if (address.state) parts.push(address.state);
              if (address.postcode) parts.push(address.postcode);
              
              formattedAddress = parts.join(', ');
            }
            
            onLocationDetected(latitude, longitude, formattedAddress);
            toast.success('Location detected successfully');
          } catch (error) {
            // If geocoding fails, just pass coordinates
            console.error('Error getting address:', error);
            onLocationDetected(latitude, longitude);
            toast.success('Location coordinates detected');
          }
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('An unknown error occurred');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={getLocation}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Detecting...
        </>
      ) : (
        <>
          <MapPin className="mr-2 h-4 w-4" />
          Use Current Location
        </>
      )}
    </Button>
  );
}
