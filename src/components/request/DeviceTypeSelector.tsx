
import { useState } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Check, Laptop, Smartphone, Tablet, Headphones, Tv, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define device types with their icons for reuse
export const deviceTypes = [
  { id: 'laptop', name: 'Laptop', icon: Laptop },
  { id: 'smartphone', name: 'Smartphone', icon: Smartphone },
  { id: 'tablet', name: 'Tablet', icon: Tablet },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'headphones', name: 'Headphones', icon: Headphones },
  { id: 'desktop', name: 'Desktop', icon: Server },
];

interface DeviceTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DeviceTypeSelector({ value, onChange }: DeviceTypeSelectorProps) {
  return (
    <FormItem className="space-y-3">
      <FormLabel>Device Type</FormLabel>
      <FormControl>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {deviceTypes.map((device) => {
            const Icon = device.icon;
            const isSelected = value === device.id;
            
            return (
              <div key={device.id} className="relative">
                <button
                  type="button"
                  onClick={() => onChange(device.id)}
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
  );
}
