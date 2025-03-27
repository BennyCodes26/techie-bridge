
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/Layout';
import { ProfileForm } from '@/components/ProfileForm';

export default function Profile() {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <ProtectedLayout>
      <div className="container max-w-4xl mx-auto p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Update your personal information and preferences
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ProfileForm />
        </motion.div>
      </div>
    </ProtectedLayout>
  );
}
