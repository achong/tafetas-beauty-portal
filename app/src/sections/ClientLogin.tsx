// app/src/sections/ClientLogin.tsx
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, UserPlus, LogIn } from 'lucide-react';

interface ClientLoginProps {
  onSwitchView: (view: any) => void;
}

export function ClientLogin({ onSwitchView }: ClientLoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'clients', userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          created_at: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSwitchView('client-dashboard');
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto mt-10">
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isRegister ? 'Create Client Account' : 'Client Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label className="text-sm text-foreground mb-1 block">Full Name</Label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required className="bg-background border-border text-foreground" />
              </div>
            )}
            <div>
              <Label className="text-sm text-foreground mb-1 block">Email Address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" required className="bg-background border-border text-foreground" />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-background border-border text-foreground" />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Processing...' : isRegister ? <><UserPlus className="w-4 h-4 mr-2" /> Register</> : <><LogIn className="w-4 h-4 mr-2" /> Login</>}
            </Button>

            <Button type="button" variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Button>
            
            <Button type="button" variant="outline" className="w-full border-border text-foreground" onClick={() => onSwitchView('catalog')}>
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}