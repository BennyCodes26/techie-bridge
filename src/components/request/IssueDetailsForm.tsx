
import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LocationButton } from '@/components/LocationButton';
import { MapPin } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface IssueDetailsFormProps {
  form: UseFormReturn<any>;
  onLocationDetected: (latitude: number, longitude: number, formattedAddress?: string) => void;
}

export function IssueDetailsForm({ form, onLocationDetected }: IssueDetailsFormProps) {
  return (
    <>
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
              <div className="mt-2">
                <LocationButton onLocationDetected={onLocationDetected} className="w-full" />
              </div>
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
    </>
  );
}
