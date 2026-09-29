'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm"
      >
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Akses Terbatas</p>
        <h1 className="text-xl font-bold text-slate-900 mb-6">Masuk ke Panel Admin</h1>

        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />

        {error && (
          <p className="text-xs text-red-600 font-medium mb-4">Password salah, coba lagi.</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-50 ${error ? 'mt-2' : 'mt-4'}`}
        >
          {loading ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}