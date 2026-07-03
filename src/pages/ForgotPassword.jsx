import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Zap, SendHorizonal } from 'lucide-react';

import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send reset email. Please verify your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(ellipse at top, #1a0a00 0%, var(--black) 60%)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/"><div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, var(--red), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mac-Christar</div></Link>
        </div>

        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200)', padding: '28px 32px', borderBottom: '1px solid var(--dark-border)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(255,94,0,0.15)', border: '2px solid var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mail size={28} color="var(--primary)" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--white)' }}>Forgot Password?</h1>
            <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '8px' }}>No worries! Enter your email and we'll send you a reset link.</p>
          </div>

          <div style={{ padding: '32px' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <SendHorizonal size={64} color="var(--success)" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--success)', marginBottom: '8px' }}>Reset Link Sent!</h3>
                <p style={{ color: 'var(--gray-1)', marginBottom: '24px', fontSize: '14px' }}>Check your inbox at <strong style={{ color: 'var(--white)' }}>{email}</strong>.<br/><br/><strong style={{ color: 'var(--warning)', fontSize: '15px' }}>Important: Please check your spam or junk folder just in case!</strong></p>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700 }}><ArrowLeft size={16} /> Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && (
                  <div style={{ background: 'rgba(255,61,0,0.1)', border: '1px solid var(--danger)', color: '#ff8066', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600 }}>
                    {error}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                    style={{ width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
                    onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'var(--black)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px var(--primary-glow)' }}>
                  {loading ? <><Zap size={16} /> Sending...</> : <><SendHorizonal size={16} /> Send Reset Link</>}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-1)', fontSize: '14px', fontWeight: 600 }}><ArrowLeft size={14} /> Back to Login</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
