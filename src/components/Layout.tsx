
import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

interface ProtectedLayoutProps {
  children: ReactNode;
  requiredRole?: 'customer' | 'technician' | null;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          className="flex-1 flex flex-col"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export function ProtectedLayout({ children, requiredRole = null }: ProtectedLayoutProps) {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      // Redirect to login if not authenticated
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }

    // Check role requirements if specified
    if (!isLoading && currentUser && requiredRole && userProfile?.role !== requiredRole) {
      navigate('/dashboard');
    }
  }, [currentUser, userProfile, isLoading, navigate, location.pathname, requiredRole]);

  // If still loading or not authenticated, don't render children
  if (isLoading || !currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-primary/30 rounded-full"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
}
