
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedLayout } from '@/components/Layout';
import { UserProfile } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useChat } from '@/contexts/ChatContext';
import { MessageSquare, Star, MapPin, Award, Shield, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function TechnicianProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sendMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch technician data
  const { data: technician, isLoading: isLoadingTechnician } = useQuery({
    queryKey: ['technician', id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        throw new Error('Technician not found');
      }
    },
  });
  
  // Calculate initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleContactClick = async () => {
    if (!technician) return;
    
    setIsLoading(true);
    try {
      await sendMessage(technician.uid, `Hello, I need help with my device.`);
      toast.success(`Message sent to ${technician.displayName}`);
      navigate('/chat');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedLayout>
      <div className="container max-w-4xl mx-auto p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to results
        </Button>
        
        {isLoadingTechnician ? (
          // Loading state
          <div className="space-y-4">
            <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
          </div>
        ) : !technician ? (
          // Error state
          <Card className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Technician Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The technician profile you're looking for could not be found.
            </p>
            <Button onClick={() => navigate('/discover')}>Back to Discover</Button>
          </Card>
        ) : (
          // Success state - Show technician profile
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
              <CardHeader className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <Avatar className="h-24 w-24 border-2 border-primary/10">
                    <AvatarImage src={technician.photoURL || undefined} alt={technician.displayName || 'Technician'} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(technician.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl font-bold">{technician.displayName || 'Technician'}</h1>
                    
                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                      {technician.specializations?.map((spec, i) => (
                        <Badge key={i} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 text-muted-foreground justify-center md:justify-start">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                        <span className="font-medium">{technician.rating || 5.0}</span>
                        <span className="text-xs ml-1">({technician.reviews || 0} reviews)</span>
                      </div>
                      
                      <span>•</span>
                      
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        <span>Verified</span>
                      </div>
                      
                      {technician.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>Located in New York</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto mt-4 md:mt-0">
                    <Button 
                      onClick={handleContactClick}
                      disabled={isLoading}
                      className="w-full md:w-auto"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isLoading ? 'Sending...' : 'Contact'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 space-y-6">
                {technician.certifications && technician.certifications.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Certifications</h2>
                    <div className="flex flex-wrap gap-2">
                      {technician.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-1 bg-primary/5 text-primary px-3 py-1.5 rounded-full">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">About</h2>
                  <p className="text-muted-foreground">
                    {technician.bio || 'This technician has not added a bio yet.'}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Email: {technician.email || 'Not provided'}</p>
                    <p>Phone: {technician.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </ProtectedLayout>
  );
}
