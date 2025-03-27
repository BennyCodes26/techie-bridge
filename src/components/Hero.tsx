
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Laptop, Smartphone, Tablet, Settings, Tool, Server, ChevronRight } from 'lucide-react';

const devices = [
  { name: 'Laptop', icon: Laptop, delay: 0.2 },
  { name: 'Smartphone', icon: Smartphone, delay: 0.3 },
  { name: 'Tablet', icon: Tablet, delay: 0.4 },
  { name: 'Desktop', icon: Server, delay: 0.5 },
  { name: 'Accessories', icon: Settings, delay: 0.6 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 12,
    },
  },
};

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Automatic cycling through highlight words
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % highlightWords.length);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const highlightWords = ['faster', 'simpler', 'reliable', 'efficient'];
  
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 bg-primary/20 w-72 h-72 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/3 bg-blue-400/20 w-60 h-60 rounded-full blur-3xl opacity-40" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground"
            >
              Tech repair just got{' '}
              <span className="relative inline-block">
                <span className="text-primary relative z-10">
                  {highlightWords[currentIndex]}
                </span>
                <motion.span 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute bottom-0 left-0 h-3 bg-primary/20 z-0"
                />
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mt-6 text-lg text-muted-foreground max-w-xl"
            >
              Connect with skilled technicians in your area to fix your electronic devices. 
              Fast, reliable service just a few clicks away.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Button asChild size="lg" className="text-md font-medium px-6">
                <Link to="/auth?mode=register">Get Started <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-md font-medium px-6">
                <Link to="/discover">Find Technicians</Link>
              </Button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-12"
            >
              <p className="text-sm text-muted-foreground mb-3">Expert repair for all your devices</p>
              <div className="flex flex-wrap gap-3">
                {devices.map((device, index) => (
                  <motion.div
                    key={device.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: device.delay, duration: 0.5 }}
                    className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-full text-sm"
                  >
                    <device.icon className="h-4 w-4" />
                    <span>{device.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden md:block"
          >
            <div className="relative bg-gradient-to-tr from-card to-secondary rounded-2xl border shadow-xl p-6 z-10">
              <div className="absolute -right-3 -top-3 bg-primary rounded-full p-3 shadow-lg">
                <Tool className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Service Request</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Device Type</label>
                  <div className="h-10 bg-muted/50 rounded-md"></div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Issue Description</label>
                  <div className="h-20 bg-muted/50 rounded-md"></div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Your Location</label>
                  <div className="h-10 bg-muted/50 rounded-md"></div>
                </div>
                
                <div className="h-10 w-full bg-primary/80 rounded-md"></div>
              </div>
            </div>
            
            <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-2xl border shadow-xl p-4 w-48 z-20">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex-shrink-0"></div>
                <div>
                  <div className="h-4 w-24 bg-muted/50 rounded-full mb-1"></div>
                  <div className="h-3 w-16 bg-muted/40 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted/50 rounded-full"></div>
                <div className="h-3 w-5/6 bg-muted/50 rounded-full"></div>
                <div className="h-3 w-4/6 bg-muted/50 rounded-full"></div>
              </div>
            </div>
            
            <div className="absolute -bottom-8 left-12 bg-card/80 backdrop-blur-sm rounded-2xl border shadow-xl p-4 w-40 z-0">
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 w-6 rounded-full bg-green-500/20"></div>
                <div className="h-3 w-16 bg-muted/50 rounded-full"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted/50 rounded-full"></div>
                <div className="h-3 w-4/6 bg-muted/50 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
