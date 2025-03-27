
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Google } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { useAuth, UserRole } from '@/contexts/AuthContext';

// Form schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['customer', 'technician'], { message: 'Please select a role' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get default tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [currentTab, setCurrentTab] = useState(defaultTab);
  
  // Redirect path after login/register
  const from = (location.state as any)?.from || '/dashboard';
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer',
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.role as UserRole, data.name);
      navigate(from);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate(from);
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full max-w-md mx-auto"
    >
      <Card className="w-full shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {currentTab === 'login' ? 'Welcome back' : 'Create your account'}
          </CardTitle>
          <CardDescription className="text-center">
            {currentTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Fill out the form below to create your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={defaultTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            autoComplete="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="••••••••" 
                              type={showPassword ? "text" : "password"} 
                              autoComplete="current-password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            autoComplete="name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            autoComplete="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="••••••••" 
                              type={showPassword ? "text" : "password"} 
                              autoComplete="new-password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Account Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div>
                              <RadioGroupItem
                                value="customer"
                                id="customer"
                                className="peer sr-only"
                              />
                              <label
                                htmlFor="customer"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-center font-medium">Customer</span>
                                  <span className="text-xs text-muted-foreground text-center">
                                    I need help with my devices
                                  </span>
                                </div>
                              </label>
                            </div>
                            
                            <div>
                              <RadioGroupItem
                                value="technician"
                                id="technician"
                                className="peer sr-only"
                              />
                              <label
                                htmlFor="technician"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-center font-medium">Technician</span>
                                  <span className="text-xs text-muted-foreground text-center">
                                    I can repair electronic devices
                                  </span>
                                </div>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <Google className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t text-sm text-muted-foreground flex justify-center py-4">
          {currentTab === 'login' ? (
            <div>
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentTab('register')}>
                Sign up
              </Button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentTab('login')}>
                Log in
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
