import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Target } from 'lucide-react';
import { login, register } from '../services/api';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = isLogin 
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);
      
      localStorage.setItem('user', JSON.stringify(data));
      onAuthSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 sm:p-0">
      {/* The Block */}
      <div className="bg-white w-full max-w-4xl min-h-[600px] flex rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-500">
        
        {/* Left Side: Branding/Intro (Desktop only) */}
        <div className="hidden md:flex flex-1 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[100px] opacity-40"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Target size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">TaskFlow</h1>
            </div>
            
            <h2 className="text-4xl font-black leading-tight mb-6">
              Master your day, one task at a time.
            </h2>
            <p className="text-indigo-100 font-medium text-lg max-w-[300px]">
              Effortless task management designed for high-performance interns.
            </p>
          </div>

          <div className="relative z-10 pt-10 border-t border-indigo-500/50">
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest">
              &copy; 2026 Professional Edition
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-[1.2] p-8 sm:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800">
              {isLogin ? 'Sign In' : 'Get Started'}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {isLogin ? 'Enter your details to access your workspace' : 'Create your free account today'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm font-bold mb-8 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="E.g. John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300 font-semibold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300 font-semibold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300 font-semibold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{isLogin ? 'Login Now' : 'Register Account'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-slate-50">
            <p className="text-slate-400 font-bold text-sm">
              {isLogin ? "No account?" : "Have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 font-black hover:text-indigo-700 transition-colors"
                type="button"
              >
                {isLogin ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
