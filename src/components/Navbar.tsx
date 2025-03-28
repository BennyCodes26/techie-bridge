
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  MessageSquare, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  Settings,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { unreadCount } = useChat();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Watch for scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = currentUser ? (
    userProfile?.role === 'technician' ? [
      { to: '/dashboard', label: 'Dashboard', icon: User },
      { to: '/requests', label: 'Requests', icon: Search },
      { to: '/chat', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    ] : [
      { to: '/dashboard', label: 'Dashboard', icon: User },
      { to: '/discover', label: 'Find Technicians', icon: MapPin },
      { to: '/chat', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    ]
  ) : [];

  // Dynamic navbar styling based on scroll position and route
  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8
    ${isScrolled || currentUser || location.pathname !== '/' 
      ? 'py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm' 
      : 'py-5 bg-transparent'}
  `;

  return (
    <header className={navbarClasses}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="bg-primary/10 text-primary p-2 rounded-xl"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <motion.span 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="text-xl font-semibold text-foreground"
          >
            Fixify
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.to} 
                to={link.to}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="h-5 w-5 flex items-center justify-center p-0 text-xs absolute -top-1 -right-1"
                  >
                    {link.badge > 9 ? '9+' : link.badge}
                  </Badge>
                )}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 h-0.5 w-10 bg-primary"
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth buttons or user menu */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 focus-visible:ring-0 border">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(userProfile?.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1" align="end">
                <div className="p-2 text-sm">
                  <p className="font-medium">{userProfile?.displayName || currentUser.email?.split('@')[0]}</p>
                  <p className="text-muted-foreground text-xs">{userProfile?.role === 'technician' ? 'Technician' : 'Customer'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth?mode=login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden container mx-auto overflow-hidden"
          >
            <div className="py-4 px-4 flex flex-col gap-2 bg-background/95 backdrop-blur-sm rounded-lg mt-2 border">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`p-3 rounded-lg flex items-center gap-3 relative ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {link.badge > 9 ? '9+' : link.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              
              {currentUser && (
                <>
                  <Link
                    to="/profile"
                    className="p-3 rounded-lg flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Profile Settings</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="p-3 rounded-lg flex items-center justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={18} />
                    <span>Log out</span>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
