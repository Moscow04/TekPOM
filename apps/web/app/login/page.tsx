'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.login(email, password) as any;
      setAuthToken(res.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">TekTariq PM</h1>
          <p className="text-gray-500 mt-2">Internal Project Management</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-4">
          <h2 className="text-xl font-semibold">Sign in</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="you@tektariq.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">Default: superadmin@tektariq.com / TeKtArIq2024!</p>
        </form>
      </div>
    </div>
  );
}
