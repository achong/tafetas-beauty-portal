import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import type { User, ViewName } from '@/types';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onSwitchView: (view: ViewName) => void;
}

export function AdminLogin({ onLogin, onSwitchView }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const firebaseUser = userCredential.user;

      // Fetch the user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Admin profile not found');
      }

      const userData = userDoc.data() as User;
      
      // Verify the user is an admin
      if (userData.role !== 'admin') {
        await auth.signOut();
        throw new Error('Access denied: Admin account required');
      }

      // Call the onLogin callback with the user data
      onLogin(userData);
      onSwitchView('admin-dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid username or password');
      } else if (err.code === 'auth/user-not-found') {
        setError('No admin account found with this username');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError(err.message || 'Login failed. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto mt-8">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Secure access to administrative functions
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-foreground mb-1 block">Username (Email)</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@example.com"
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
              disabled={isLoading}
              className="bg-background border-border focus:ring-primary"
            />
          </div>
          <div>
            <Label className="text-sm text-foreground mb-1 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
              disabled={isLoading}
              className="bg-background border-border focus:ring-primary"
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoading || !username || !password}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 font-semibold rounded-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          For security purposes, admin credentials are managed by your system administrator
        </p>
      </div>
    </div>
  );
}
