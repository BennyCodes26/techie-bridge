
import { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { toast } from "sonner";
import { AuthContextType, UserProfile, UserRole } from './types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add debugging to trace Firebase initialization
  useEffect(() => {
    console.log("AuthProvider initialized");
  }, []);

  async function fetchUserProfile(user: User) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  }

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string, role: UserRole, displayName: string) {
    try {
      console.log("Attempting to create user:", email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", user.uid);
      
      // Create user profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL,
        role: role
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      toast.success('Account created successfully');
      return userProfile;
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(`Failed to create account: ${error.message}`);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(user);
      toast.success('Logged in successfully');
      return user;
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Check if user profile exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new profile if it doesn't exist
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'customer' // Default role for Google sign-ins
        };
        
        await setDoc(userDocRef, newUserProfile);
        setUserProfile(newUserProfile);
        toast.success('Account created with Google');
        return newUserProfile;
      } else {
        const existingProfile = userDoc.data() as UserProfile;
        setUserProfile(existingProfile);
        toast.success('Logged in with Google');
        return existingProfile;
      }
    } catch (error: any) {
      toast.error(`Google login failed: ${error.message}`);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(`Failed to send password reset email: ${error.message}`);
      throw error;
    }
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser) throw new Error('No user is logged in');
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, data, { merge: true });
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    }
  }

  const value = {
    currentUser,
    userProfile,
    isLoading,
    signUp,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
