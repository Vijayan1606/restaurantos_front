import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChefHat, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const demoRoles = ['owner', 'manager', 'chef', 'waiter', 'cashier', 'store_manager'];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@restaurantos.demo');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-white">
      {/* animated blobs */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-300/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-300/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-glow-lg"
          >
            <ChefHat size={28} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-extrabold gradient-text">RestaurantOS</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Restaurant Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="card animate-slide-up space-y-4">
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
              {error}
            </motion.p>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input !pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Password</label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="input !pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in...' : (<>Sign in <ArrowRight size={16} /></>)}
          </motion.button>
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Demo accounts (password: <span className="font-mono">Password123!</span>):<br />
            {demoRoles.map((r) => `${r}@restaurantos.demo`).join(' · ')}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
