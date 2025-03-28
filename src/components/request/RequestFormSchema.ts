
import * as z from 'zod';

export const formSchema = z.object({
  deviceType: z.string({ required_error: 'Please select a device type' }),
  deviceBrand: z.string().min(2, { message: 'Please enter the device brand' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500, { message: 'Description must not exceed 500 characters' }),
  location: z.string().min(3, { message: 'Please enter your location' }),
});

export type FormValues = z.infer<typeof formSchema>;
