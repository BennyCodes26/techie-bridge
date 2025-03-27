
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('mode') === 'register' ? 'register' : 'login';
  });
  
  const [selectedRole, setSelectedRole] = useState<'customer' | 'technician'>('customer');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (authMode === 'login') {
        await login(email, password);
        toast({
          title: "Login successful!",
          description: "You are now logged in.",
        });
        navigate('/dashboard');
      } else {
        await signUp(email, password, selectedRole, displayName || email.split('@')[0]);
        toast({
          title: "Registration successful!",
          description: "You are now registered.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      toast({
        title: "Authentication failed.",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Login successful!",
        description: "You are now logged in with Google.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In error:", error.message);
      toast({
        title: "Google Sign-In failed.",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-[380px] shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {authMode === 'login' ? 'Login' : 'Register'}
        </CardTitle>
        <CardDescription className="text-center">
          {authMode === 'login'
            ? 'Enter your email and password to login'
            : 'Create an account to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Tabs defaultValue={authMode} className="w-full">
          <TabsList>
            <TabsTrigger value="login" onClick={() => setAuthMode('login')}>Login</TabsTrigger>
            <TabsTrigger value="register" onClick={() => setAuthMode('register')}>Register</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {authMode === 'register' && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name (optional)</Label>
              <Input 
                id="displayName" 
                type="text" 
                placeholder="How you want to be called" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Account Type</Label>
              <RadioGroup 
                value={selectedRole} 
                onValueChange={(value: 'customer' | 'technician') => setSelectedRole(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">Customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technician" id="technician" />
                  <Label htmlFor="technician">Technician</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        )}
        
        <Button onClick={handleSubmit} disabled={loading}>
          {loading 
            ? <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            : authMode === 'login' ? 'Login' : 'Register'}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-3">
        <div className="relative w-full flex items-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
          <Mail className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardFooter>
    </Card>
  );
}
