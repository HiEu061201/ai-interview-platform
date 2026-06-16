import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Type, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/auth/register', {
        username,
        email,
        fullName,
        password
      });
      // Registration successful, navigate to login
      navigate('/login');
    } catch (err: any) {
      console.error("Registration failed", err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neumorph p-6 sm:p-8 rounded-3xl shadow-neumorph animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-neumorph rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neumorph-button text-blue-600">
           <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
           </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Create an Account</h1>
        <p className="text-slate-500 mt-2 text-sm">Sign up for your AI Interview journey</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100/50 rounded-xl border border-red-200">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Type className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              required
              className="w-full pl-11 pr-4 py-3 bg-neumorph border-none rounded-xl shadow-neumorph-inset outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input 
              type="email" 
              required
              className="w-full pl-11 pr-4 py-3 bg-neumorph border-none rounded-xl shadow-neumorph-inset outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              required
              className="w-full pl-11 pr-4 py-3 bg-neumorph border-none rounded-xl shadow-neumorph-inset outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <input 
              type="password" 
              required
              className="w-full pl-11 pr-4 py-3 bg-neumorph border-none rounded-xl shadow-neumorph-inset outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-neumorph text-blue-600 py-3 rounded-xl font-bold transition-all shadow-neumorph-button mt-4 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
        <span className="text-xs text-center text-slate-400 uppercase font-medium">Or</span>
        <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
