import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, Lock, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { sendOTPEmail } from '../utils/emailService';

export default function Register() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') value = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) { 
      setError('Passwords do not match.'); 
      return; 
    }
    
    if (!agreedTerms || !agreedPrivacy) { 
      setError('Please accept both the Terms & Conditions and Privacy Policy.'); 
      return; 
    }
    
    setLoading(true);
    try {
      // 1. Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Send email via EmailJS
      const emailSent = await sendOTPEmail(formData.email, generatedOtp, formData.firstName);
      
      if (!emailSent) {
        throw new Error('Failed to send verification email. Please check your email address and try again.');
      }
      
      // 3. Store pending registration data and OTP in sessionStorage
      sessionStorage.setItem('pendingRegistration', JSON.stringify(formData));
      sessionStorage.setItem('registrationOTP', generatedOtp);
      
      // 4. Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        navigate('/verify-otp');
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', transition: 'var(--transition)' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(ellipse at top, #1a0a00 0%, var(--black) 60%)' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, var(--red), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mac-Christar</div>
          </Link>
          <p style={{ color: 'var(--gray-1)', fontSize: '14px', marginTop: '6px' }}>Nigeria's Premier Electronics Store</p>
        </div>

        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200)', padding: '28px 32px', borderBottom: '1px solid var(--dark-border)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={24} color="var(--primary)" /> Create Account
            </h1>
            <p style={{ color: 'var(--gray-1)', fontSize: '14px', marginTop: '4px' }}>Join Mac-Christar — Premium Electronics Marketplace</p>
          </div>

          <div style={{ padding: '32px' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle size={64} color="var(--success)" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--success)', marginBottom: '8px' }}>OTP Sent!</h3>
                <div style={{ color: 'var(--gray-1)', marginTop: '8px', fontSize: '15px' }}>Giving Quality You Can Always Trust</div>
                <p style={{ color: 'var(--gray-1)', marginBottom: '24px' }}>A verification code has been sent to your email.</p>
                <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'var(--black)', padding: '12px 28px', borderRadius: 'var(--radius-md)', fontWeight: 800 }}>Redirecting...</div>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && <div style={{ background: 'rgba(255,61,0,0.1)', border: '1px solid var(--danger)', color: '#ff8066', fontSize: '13px', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Hassan" style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <div style={{ display: 'flex' }}>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 14px', background: 'rgba(255,94,0,0.1)', border: '1.5px solid var(--primary)', borderRight: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>+234</span>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="800 000 0000" maxLength="11" style={{ ...inputStyle, borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required minLength="6" placeholder="Create a strong password" style={{ ...inputStyle, paddingRight: '48px' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', background: 'none' }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat your password" style={{ ...inputStyle, paddingRight: '48px' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', background: 'none' }}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>✗ Passwords do not match</p>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '6px' }}>✓ Passwords match</p>}
                </div>

                {/* Legal Agreements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'terms', agreed: agreedTerms, setAgreed: setAgreedTerms, label: 'I have read and accept the', link: 'Terms & Conditions', route: '/terms', extra: 'including the No-Return & No-Refund policy.' },
                    { key: 'privacy', agreed: agreedPrivacy, setAgreed: setAgreedPrivacy, label: 'I have read and accept the', link: 'Privacy Policy', route: '/privacy', extra: 'and consent to data processing under Nigerian NDPR.' }
                  ].map(item => (
                    <div key={item.key} onClick={() => !item.agreed && item.setAgreed(true)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', border: `1.5px solid ${item.agreed ? 'var(--success)' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', background: item.agreed ? 'rgba(0,230,118,0.05)' : 'var(--dark)', cursor: 'pointer', transition: 'var(--transition)' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${item.agreed ? 'var(--success)' : 'var(--dark-border)'}`, background: item.agreed ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', transition: 'var(--transition)' }}>
                        {item.agreed && <span style={{ color: 'var(--black)', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--gray-1)', lineHeight: 1.6 }}>
                        {item.label} <Link to={item.route} onClick={e => e.stopPropagation()} style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.link}</Link> {item.extra}
                        {item.agreed && <span style={{ display: 'block', color: 'var(--success)', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>✓ Accepted</span>}
                      </p>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'var(--black)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '15px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition)', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px var(--primary-glow)' }}>
                  {loading ? <><Loader2 className="spinner" size={16} /> Creating Account...</> : <><UserPlus size={16} /> Create My Account</>}
                </button>

                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--dark-border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--gray-1)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign In</Link></p>
                </div>
              </form>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-2)' }}><Lock size={12} color="var(--success)" /> Secure Registration</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-2)' }}><ShieldCheck size={12} color="var(--info)" /> 100% Safe</span>
        </div>
      </div>
    </main>
  );
}
