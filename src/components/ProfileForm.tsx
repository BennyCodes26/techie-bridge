
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, Plus } from 'lucide-react';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Different schemas for customer and technician
const customerSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
});

const technicianSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, { message: 'Bio must not exceed 500 characters' }).optional(),
  certifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type TechnicianFormValues = z.infer<typeof technicianSchema>;

export function ProfileForm() {
  const { userProfile, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(userProfile?.photoURL || null);
  
  // For specializations and certifications inputs
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  
  // Set up the form based on user role
  const form = useForm<CustomerFormValues | TechnicianFormValues>({
    resolver: zodResolver(
      userProfile?.role === 'technician' ? technicianSchema : customerSchema
    ),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      phoneNumber: userProfile?.phoneNumber || '',
      location: userProfile?.location ? `${userProfile.location.latitude}, ${userProfile.location.longitude}` : '',
      ...(userProfile?.role === 'technician' ? {
        bio: '', // We would get this from Firestore in a real app
        certifications: userProfile?.certifications || [],
        specializations: userProfile?.specializations || [],
      } : {}),
    },
  });
  
  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;
    
    // Validate file type and size
    if (!file.type.includes('image')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image size should be less than 2MB');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a reference to the storage location
    const storageRef = ref(storage, `profile_images/${userProfile.uid}`);
    
    // Upload the file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        setIsUploading(false);
      },
      async () => {
        // Upload completed successfully, now get the download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          
          // Update user profile with new photo URL
          await updateUserProfile({ photoURL: downloadURL });
          toast.success('Profile picture updated');
        } catch (error) {
          console.error('Error getting download URL:', error);
          toast.error('Failed to update profile picture');
        } finally {
          setIsUploading(false);
        }
      }
    );
  };
  
  // Add a specialization
  const addSpecialization = () => {
    if (!newSpecialization.trim()) return;
    
    const currentSpecializations = form.getValues('specializations') as string[] || [];
    
    if (currentSpecializations.includes(newSpecialization.trim())) {
      toast.error('This specialization already exists');
      return;
    }
    
    form.setValue('specializations', [...currentSpecializations, newSpecialization.trim()]);
    setNewSpecialization('');
  };
  
  // Remove a specialization
  const removeSpecialization = (index: number) => {
    const currentSpecializations = form.getValues('specializations') as string[] || [];
    form.setValue(
      'specializations',
      currentSpecializations.filter((_, i) => i !== index)
    );
  };
  
  // Add a certification
  const addCertification = () => {
    if (!newCertification.trim()) return;
    
    const currentCertifications = form.getValues('certifications') as string[] || [];
    
    if (currentCertifications.includes(newCertification.trim())) {
      toast.error('This certification already exists');
      return;
    }
    
    form.setValue('certifications', [...currentCertifications, newCertification.trim()]);
    setNewCertification('');
  };
  
  // Remove a certification
  const removeCertification = (index: number) => {
    const currentCertifications = form.getValues('certifications') as string[] || [];
    form.setValue(
      'certifications',
      currentCertifications.filter((_, i) => i !== index)
    );
  };
  
  // Handle form submission
  const onSubmit = async (data: CustomerFormValues | TechnicianFormValues) => {
    if (!userProfile) return;
    
    setIsSubmitting(true);
    
    try {
      // Parse location if provided
      let locationData = undefined;
      if (data.location) {
        const [lat, lng] = data.location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          locationData = { latitude: lat, longitude: lng };
        }
      }
      
      // Prepare update data
      const updateData: Partial<UserProfile> = {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || null,
        ...(locationData && { location: locationData }),
      };
      
      // Add technician-specific fields if applicable
      if (userProfile.role === 'technician' && 'specializations' in data) {
        updateData.specializations = data.specializations || [];
        updateData.certifications = (data as TechnicianFormValues).certifications || [];
        // We would also update bio in a real app
      }
      
      await updateUserProfile(updateData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userProfile?.displayName) return 'U';
    return userProfile.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      {/* Profile image */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={imageUrl || undefined} alt={userProfile?.displayName || 'Profile'} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2">
            <label 
              htmlFor="profileImage" 
              className="rounded-full bg-primary text-primary-foreground p-2 cursor-pointer shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <input 
                type="file" 
                id="profileImage" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Upload a clear photo to help customers recognize you
          </p>
          
          {isUploading && (
            <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used for service requests communication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Latitude, Longitude (e.g., 40.7128, -74.0060)" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This helps us connect you with nearby technicians or customers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Technician-specific fields */}
          {userProfile?.role === 'technician' && (
            <>
              <FormField
                control={form.control}
                name="specializations"
                render={() => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch('specializations')?.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {spec}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 -mr-1 hover:bg-transparent"
                            onClick={() => removeSpecialization(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a specialization (e.g., iPhone Repair)"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSpecialization}
                        disabled={!newSpecialization.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <FormDescription>
                      Add your areas of expertise to attract relevant customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="certifications"
                render={() => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch('certifications')?.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                          {cert}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 -mr-1 hover:bg-transparent"
                            onClick={() => removeCertification(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a certification (e.g., Apple Certified Technician)"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCertification}
                        disabled={!newCertification.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <FormDescription>
                      List professional certifications to build trust with customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
