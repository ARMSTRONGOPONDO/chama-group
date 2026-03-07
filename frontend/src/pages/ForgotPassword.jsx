import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FormInput } from '../components/ui/FormInput';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { authApi } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6]">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
            <p className="text-gray-500 mt-1">Enter your email to get a reset link.</p>
          </div>
          {sent ? (
            <Alert type="success">
              If an account exists for this email, you will receive a reset link.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert type="error" onDismiss={() => setError('')} dismissible className="mb-6">
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          )}
          <p className="text-center mt-6">
            <Link to="/login" className="text-[#7C3AED] hover:text-[#6D28D9] font-medium">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
