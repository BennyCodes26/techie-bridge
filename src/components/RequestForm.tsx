
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Import our refactored components
import { DeviceTypeSelector } from './request/DeviceTypeSelector';
import { IssueDetailsForm } from './request/IssueDetailsForm';
import { formSchema, FormValues } from './request/RequestFormSchema';

export function RequestForm() {
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const queryClient = useQueryClient();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceType: '',
      deviceBrand: '',
      description: '',
      location: '',
    },
  });
  
  // Handle location detection
  const handleLocationDetected = (latitude: number, longitude: number, formattedAddress?: string) => {
    setCoordinates({ latitude, longitude });
    if (formattedAddress) {
      form.setValue('location', formattedAddress);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!userProfile) {
      toast.error('You must be logged in to submit a request');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the request to Firestore
      await addDoc(collection(db, 'requests'), {
        ...data,
        userId: userProfile.uid,
        userName: userProfile.displayName,
        userEmail: userProfile.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        coordinates: coordinates ? new GeoPoint(coordinates.latitude, coordinates.longitude) : null,
      });
      
      setIsSuccess(true);
      toast.success('Service request submitted successfully');
      
      // Immediately invalidate and refetch the customerRequests query to update the counter properly
      queryClient.invalidateQueries({ queryKey: ['customerRequests', userProfile.uid] });
      
      // Force a refetch of the dashboard data after a short delay to ensure the counter updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['customerRequests', userProfile.uid] });
      }, 500);
      
      // Reset the form after 1.5 seconds
      setTimeout(() => {
        form.reset();
        setCoordinates(null);
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Submit a Service Request</CardTitle>
        <CardDescription>
          Tell us about your device issue and we'll connect you with a skilled technician
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }) => (
                <DeviceTypeSelector 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
            
            <IssueDetailsForm 
              form={form} 
              onLocationDetected={handleLocationDetected} 
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : isSuccess ? 'Request Submitted!' : 'Submit Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
