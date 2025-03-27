
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Hero } from '@/components/Hero';
import { useAuth } from '@/contexts/AuthContext';
import { Laptop, Smartphone, Clock, Shield, CheckCircle, Tool } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Any Device',
    description: 'From smartphones to laptops, our technicians can fix a wide variety of electronic devices.'
  },
  {
    icon: Clock,
    title: 'Fast Repairs',
    description: 'Connect with skilled technicians for rapid service when you need it most.'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data and communication are protected with industry-standard security.'
  },
  {
    icon: CheckCircle,
    title: 'Verified Experts',
    description: 'All technicians on our platform are verified with ratings and reviews.'
  },
  {
    icon: Tool,
    title: 'Quality Service',
    description: 'Get professional diagnostics and repairs from certified technicians.'
  },
  {
    icon: Laptop,
    title: 'Multiple Specializations',
    description: 'Find technicians specialized in the specific type of repair you need.'
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Index() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  return (
    <Layout>
      <main className="flex-1">
        <Hero />
        
        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything you need for device repair
              </h2>
              <p className="text-muted-foreground text-lg">
                Fixify connects you with skilled technicians to get your devices repaired quickly and efficiently.
              </p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                
                return (
                  <motion.div 
                    key={index}
                    variants={fadeInUp}
                    className="bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                How Fixify Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Get your devices fixed in just a few simple steps
              </p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              {/* Connect lines between steps (hidden on mobile) */}
              <div className="hidden md:block absolute top-1/3 left-1/6 w-2/3 h-0.5 bg-muted" />
              
              {/* Step 1 */}
              <motion.div 
                variants={fadeInUp}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 relative z-10">
                    1
                  </div>
                  <h3 className="text-xl font-medium mb-2">Submit a Request</h3>
                  <p className="text-muted-foreground">
                    Describe your device issue and location to find available technicians
                  </p>
                </div>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                variants={fadeInUp}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 relative z-10">
                    2
                  </div>
                  <h3 className="text-xl font-medium mb-2">Connect with Technicians</h3>
                  <p className="text-muted-foreground">
                    Browse profiles, reviews, and specializations to find the right expert
                  </p>
                </div>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                variants={fadeInUp}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 relative z-10">
                    3
                  </div>
                  <h3 className="text-xl font-medium mb-2">Get Your Device Fixed</h3>
                  <p className="text-muted-foreground">
                    Communicate with the technician and get your device repaired
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-muted/30 border-t py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary p-2 rounded-xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xl font-semibold">Fixify</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Connecting customers with skilled technicians
                </p>
              </div>
              
              <div className="flex gap-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Fixify. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </Layout>
  );
}
