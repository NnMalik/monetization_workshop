import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, User, Lock, Users, Crown } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onLogin: (sessionId: string, role: string, username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.sessionId, data.role, data.username);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'facilitator' | 'participant') => {
    if (role === 'facilitator') {
      setUsername('admin');
      setPassword('workshop2024');
    } else {
      setUsername('participant1');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">API Defense Workshop</h1>
            <p className="text-muted-foreground">Secure your access to continue</p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Workshop Login</CardTitle>
            <CardDescription>
              Enter your credentials to join the API monetization defense training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Access Workshop'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              🎯 Demo Access
            </CardTitle>
            <CardDescription className="text-amber-700">
              Quick access for workshop demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => fillDemoCredentials('facilitator')}
                className="flex items-center gap-2 border-purple-200 hover:bg-purple-50"
              >
                <Crown className="w-4 h-4 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-purple-600">Facilitator</div>
                  <div className="text-xs text-purple-500">Admin Access</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fillDemoCredentials('participant')}
                className="flex items-center gap-2 border-blue-200 hover:bg-blue-50"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-blue-600">Participant</div>
                  <div className="text-xs text-blue-500">Player Access</div>
                </div>
              </Button>
            </div> */}
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• <strong>Facilitator:</strong> Can start simulations & view all scores</div>
              <div>• <strong>Participant:</strong> Can play defense games & view dashboard</div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          🛡️ This workshop teaches real-world API security concepts through interactive scenarios
        </div>
      </div>
    </div>
  );
}