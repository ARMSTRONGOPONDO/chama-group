import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { FormInput } from '../components/ui/FormInput';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email: emailOrPhone, phone: emailOrPhone, password });
      login(res.user || res.member || res, res.token || res.accessToken);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.status ?? err.response?.status;
      if (status === 401 || status === 400) {
        setError(err.message || 'Invalid credentials.');
      } else {
        const demoUser = { id: 1, name: emailOrPhone || 'Demo User', role: 'ADMIN' };
        login(demoUser, 'demo-token');
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6]">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Chama Manager</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>
          {error && (
            <Alert type="error" onDismiss={() => setError('')} dismissible className="mb-6">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email or Phone"
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. +254712345678 or email@example.com"
              required
            />
            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
        </Card>
        <p className="text-center text-white/90 text-sm mt-6">
          Demo: Use any credentials when backend is not connected.
        </p>
      </div>
    </div>
  );
}
