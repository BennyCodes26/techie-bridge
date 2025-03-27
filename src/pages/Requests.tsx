import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  ChevronRight,
  Search,
  Loader2,
  MapPin,
  ArrowUpDown
} from 'lucide-react';

// Sort options
enum SortType {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export default function Requests() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>(SortType.NEWEST);
  
  // Fetch customer requests
  const { data: customerRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['customerRequests', userProfile?.uid],
    queryFn: async () => {
      if (!userProfile?.uid) return [];
      
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef,
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        status: 'pending',
        description: '',
        deviceType: '',
        deviceBrand: '',
        location: '',
        createdAt: { seconds: 0, toDate: () => new Date() },
        ...doc.data(),
      }));
    },
    enabled: !!userProfile && userProfile.role === 'customer',
  });
  
  // Fetch technician service requests
  const { data: technicianRequests, isLoading: isLoadingTechRequests } = useQuery({
    queryKey: ['technicianRequests', userProfile?.uid],
    queryFn: async () => {
      if (!userProfile?.uid || userProfile.role !== 'technician') return [];
      
      // In a real app, we would fetch requests near the technician's location
      // For demo purposes, we'll get all pending requests
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        status: 'pending',
        description: '',
        deviceType: '',
        deviceBrand: '',
        location: '',
        userName: '',
        createdAt: { seconds: 0, toDate: () => new Date() },
        ...doc.data(),
      }));
    },
    enabled: !!userProfile && userProfile.role === 'technician',
  });
  
  // Filter and sort requests
  const filteredRequests = () => {
    const requests = userProfile?.role === 'customer' ? customerRequests : technicianRequests;
    if (!requests) return [];
    
    return requests
      .filter(request => {
        // Filter by status
        if (activeStatus !== 'all' && request.status !== activeStatus) {
          return false;
        }
        
        // Filter by search term
        if (searchTerm && !request.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !request.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !request.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by date
        if (!a.createdAt || !b.createdAt) return 0;
        
        if (sortBy === SortType.NEWEST) {
          return b.createdAt.seconds - a.createdAt.seconds;
        } else {
          return a.createdAt.seconds - b.createdAt.seconds;
        }
      });
  };
  
  const isLoading = userProfile?.role === 'customer' ? isLoadingRequests : isLoadingTechRequests;
  
  return (
    <ProtectedLayout>
      <div className="container max-w-6xl mx-auto p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            {userProfile?.role === 'customer' ? 'Your Service Requests' : 'Available Service Requests'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userProfile?.role === 'customer' 
              ? 'Track and manage your device repair requests' 
              : 'Browse and respond to customer service requests'}
          </p>
        </motion.div>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 items-end justify-between"
          >
            <div className="relative w-full sm:w-auto sm:min-w-[320px]">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-xs flex items-center gap-1"
                onClick={() => setSortBy(sortBy === SortType.NEWEST ? SortType.OLDEST : SortType.NEWEST)}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortBy === SortType.NEWEST ? 'Newest First' : 'Oldest First'}
              </Button>
              
              {userProfile?.role === 'customer' && (
                <Button 
                  className="ml-auto whitespace-nowrap"
                  onClick={() => window.location.href = '/dashboard?tab=new-request'}
                >
                  New Request
                </Button>
              )}
            </div>
          </motion.div>
          
          <Tabs 
            defaultValue="all" 
            onValueChange={setActiveStatus}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </motion.div>
            
            <TabsContent value="all" className="space-y-4">
              {renderRequestsList(isLoading, filteredRequests(), userProfile?.role || 'customer')}
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              {renderRequestsList(isLoading, filteredRequests(), userProfile?.role || 'customer')}
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              {renderRequestsList(isLoading, filteredRequests(), userProfile?.role || 'customer')}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  );
}

function renderRequestsList(isLoading: boolean, requests: any[], userRole: string) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading requests...</span>
      </div>
    );
  }
  
  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No requests found</CardTitle>
          <CardDescription>
            {userRole === 'customer'
              ? 'You have no service requests matching these filters'
              : 'There are no service requests available at the moment'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          {userRole === 'customer' && (
            <Button asChild>
              <a href="/dashboard?tab=new-request">Create New Request</a>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {requests.map((request: any) => (
        <Card key={request.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{request.deviceBrand} {request.deviceType}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{request.location}</span>
                </CardDescription>
              </div>
              <div className={`
                text-xs px-2 py-1 rounded-full font-medium
                ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                  request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}
              `}>
                {request.status === 'pending' ? 'Pending' : 
                 request.status === 'completed' ? 'Completed' : 'Cancelled'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              <p>{request.description}</p>
              <p className="mt-2 text-xs">
                Submitted on: {request.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-2">
            {userRole === 'customer' ? (
              <>
                {request.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    <XCircle className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                )}
                <Button variant="default" size="sm">
                  <ChevronRight className="mr-1 h-4 w-4" />
                  View Details
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <XCircle className="mr-1 h-4 w-4" />
                  Decline
                </Button>
                <Button size="sm">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Contact Customer
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
