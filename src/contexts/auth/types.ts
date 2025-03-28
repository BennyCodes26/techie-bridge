
import { User } from 'firebase/auth';

export type UserRole = 'customer' | 'technician';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  phoneNumber?: string | null;
  location?: GeoPoint | null;
  certifications?: string[];
  specializations?: string[];
  rating?: number;
  reviews?: number;
  bio?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}
