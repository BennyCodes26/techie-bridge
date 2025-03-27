
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, MapPin, Shield, Award, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { toast } from 'sonner';

interface TechnicianCardProps {
  technician: UserProfile & {
    distance?: string; // Distance from user, e.g. "0.5 miles"
  };
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  const navigate = useNavigate();
  const { sendMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleContactClick = async () => {
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

  // Calculate display name or fallback
  const displayName = technician.displayName || 'Technician';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={technician.photoURL || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium text-lg">{displayName}</h3>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{technician.distance || 'Location not available'}</span>
                </CardDescription>
              </div>
            </div>
            
            <div className="flex gap-1 items-center">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{technician.rating || 5.0}</span>
              <span className="text-muted-foreground text-xs">({technician.reviews || 0})</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          {technician.specializations && technician.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {technician.specializations.map((spec, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Verified</span>
            </div>
            
            {technician.certifications && technician.certifications.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{technician.certifications.length} certification{technician.certifications.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t bg-muted/30 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full mr-2"
            onClick={() => navigate(`/technician/${technician.uid}`)}
          >
            View Profile
          </Button>
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={handleContactClick}
            disabled={isLoading}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {isLoading ? 'Connecting...' : 'Contact'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function TechnicianCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
            <div>
              <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded mt-2 animate-pulse"></div>
            </div>
          </div>
          <div className="h-5 w-14 bg-muted rounded animate-pulse"></div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t bg-muted/30 flex justify-between">
        <div className="h-9 w-full mr-2 bg-muted rounded animate-pulse"></div>
        <div className="h-9 w-full bg-muted rounded animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}
