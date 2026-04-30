import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useScreenerStore } from '@/lib/store/screenerStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const { login } = useScreenerStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'signin' ? `${API_URL}/auth/signin` : `${API_URL}/auth/signup`;
      const payload = mode === 'signin'
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Authentication failed');
      }

      const data = await response.json();
      setLoading(false);
      setSuccess(true);

      // Store token and user info
      login(data.user.name, data.user.email, data.token);

      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', email: '', password: '' });
        onClose();
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 min-h-screen overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark/80 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg glass-card rounded-[2.5rem] border border-primary/20 shadow-[0_0_50px_rgba(212,165,116,0.15)] overflow-hidden my-auto"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="p-6 sm:p-10">
              {/* Decoration */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-10 p-2 hover:bg-white/5 rounded-lg"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowRight className="text-primary w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
                  <p className="text-white/60 font-mono text-sm">Synchronizing your trading profile...</p>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
                      {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-white/50 text-xs sm:text-sm font-mono uppercase tracking-widest">
                      {mode === 'signin' ? 'Sign in to access portal' : 'Join the elite traders'}
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 flex gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                    >
                      <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                          <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 transition-all focus:bg-white/10"
                            placeholder="John Doe"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 transition-all focus:bg-white/10"
                          placeholder="name@example.com"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                          required
                          type="password"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 transition-all focus:bg-white/10"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-dark font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-accent transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          {mode === 'signin' ? 'Sign In to Portal' : 'Create Pro Account'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center text-xs sm:text-sm text-white/40 font-mono">
                    {mode === 'signin' ? (
                      <>Don't have an account? <button
                        type="button"
                        onClick={() => { setError(null); setMode('signup'); }}
                        className="text-primary hover:text-accent font-bold underline transition-colors disabled:opacity-50"
                        disabled={loading}
                      >Create one</button></>
                    ) : (
                      <>Already have an account? <button
                        type="button"
                        onClick={() => { setError(null); setMode('signin'); }}
                        className="text-primary hover:text-accent font-bold underline transition-colors disabled:opacity-50"
                        disabled={loading}
                      >Sign in</button></>
                    )}
                  </div>
                </>
              )}
            </div>
          </AnimatePresence>
          );
}

