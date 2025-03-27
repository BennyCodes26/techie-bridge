
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Laptop, Smartphone, Tablet, Headphones, Tv, Server, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from "sonner";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const deviceTypes = [
  { id: 'laptop', name: 'Laptop', icon: Laptop },
  { id: 'smartphone', name: 'Smartphone', icon: Smartphone },
  { id: 'tablet', name: 'Tablet', icon: Tablet },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'headphones', name: 'Headphones', icon: Headphones },
  { id: 'desktop', name: 'Desktop', icon: Server },
];

const formSchema = z.object({
  deviceType: z.string({ required_error: 'Please select a device type' }),
  deviceBrand: z.string().min(2, { message: 'Please enter the device brand' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500, { message: 'Description must not exceed 500 characters' }),
  location: z.string().min(3, { message: 'Please enter your location' }),
});

type FormValues = z.infer<typeof formSchema>;

export function RequestForm() {
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
      });
      
      setIsSuccess(true);
      toast.success('Service request submitted successfully');
      
      // Reset the form after 1.5 seconds
      setTimeout(() => {
        form.reset();
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
                <FormItem className="space-y-3">
                  <FormLabel>Device Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {deviceTypes.map((device) => {
                        const Icon = device.icon;
                        const isSelected = field.value === device.id;
                        
                        return (
                          <div key={device.id} className="relative">
                            <button
                              type="button"
                              onClick={() => field.onChange(device.id)}
                              className={`relative w-full p-4 flex flex-col items-center gap-2 rounded-lg border-2 transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary/10 text-primary' 
                                  : 'border-muted bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                              }`}
                            >
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-0.5"
                                  >
                                    <Check className="h-3 w-3" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <Icon className="h-6 w-6" />
                              <span className="text-xs font-medium">{device.name}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="deviceBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Apple, Samsung, Dell" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. Brooklyn, New York" {...field} />
                        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Issue Description
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({field.value.length}/500)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your device issue in detail..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
