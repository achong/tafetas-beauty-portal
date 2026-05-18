import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, ViewName } from '@/types';

interface StudentLoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onSwitchView: (view: ViewName) => void;
}

export function StudentLogin({ users, onLogin, onSwitchView }: StudentLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = users.find(
      (u) => u.username === username && u.password === password && u.role === 'student'
    );
    if (user) {
      onLogin(user);
      onSwitchView('student-dashboard');
    } else {
      alert('Invalid student credentials provided.');
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Student Login</h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your dashboard to manage services and availability
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700 mb-1 block">Username</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-1 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-semibold rounded-xl"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
