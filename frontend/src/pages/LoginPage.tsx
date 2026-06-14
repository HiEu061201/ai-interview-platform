import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Github } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}` + '/auth/login', {
        username,
        password
      });
      console.log('Login Success:', res.data);
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      navigate('/interviews/new');
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.response?.data?.message || 'Invalid username or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) return;
      
      // Call Backend API
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}` + '/auth/google', {
        idToken: credential
      });
      
      console.log('Google Login Success response:', res);
      console.log('res.data:', res.data);
      console.log('res.data.accessToken:', res.data.accessToken);
      
      if (res.data && res.data.accessToken) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        navigate('/interviews/new');
      } else {
        console.error('Token is missing in response!');
        alert('Lỗi đăng nhập: Backend không trả về token!');
      }
    } catch (error) {
      console.error("Backend Google login failed", error);
    }
  };

  return (
    <div className="bg-neumorph p-8 rounded-3xl shadow-neumorph animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-neumorph rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neumorph-button text-blue-600">
           <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19 12c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7z" strokeDasharray="4 4"></path>
              </svg>
           </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
        <p className="text-slate-500 mt-2 text-sm">Sign in to your AI Interview account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100/50 rounded-xl border border-red-200">
            {error}
          </div>
        )}
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <a href="#" className="text-xs text-blue-600 font-medium hover:underline">Forgot password?</a>
          </div>
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
          className="w-full flex items-center justify-center gap-2 bg-neumorph text-blue-600 py-3 rounded-xl font-bold transition-all shadow-neumorph-button mt-2"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
        <span className="text-xs text-center text-slate-400 uppercase font-medium">Or continue with</span>
        <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 items-center">
        <div className="flex justify-center overflow-hidden h-[42px] rounded-xl shadow-neumorph-button bg-neumorph">
           <GoogleLogin
             onSuccess={handleGoogleSuccess}
             onError={() => console.error('Login Failed')}
             useOneTap
             shape="rectangular"
             size="large"
           />
        </div>
        <button type="button" className="flex items-center justify-center gap-2 h-[42px] bg-neumorph rounded-xl text-slate-700 font-medium shadow-neumorph-button">
          <Github className="w-5 h-5" />
          GitHub
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
