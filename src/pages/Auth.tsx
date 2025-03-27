
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
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
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <AuthForm />
      </main>
    </Layout>
  );
}
