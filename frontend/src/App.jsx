import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Code2, Sparkles, History, Copy, Check, LogOut, Lock, Mail } from 'lucide-react';

export default function App() {
  const apiBase= import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [isLoginView, setIsLoginView] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [prompt, setPrompt] = useState('');
  const [dbType, setDbType] = useState('mongodb');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (token) {
      fetchHistory(token);
    }
  }, [token]);

  const fetchHistory = async (authToken = token) => {
    try {
      const res = await axios.get(`${apiBase}/query/history`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setHistory(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLoginView ? '/auth/login' : '/auth/register';

    try {
      const res = await axios.post(`${apiBase}${endpoint}`, {
        email: authEmail,
        password: authPassword
      });

      const { token: newToken, email } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('userEmail', email);
      setToken(newToken);
      setUserEmail(email);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken('');
    setUserEmail('');
    setHistory([]);
    setResult(null);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        `${apiBase}/query/generate`,
        { prompt, dbType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.error || 'Error generating query.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-600 rounded-xl mb-2">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              QueryCraft
            </h1>
            <p className="text-xs text-slate-400">
              {isLoginView ? 'Sign in to access your personal query builder' : 'Create an account to start building queries'}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-400 text-xs text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition text-sm"
            >
              {isLoginView ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }}
              className="text-indigo-400 hover:underline font-semibold"
            >
              {isLoginView ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                QueryCraft
              </h1>
              <p className="text-xs text-slate-400">AI SQL & MongoDB Query Builder</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 px-3 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleGenerate} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Natural Language Request</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDbType('mongodb')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${dbType === 'mongodb' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    MongoDB
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbType('sql')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${dbType === 'sql' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    SQL
                  </button>
                </div>
              </div>

              <textarea
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Find active users registered in the last 30 days who spent over $100..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Generating Query...' : 'Generate Query'}
              </button>
            </form>

            {result && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-800/50 px-6 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-400">
                    <Code2 className="w-4 h-4" />
                    Generated {result.dbType.toUpperCase()} Query
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.generatedQuery)}
                    className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <pre className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-sm overflow-x-auto border border-slate-800/80">
                    {result.generatedQuery}
                  </pre>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Explanation</h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/40">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit space-y-4">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
              <History className="w-4 h-4 text-indigo-400" />
              Your Saved Queries
            </div>

            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No saved queries yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setResult(item)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/60 rounded-xl cursor-pointer transition border border-slate-800/60"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs uppercase font-bold text-indigo-400">{item.dbType}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.prompt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}