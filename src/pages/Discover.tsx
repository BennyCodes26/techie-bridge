
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/Layout';
import { TechnicianCard, TechnicianCardSkeleton } from '@/components/TechnicianCard';
import { MapView } from '@/components/MapView';
import { LocationButton } from '@/components/LocationButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, SearchIcon, MapPin } from 'lucide-react';

export default function Discover() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [location, setLocation] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Fetch technicians
  const { data: technicians, isLoading, refetch } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const techRef = collection(db, 'users');
      const q = query(techRef, where('role', '==', 'technician'));
      const querySnapshot = await getDocs(q);
      
      // Transform data and add mock distance
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as UserProfile;
        return {
          ...data,
          distance: `${(Math.random() * 5).toFixed(1)} miles away` // Mock distance
        };
      });
    },
  });
  
  // Handle location detection
  const handleLocationDetected = (latitude: number, longitude: number, formattedAddress?: string) => {
    setUserCoordinates({ latitude, longitude });
    if (formattedAddress) {
      setLocation(formattedAddress);
    }
  };
  
  // Filter technicians based on search term and specialty
  const filteredTechnicians = technicians?.filter(tech => {
    const matchesSearch = searchTerm === '' || 
      (tech.displayName && tech.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = specialty === 'all' || 
      (tech.specializations && tech.specializations.includes(specialty));
    
    return matchesSearch && matchesSpecialty;
  });
  
  // Handle search submission
  const handleSearch = () => {
    setIsSearching(true);
    refetch().then(() => {
      setIsSearching(false);
    });
  };
  
  return (
    <ProtectedLayout requiredRole="customer">
      <div className="container max-w-7xl mx-auto p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">Find Technicians</h1>
          <p className="text-muted-foreground mt-1">
            Discover skilled technicians in your area to fix your devices
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-lg border shadow-sm p-4"
            >
              <h2 className="font-semibold text-lg mb-4">Search Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Search by name
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Search technicians..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-8"
                    />
                    <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Specialization
                  </label>
                  <Select
                    value={specialty}
                    onValueChange={setSpecialty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specializations</SelectItem>
                      <SelectItem value="iPhone Repair">iPhone Repair</SelectItem>
                      <SelectItem value="Laptop Repair">Laptop Repair</SelectItem>
                      <SelectItem value="Screen Replacement">Screen Replacement</SelectItem>
                      <SelectItem value="Battery Replacement">Battery Replacement</SelectItem>
                      <SelectItem value="Data Recovery">Data Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Your Location
                  </label>
                  <div className="relative mb-2">
                    <Input
                      placeholder="Enter your location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pr-8"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <LocationButton 
                    onLocationDetected={handleLocationDetected}
                    className="w-full mb-2" 
                    variant="outline"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-lg border shadow-sm overflow-hidden"
            >
              <div className="h-[300px]">
                <MapView 
                  center={userCoordinates ? [userCoordinates.longitude, userCoordinates.latitude] : undefined}
                  zoom={userCoordinates ? 14 : 12}
                />
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <h2 className="font-semibold text-lg mb-4">
              {isLoading ? 'Loading technicians...' : (
                filteredTechnicians && filteredTechnicians.length > 0
                  ? `${filteredTechnicians.length} Technicians Available`
                  : 'No technicians found'
              )}
            </h2>
            
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                [...Array(3)].map((_, i) => (
                  <TechnicianCardSkeleton key={i} />
                ))
              ) : filteredTechnicians && filteredTechnicians.length > 0 ? (
                // Technician list
                filteredTechnicians.map((technician) => (
                  <TechnicianCard key={technician.uid} technician={technician} />
                ))
              ) : (
                // No results
                <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <SearchIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No technicians found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters or location to find more technicians
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
