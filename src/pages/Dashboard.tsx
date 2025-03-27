import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/Layout';
import { RequestForm } from '@/components/RequestForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  PlusCircle, 
  Wrench, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Loader2,
  User,
  MapPin
} from 'lucide-react';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  const { data: technicianRequests, isLoading: isLoadingTechRequests } = useQuery({
    queryKey: ['technicianRequests', userProfile?.uid],
    queryFn: async () => {
      if (!userProfile?.uid || userProfile.role !== 'technician') return [];
      
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(5)
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
  
  const { data: recentMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['recentMessages', userProfile?.uid],
    queryFn: async () => {
      if (!userProfile?.uid) return [];
      
      return [];
    },
    enabled: !!userProfile,
  });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };
  
  return (
    <ProtectedLayout>
      <div className="container max-w-7xl mx-auto p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {userProfile?.displayName || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userProfile?.role === 'customer'
              ? 'Manage your service requests and find skilled technicians'
              : 'View service requests and connect with customers'}
          </p>
        </motion.div>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {userProfile?.role === 'customer' ? (
              <TabsTrigger value="new-request">New Request</TabsTrigger>
            ) : (
              <TabsTrigger value="available-requests">Available Requests</TabsTrigger>
            )}
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {userProfile?.role === 'customer' ? 'Active Requests' : 'Pending Requests'}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingRequests || isLoadingTechRequests ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : userProfile?.role === 'customer' ? (
                        customerRequests?.filter(r => r.status === 'pending').length || 0
                      ) : (
                        technicianRequests?.length || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.role === 'customer'
                        ? 'Open service requests'
                        : 'Requests waiting for your response'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingRequests ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        customerRequests?.filter(r => r.status === 'completed').length || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Successfully completed requests
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      New Messages
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingMessages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        recentMessages?.length || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unread messages in your inbox
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Profile Status
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium text-amber-500">
                      {userProfile?.location ? 'Complete' : 'Incomplete'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.location 
                        ? 'Your profile is complete' 
                        : 'Add your location for better matches'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                
                {userProfile?.role === 'customer' ? (
                  <div className="space-y-4">
                    {isLoadingRequests ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading your requests...</span>
                      </div>
                    ) : customerRequests && customerRequests.length > 0 ? (
                      customerRequests.slice(0, 3).map((request: any) => (
                        <Card key={request.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{request.deviceBrand} {request.deviceType}</CardTitle>
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
                            <p className="text-sm truncate">
                              {request.description}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-end pt-0">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/request/${request.id}`}>View Details</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>No service requests yet</CardTitle>
                          <CardDescription>
                            Submit your first device repair request to get started
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button 
                            onClick={() => setActiveTab('new-request')}
                            className="w-full sm:w-auto"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Request
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                    
                    {customerRequests && customerRequests.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" asChild>
                          <Link to="/requests">View All Requests</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isLoadingTechRequests ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading service requests...</span>
                      </div>
                    ) : technicianRequests && technicianRequests.length > 0 ? (
                      technicianRequests.slice(0, 3).map((request: any) => (
                        <Card key={request.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{request.deviceBrand} {request.deviceType}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{request.location}</span>
                                </CardDescription>
                              </div>
                              <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                                New Request
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm truncate">
                              {request.description}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2 pt-0">
                            <Button variant="outline" size="sm">
                              Decline
                            </Button>
                            <Button size="sm">
                              Contact Customer
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>No available requests</CardTitle>
                          <CardDescription>
                            There are no service requests in your area at the moment
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button 
                            onClick={() => setActiveTab('available-requests')}
                            className="w-full sm:w-auto"
                          >
                            <Wrench className="mr-2 h-4 w-4" />
                            View Available Requests
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                    
                    {technicianRequests && technicianRequests.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" asChild>
                          <Link to="/requests">View All Requests</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </TabsContent>
          
          {userProfile?.role === 'customer' && (
            <TabsContent value="new-request">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <RequestForm />
              </motion.div>
            </TabsContent>
          )}
          
          {userProfile?.role === 'technician' && (
            <TabsContent value="available-requests">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Available Service Requests</CardTitle>
                    <CardDescription>
                      Browse and respond to service requests in your area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingTechRequests ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading service requests...</span>
                        </div>
                      ) : technicianRequests && technicianRequests.length > 0 ? (
                        technicianRequests.map((request: any) => (
                          <Card key={request.id} className="overflow-hidden">
                            <CardHeader className="pb-2 bg-muted/30">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{request.deviceBrand} {request.deviceType}</CardTitle>
                                  <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{request.location}</span>
                                  </CardDescription>
                                </div>
                                <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                                  New Request
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="py-3">
                              <p className="text-sm">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{request.userName || 'Anonymous User'}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 bg-muted/30 py-3">
                              <Button variant="outline" size="sm">
                                <XCircle className="mr-1 h-4 w-4" />
                                Decline
                              </Button>
                              <Button size="sm">
                                <MessageSquare className="mr-1 h-4 w-4" />
                                Contact Customer
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                            <Wrench className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">No available requests</h3>
                          <p className="text-muted-foreground">
                            There are no service requests in your area at the moment. 
                            Check back later or update your service area in your profile.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}
          
          <TabsContent value="messages">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>
                    Your recent conversations with customers and technicians
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                    <p className="text-muted-foreground">
                      {userProfile?.role === 'customer'
                        ? 'Contact a technician to start a conversation'
                        : 'Respond to service requests to start chatting with customers'}
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to="/chat">Go to Messages</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
