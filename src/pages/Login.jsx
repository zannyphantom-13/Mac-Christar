import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, Lock, Zap, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigate only after the user context is fully populated (including isAdmin)
  React.useEffect(() => {
    if (isLoggingIn && user) {
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(user.isAdmin ? '/admin' : '/');
      }
    }
  }, [user, isLoggingIn, navigate, location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Set flag to trigger navigation once AppContext has fetched user document
      setIsLoggingIn(true);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(ellipse at top, #1a0a00 0%, var(--black) 60%)' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, var(--red), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mac-Christar
            </div>
          </Link>
          <p style={{ color: 'var(--gray-1)', fontSize: '15px', marginTop: '6px' }}>Giving Quality You Can Always Trust</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          
          {/* Card Header */}
          <div style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200)', padding: '28px 32px', borderBottom: '1px solid var(--dark-border)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogIn size={24} color="var(--primary)" /> Welcome Back
            </h1>
            <p style={{ color: 'var(--gray-1)', fontSize: '14px', marginTop: '4px' }}>Sign in to your account</p>
          </div>

          {/* Card Body */}
          <div style={{ padding: '32px' }}>
            {error && (
              <div style={{ background: 'rgba(255, 61, 0, 0.1)', border: '1px solid var(--danger)', color: '#ff8066', fontSize: '13px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  style={{ width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', transition: 'var(--transition)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Forgot Password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    style={{ width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 48px 12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', transition: 'var(--transition)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'var(--black)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '15px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition)', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px var(--primary-glow)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 className="spinner" size={16} /> Signing In...</> : <><LogIn size={16} /> Sign In to Account</>}
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--dark-border)', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--gray-1)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create Account</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-2)' }}><Lock size={12} color="var(--success)" /> Secure Login</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-2)' }}><ShieldCheck size={12} color="var(--info)" /> 100% Safe</span>
        </div>
      </div>
    </main>
  );
}
