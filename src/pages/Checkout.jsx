import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck, ShieldCheck, ChevronRight, CheckCircle, Zap, Upload, AlertCircle, Loader2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from './Home';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadImage } from '../utils/cloudinaryService';

const steps = ['Delivery', 'Payment', 'Review'];

const INSTALLMENT_OPTIONS = [
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `${i + 2}_weeks`,
    label: `${i + 2} Weeks`,
    type: 'weekly',
    duration: i + 2,
    interestRate: (i + 2) * 0.015 // 1.5% per week
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 2}_months`,
    label: `${i + 2} Months`,
    type: 'monthly',
    duration: i + 2,
    interestRate: (i + 2) * 0.05 // 5% per month
  }))
];

export default function Checkout() {
  const { user, authLoading, cart, cartTotal, clearCart, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ 
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '', 
    phone: user?.phone || '', 
    address: '', 
    city: '', 
    state: 'Lagos', 
    payMethod: 'bank_transfer',
    installmentPlan: '4_weeks'
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [activeLegal, setActiveLegal] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState({ terms: false, privacy: false });

  const delivery = 5000;
  const subTotal = cartTotal + delivery;

  const activePlan = INSTALLMENT_OPTIONS.find(p => p.id === formData.installmentPlan) || INSTALLMENT_OPTIONS[0];
  const installmentInterest = formData.payMethod === 'installment' ? Math.floor(subTotal * activePlan.interestRate) : 0;
  const grandTotal = subTotal + installmentInterest;
  const depositAmount = formData.payMethod === 'installment' ? Math.floor(grandTotal * 0.30) : grandTotal;
  const recurringAmount = formData.payMethod === 'installment' ? Math.floor((grandTotal - depositAmount) / activePlan.duration) : 0;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        showToast('Please log in to proceed to checkout.', 'error');
        navigate('/login?redirect=/checkout');
      } else if (cart.length === 0 && !placed) {
        navigate('/cart');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, cart, navigate, placed]);

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrderClick = () => {
    if ((formData.payMethod === 'bank_transfer' || formData.payMethod === 'installment') && !receiptFile) {
      setError('Please upload your payment receipt before placing the order.');
      return;
    }
    if (!termsAccepted.terms || !termsAccepted.privacy) {
      setError('Please read and accept both the Terms & Conditions and Privacy Policy.');
      return;
    }
    setError('');
    submitOrder();
  };

  const submitOrder = async () => {
    setLoading(true);
    setError('');

    try {
      let receiptUrl = '';
      if (receiptFile) {
        receiptUrl = await uploadImage(receiptFile);
      }

      const orderData = {
        userId: user?.uid || 'guest',
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: user?.email || '',
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
        items: cart,
        total: grandTotal,
        subTotal: subTotal,
        deliveryFee: delivery,
        installmentInterest,
        payMethod: formData.payMethod,
        installmentPlan: formData.payMethod === 'installment' ? formData.installmentPlan : null,
        depositAmount: formData.payMethod === 'installment' ? depositAmount : null,
        recurringAmount: formData.payMethod === 'installment' ? recurringAmount : null,
        installmentsTotal: formData.payMethod === 'installment' ? activePlan.duration : null,
        installmentInterval: formData.payMethod === 'installment' ? activePlan.type : null,
        installmentsPaid: formData.payMethod === 'installment' ? 0 : null,
        installmentReceipts: formData.payMethod === 'installment' ? [] : null,
        status: 'Pending Verification',
        initialPaymentStatus: 'Pending',
        receiptUrl: receiptUrl,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      setFinalTotal(grandTotal);
      clearCart();
      setPlaced(true);
    } catch (err) {
      console.error(err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px' };

  if (authLoading || (!user && !placed)) {
    return (
      <main className="main-content" style={{ padding: '28px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className="spinner" size={32} color="var(--primary)" />
      </main>
    );
  }

  if (cart.length === 0 && !placed) return null;

  return (
    <main className="main-content" style={{ padding: '28px 20px' }}>
      {placed ? (
        <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', background: 'rgba(0,230,118,0.1)', border: '3px solid var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={52} color="var(--success)" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: 'var(--success)', marginBottom: '12px' }}>Order Placed!</h1>
          <p style={{ color: 'var(--gray-1)', fontSize: '16px', marginBottom: '8px' }}>Thank you for your purchase. We are currently verifying your payment receipt.</p>
          <p style={{ color: 'var(--gray-1)', fontSize: '14px', marginBottom: '24px' }}>You will receive an email notification once your order is confirmed and processing.</p>
          <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '20px', marginBottom: '32px' }}>Order Total: {formatCurrency(finalTotal)}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '14px 28px', borderRadius: 'var(--radius-md)', fontWeight: 800 }}>Track Order <ChevronRight size={16} /></Link>
            <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--white)', padding: '14px 28px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>Continue Shopping</Link>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '28px' }}>Checkout</h1>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '0' }}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', background: i <= step ? 'var(--primary)' : 'var(--dark-card)', color: i <= step ? 'var(--black)' : 'var(--gray-1)', border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--dark-border)'}`, transition: 'var(--transition)' }}>{i < step ? '✓' : i + 1}</div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: i === step ? 'var(--primary)' : 'var(--gray-1)' }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--primary)' : 'var(--dark-border)', margin: '0 8px', marginBottom: '20px', transition: 'var(--transition)' }}></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="cart-grid" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
            {/* Steps Content */}
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={20} color="var(--primary)" /> Delivery Details</h3>
                  {[['Full Name', 'fullName', 'text', 'e.g., Hassan Doe'], ['Phone', 'phone', 'tel', 'e.g., +234 800 000 0000'], ['Address', 'address', 'text', 'e.g., 5 Electronics Way, Ikeja'], ['City', 'city', 'text', 'e.g., Lagos']].map(([label, key, type, placeholder]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{label}</label>
                      <input type={type} placeholder={placeholder} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} required />
                    </div>
                  ))}
                  <button onClick={() => {
                    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
                      setError('Please fill in all delivery details.');
                      return;
                    }
                    setError('');
                    setStep(1);
                  }} style={{ background: 'var(--primary)', color: 'var(--black)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>Continue to Payment <ChevronRight size={18} /></button>
                  {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '-10px', textAlign: 'center' }}>{error}</p>}
                </div>
              )}

              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard size={20} color="var(--primary)" /> Payment Method</h3>
                  {[
                    { id: 'bank_transfer', label: 'Direct Bank Transfer', icon: CreditCard, desc: 'Pay directly to our bank account' },
                    { id: 'installment', label: 'Installment Payment', icon: Truck, desc: 'Pay in small installments' },
                    { id: 'easybuy', label: 'Easy Buy', icon: ShieldCheck, desc: 'Coming Soon', disabled: true },
                    ...(user?.isAdmin ? [{ id: 'admin_cash', label: 'Admin POS / Cash', icon: Zap, desc: 'Direct order placement (Admin only)' }] : []),
                  ].map(method => (
                    <div 
                      key={method.id} 
                      onClick={() => !method.disabled && setFormData(p => ({ ...p, payMethod: method.id }))} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                        border: `2px solid ${formData.payMethod === method.id ? 'var(--primary)' : 'var(--dark-border)'}`, 
                        borderRadius: 'var(--radius-md)', 
                        cursor: method.disabled ? 'not-allowed' : 'pointer', 
                        background: formData.payMethod === method.id ? 'rgba(255,206,30,0.05)' : 'var(--dark)', 
                        opacity: method.disabled ? 0.5 : 1,
                        transition: 'var(--transition)' 
                      }}
                    >
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,206,30,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <method.icon size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {method.label}
                          {method.disabled && <span style={{ fontSize: '10px', background: 'var(--danger)', color: 'var(--white)', padding: '2px 6px', borderRadius: '10px' }}>Soon</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-1)' }}>{method.desc}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${formData.payMethod === method.id ? 'var(--primary)' : 'var(--dark-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {formData.payMethod === method.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button onClick={() => setStep(0)} style={{ flex: 1, background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--white)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>Back</button>
                    <button onClick={() => setStep(2)} style={{ flex: 2, background: 'var(--primary)', color: 'var(--black)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Review Order <ChevronRight size={18} /></button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Review & Pay</h3>
                  
                  {formData.payMethod === 'bank_transfer' && (
                    <div style={{ background: 'var(--dark)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={18} /> Bank Account Details
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--gray-1)', marginBottom: '16px' }}>
                        Please transfer the exact amount of <strong>{formatCurrency(grandTotal)}</strong> to the account below. Your order will not ship until we receive payment.
                      </p>
                      
                      <div style={{ background: 'var(--black)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'grid', gap: '12px', border: '1px solid var(--dark-border)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--gray-1)', fontSize: '13px' }}>Bank Name</span>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>Wema Bank</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--gray-1)', fontSize: '13px' }}>Account Name</span>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>Mac-Christar Limited</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--gray-1)', fontSize: '13px' }}>Account Number</span>
                          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--white)', letterSpacing: '1px' }}>0125986348</span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--white)', marginBottom: '8px' }}>Upload Payment Receipt <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{ flex: 1, background: 'var(--dark-card)', border: '1.5px dashed var(--dark-border)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}>
                            <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                            <span style={{ fontSize: '13px', color: 'var(--gray-1)' }}>Click to upload screenshot</span>
                            <input type="file" accept="image/*" onChange={handleReceiptChange} style={{ display: 'none' }} />
                          </label>
                          {receiptPreview && (
                            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
                              <img src={receiptPreview} alt="Receipt preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.payMethod === 'installment' && (
                    <div style={{ background: 'var(--dark)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={18} /> Installment Plan Details
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--gray-1)', marginBottom: '16px' }}>
                        Choose a payment plan that works for you. A 30% upfront deposit is required before shipping.
                      </p>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--white)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Duration</label>
                        <select 
                          value={formData.installmentPlan}
                          onChange={(e) => setFormData(p => ({ ...p, installmentPlan: e.target.value }))}
                          style={{ width: '100%', background: 'var(--black)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '14px', color: 'var(--white)', outline: 'none' }}
                        >
                          <optgroup label="Weekly Plans (2% interest/week)">
                            {INSTALLMENT_OPTIONS.filter(o => o.type === 'weekly').map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label} ({(opt.interestRate * 100).toFixed(0)}% Interest)</option>
                            ))}
                          </optgroup>
                          <optgroup label="Monthly Plans (5% interest/month)">
                            {INSTALLMENT_OPTIONS.filter(o => o.type === 'monthly').map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label} ({(opt.interestRate * 100).toFixed(0)}% Interest)</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      
                      <div style={{ background: 'var(--black)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'grid', gap: '12px', border: '1px solid var(--dark-border)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--gray-1)', fontSize: '13px' }}>Subtotal (inc. Delivery)</span>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{formatCurrency(subTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--warning)', fontSize: '13px' }}>Interest ({(activePlan.interestRate * 100).toFixed(0)}%)</span>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--warning)' }}>+{formatCurrency(installmentInterest)}</span>
                        </div>
                        <div style={{ height: '1px', background: 'var(--dark-border)', margin: '4px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--white)', fontSize: '14px', fontWeight: 800 }}>Total Payable</span>
                          <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--primary)' }}>{formatCurrency(grandTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                          <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 700 }}>Upfront Deposit (30%)</span>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--success)' }}>{formatCurrency(depositAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--gray-1)', fontSize: '13px' }}>Remaining ({activePlan.duration} payments)</span>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{formatCurrency(recurringAmount)} / {activePlan.type === 'weekly' ? 'week' : 'month'}</span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--white)', marginBottom: '8px' }}>Upload Initial Deposit Receipt <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <p style={{ fontSize: '12px', color: 'var(--gray-1)', marginBottom: '12px' }}>Please transfer your deposit of <strong>{formatCurrency(depositAmount)}</strong> to Wema Bank (0125986348) - Mac-Christar Limited.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{ flex: 1, background: 'var(--dark-card)', border: '1.5px dashed var(--dark-border)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}>
                            <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                            <span style={{ fontSize: '13px', color: 'var(--gray-1)' }}>Click to upload screenshot</span>
                            <input type="file" accept="image/*" onChange={handleReceiptChange} style={{ display: 'none' }} />
                          </label>
                          {receiptPreview && (
                            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
                              <img src={receiptPreview} alt="Receipt preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms Checkboxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', marginBottom: '16px' }}>
                    {/* Terms */}
                    <div onClick={() => !termsAccepted.terms && setActiveLegal('terms')} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: 'var(--radius-md)', border: termsAccepted.terms ? '2px solid rgba(0,230,118,0.3)' : '2px solid var(--dark-border)', background: termsAccepted.terms ? 'rgba(0,230,118,0.05)' : 'var(--dark-card)', cursor: termsAccepted.terms ? 'default' : 'pointer', transition: 'var(--transition)' }}>
                      <div style={{ flexShrink: 0, marginTop: '2px', width: '20px', height: '20px', borderRadius: '4px', border: termsAccepted.terms ? '2px solid var(--success)' : '2px solid var(--gray-2)', background: termsAccepted.terms ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {termsAccepted.terms && <CheckCircle size={14} color="var(--black)" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: termsAccepted.terms ? 'var(--success)' : 'var(--white)', margin: 0, lineHeight: 1.5 }}>
                          I have read and accept the <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={e => { e.stopPropagation(); setActiveLegal('terms'); }}>Terms & Conditions</span> including the No-Return & No-Refund policy.
                        </p>
                        {termsAccepted.terms ? (
                          <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Accepted</p>
                        ) : (
                          <p style={{ fontSize: '11px', color: 'var(--gray-2)', marginTop: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Click to read & accept</p>
                        )}
                      </div>
                    </div>

                    {/* Privacy */}
                    <div onClick={() => !termsAccepted.privacy && setActiveLegal('privacy')} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: 'var(--radius-md)', border: termsAccepted.privacy ? '2px solid rgba(0,230,118,0.3)' : '2px solid var(--dark-border)', background: termsAccepted.privacy ? 'rgba(0,230,118,0.05)' : 'var(--dark-card)', cursor: termsAccepted.privacy ? 'default' : 'pointer', transition: 'var(--transition)' }}>
                      <div style={{ flexShrink: 0, marginTop: '2px', width: '20px', height: '20px', borderRadius: '4px', border: termsAccepted.privacy ? '2px solid var(--success)' : '2px solid var(--gray-2)', background: termsAccepted.privacy ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {termsAccepted.privacy && <CheckCircle size={14} color="var(--black)" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: termsAccepted.privacy ? 'var(--success)' : 'var(--white)', margin: 0, lineHeight: 1.5 }}>
                          I have read and accept the <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={e => { e.stopPropagation(); setActiveLegal('privacy'); }}>Privacy Policy</span> and consent to data processing under Nigerian NDPR.
                        </p>
                        {termsAccepted.privacy ? (
                          <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Accepted</p>
                        ) : (
                          <p style={{ fontSize: '11px', color: 'var(--gray-2)', marginTop: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Click to read & accept</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: 'rgba(255,61,0,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setStep(1)} disabled={loading} style={{ flex: 1, background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--white)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>Back</button>
                    <button onClick={handlePlaceOrderClick} disabled={loading} style={{ flex: 2, background: 'var(--primary)', color: 'var(--black)', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px var(--primary-glow)' }}>
                      {loading ? <><Loader2 className="spinner" size={18} /> Processing...</> : <><Zap size={18} /> Place Order — {formatCurrency(grandTotal)}</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--dark)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={item.imgUrl || item.image || item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '2px', lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ color: 'var(--gray-1)', fontSize: '11px' }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatCurrency(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-1)' }}><span>Subtotal</span><span style={{ color: 'var(--white)', fontWeight: 600 }}>{formatCurrency(cartTotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-1)' }}><span>Delivery</span><span style={{ color: 'var(--white)', fontWeight: 600 }}>{formatCurrency(delivery)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, paddingTop: '12px', borderTop: '1px solid var(--dark-border)', marginTop: '4px' }}><span>Total</span><span style={{ color: 'var(--primary)' }}>{formatCurrency(grandTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      {activeLegal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button onClick={() => setActiveLegal(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--white)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '20px', color: 'var(--white)' }}>
              {activeLegal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </h3>
            <div style={{ color: 'var(--gray-1)', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
              {activeLegal === 'terms' ? (
                <>
                  <p style={{ marginBottom: '16px' }}>By proceeding, you agree to Mac-Christar Limited's terms of service. All purchases are final once delivered and verified in good condition.</p>
                  <h4 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: '8px' }}>No-Return & No-Refund Policy</h4>
                  <p>Please note that we operate a strict No-Return and No-Refund policy. Once an item is purchased and collected/delivered, it cannot be returned for a refund or exchanged unless it is Dead On Arrival (DOA) and verified by our technicians within 24 hours of delivery.</p>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '16px' }}>We value your privacy and are committed to protecting your personal data in accordance with the Nigerian Data Protection Regulation (NDPR).</p>
                  <h4 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: '8px' }}>Data Processing Consent</h4>
                  <p>By accepting this policy, you consent to our collection, use, and processing of your personal information (including name, phone, address, and email) solely for the purpose of fulfilling your order, providing customer support, and occasionally sending you updates about our services.</p>
                </>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  if (activeLegal === 'terms') setTermsAccepted(p => ({...p, terms: true}));
                  if (activeLegal === 'privacy') setTermsAccepted(p => ({...p, privacy: true}));
                  setActiveLegal(null);
                }} 
                style={{ width: '100%', padding: '14px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--black)', fontWeight: 800, cursor: 'pointer', transition: 'var(--transition)', boxShadow: '0 8px 24px var(--primary-glow)' }}
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
