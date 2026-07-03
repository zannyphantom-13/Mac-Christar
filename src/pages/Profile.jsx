import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Bell, Settings, LogOut, ChevronRight, ShoppingCart, Star, ShieldCheck, Camera, Loader2, Upload, Clock } from 'lucide-react';
import { uploadImage } from '../utils/cloudinaryService';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { formatCurrency } from './Home';

const STATUS_COLORS = {
  Delivered: { color: '#00E676', bg: 'rgba(0,230,118,0.12)' },
  'In Transit': { color: '#00B0FF', bg: 'rgba(0,176,255,0.12)' },
  Processing: { color: '#FFC400', bg: 'rgba(255,196,0,0.12)' },
  'Pending Verification': { color: '#FF9800', bg: 'rgba(255,152,0,0.12)' },
  Pending: { color: '#FFC400', bg: 'rgba(255,196,0,0.12)' },
  Cancelled: { color: '#FF3D00', bg: 'rgba(255,61,0,0.12)' },
  'Payment Failed': { color: '#ff1744', bg: 'rgba(255,23,68,0.12)' },
};

const getNextDueDateInfo = (order) => {
  if (!order.createdAt || (order.installmentsPaid || 0) >= (order.installmentsTotal || 1)) return null;
  const createdDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
  
  const intervalDays = order.installmentInterval === 'weekly' ? 7 : 30;
  const daysToAdd = ((order.installmentsPaid || 0) + 1) * intervalDays;
  
  const dueDate = new Date(createdDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return { dueDate, diffDays };
};

export default function Profile() {
  const { user, authLoading, logout, wishlist, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [activePaymentModal, setActivePaymentModal] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const fileInputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Settings form state — pre-filled from the logged-in user
  const [settingsForm, setSettingsForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync form whenever user loads
  useEffect(() => {
    if (user) {
      setSettingsForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      if (user.avatar) setProfileImage(user.avatar);
    }
  }, [user]);

  // Fetch real orders for this user from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const fetchedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sort descending by createdAt on the client side to bypass Firestore composite index requirement
        fetchedOrders.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
          const tB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
          return tB - tA;
        });
        
        setOrders(fetchedOrders);
      } catch (e) {
        console.error('Error fetching orders:', e);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // If not logged in and done loading auth, redirect to login
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file);
      setProfileImage(imageUrl);
      // Save the new avatar URL to Firestore
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), { avatar: imageUrl });
        showToast('Profile image updated successfully!');
      }
    } catch (error) {
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInstallmentPayment = async (orderId, amountPaid, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Uploading receipt, please wait...');
      const imageUrl = await uploadImage(file);
      
      const orderRef = doc(db, 'orders', orderId);
      const orderToUpdate = orders.find(o => o.id === orderId);
      const newReceipts = [...(orderToUpdate.installmentReceipts || []), {
        receiptUrl: imageUrl,
        amount: Number(amountPaid),
        uploadedAt: new Date().toISOString(),
        status: 'Pending Verification'
      }];
      
      await updateDoc(orderRef, { installmentReceipts: newReceipts });
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, installmentReceipts: newReceipts } : o));
      
      showToast('Payment receipt uploaded successfully!');
    } catch (error) {
      showToast('Failed to upload receipt.', 'error');
    }
  };

  const handleReuploadInitialDeposit = async (orderId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading new receipt, please wait...');
      const imageUrl = await uploadImage(file);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        receiptUrl: imageUrl,
        initialPaymentStatus: 'Pending',
        initialPaymentRejectReason: null,
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, receiptUrl: imageUrl, initialPaymentStatus: 'Pending', initialPaymentRejectReason: null } : o));
      showToast('New deposit receipt uploaded. Awaiting admin review.');
    } catch (error) {
      showToast('Failed to upload receipt.', 'error');
    }
  };

  const handleReuploadRecurringReceipt = async (orderId, rIdx, amountPaid, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading replacement receipt, please wait...');
      const imageUrl = await uploadImage(file);
      const orderToUpdate = orders.find(o => o.id === orderId);
      const updatedReceipts = [...(orderToUpdate.installmentReceipts || [])];
      updatedReceipts[rIdx] = {
        ...updatedReceipts[rIdx],
        receiptUrl: imageUrl,
        amount: Number(amountPaid),
        uploadedAt: new Date().toISOString(),
        status: 'Pending Verification',
        rejectReason: null,
      };
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { installmentReceipts: updatedReceipts });
      setOrders(orders.map(o => o.id === orderId ? { ...o, installmentReceipts: updatedReceipts } : o));
      showToast('Replacement receipt submitted. Awaiting admin review.');
    } catch (error) {
      showToast('Failed to upload receipt.', 'error');
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setIsSavingSettings(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: settingsForm.firstName,
        lastName: settingsForm.lastName,
        phone: settingsForm.phone,
        // email is managed by Firebase Auth — don't allow edit here
      });
      setSettingsSaved(true);
      showToast('Account settings saved successfully!');
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'My Account' : 'My Account';
  const initials = user?.firstName ? user.firstName[0].toUpperCase() : 'U';

  if (authLoading) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="spinner" size={48} color="var(--primary)" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="main-content" style={{ padding: '28px 20px' }}>
      <div className="profile-layout" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Sidebar */}
        <aside>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '28px 24px', textAlign: 'center' }}>
              <div 
                style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 12px', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                title="Click to change profile picture"
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: 'var(--black)', boxShadow: '0 8px 24px var(--primary-glow)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                  {isUploading ? (
                    <Loader2 className="spinner" size={32} />
                  ) : profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </div>
                
                {/* Overlay camera icon */}
                {!isUploading && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--black)', border: '2px solid var(--primary)', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={14} color="var(--primary)" />
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--black)' }}>{displayName}</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{user.email}</p>
              {user.isAdmin && (
                <span style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(255,61,0,0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>
                  Admin
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-display)' }}>{orders.length}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Orders</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-display)' }}>{wishlist.length}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Wishlist</div>
                </div>
              </div>
            </div>
            
            {/* Nav links */}
            <nav style={{ padding: '12px 0' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: activeTab === tab.id ? 'rgba(255,94,0,0.1)' : 'transparent', color: activeTab === tab.id ? 'var(--primary)' : 'var(--gray-1)', borderLeft: `3px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`, transition: 'var(--transition)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                  <tab.icon size={18} />
                  {tab.label}
                  <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: activeTab === tab.id ? 1 : 0.4 }} />
                </button>
              ))}
              <div style={{ height: '1px', background: 'var(--dark-border)', margin: '8px 0' }}></div>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: 'transparent', color: 'var(--danger)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div>
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>My Orders</h2>
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Loader2 className="spinner" size={40} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--gray-1)' }}>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center' }}>
                  <Package size={56} color="var(--gray-2)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No orders yet</h3>
                  <p style={{ color: 'var(--gray-1)', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                  <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}><ShoppingCart size={16} /> Start Shopping</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => {
                    const firstItem = order.items?.[0];
                    const itemImg = firstItem?.imgUrl || firstItem?.image || firstItem?.images?.[0] || null;
                    const itemName = firstItem?.name || 'Order';
                    const itemCount = (order.items?.length || 1);
                    const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || '—';
                    const s = STATUS_COLORS[order.status] || STATUS_COLORS['Pending'];
                    const shortId = order.id?.slice(0, 8).toUpperCase();
                    
                    const customPaid = (order.installmentReceipts || [])
                      .filter(r => r.status === 'Approved')
                      .reduce((sum, r) => sum + (Number(r.amount) || order.recurringAmount || 0), 0);
                    const paidSoFar = (order.initialPaymentStatus !== 'Rejected' ? (order.depositAmount || 0) : 0) + customPaid;
                    const remainingBalance = Math.max(0, (order.total || order.totalAmount || 0) - paidSoFar);
                    const dueInfo = getNextDueDateInfo(order);
                    
                    return (
                      <div key={order.id} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', transition: 'var(--transition)' }}>
                        <div style={{ width: '72px', height: '72px', background: 'var(--dark)', borderRadius: 'var(--radius-sm)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {itemImg ? <img src={itemImg} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} /> : <Package size={28} color="var(--gray-2)" />}
                        </div>
                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemName}{itemCount > 1 ? ` +${itemCount - 1} more` : ''}</h3>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', flexShrink: 0 }}>{formatCurrency(order.total || order.totalAmount)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-1)' }}>#{shortId} · {date}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: s.color, background: s.bg, padding: '3px 10px', borderRadius: '20px' }}>{order.status || 'Pending'}</span>
                          </div>
                          
                          {order.payMethod === 'installment' && (
                            <div style={{ marginTop: '12px', background: 'rgba(255,152,0,0.05)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Installment Plan ({order.installmentPlan?.replace('_', ' ').toUpperCase()})</div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--gray-1)', marginBottom: '12px' }}>
                                <span>Deposit: <strong style={{ color: 'var(--white)' }}>{formatCurrency(order.depositAmount)}</strong></span>
                                <span>Recurring: <strong style={{ color: 'var(--white)' }}>{formatCurrency(order.recurringAmount)}</strong></span>
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px', color: 'var(--gray-1)', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px' }}>
                                <div>Total: <br/><strong style={{ color: 'var(--white)' }}>{formatCurrency(order.total || order.totalAmount)}</strong></div>
                                <div>Paid: <br/><strong style={{ color: 'var(--success)' }}>{formatCurrency(paidSoFar)}</strong></div>
                                <div>Balance: <br/><strong style={{ color: 'var(--danger)' }}>{formatCurrency(remainingBalance)}</strong></div>
                              </div>
                              
                              {dueInfo && (
                                <div style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: dueInfo.diffDays < 0 ? 'rgba(255,0,0,0.1)' : dueInfo.diffDays === 0 ? 'rgba(255,152,0,0.1)' : 'rgba(0,255,0,0.1)', color: dueInfo.diffDays < 0 ? '#ff1744' : dueInfo.diffDays === 0 ? '#FF9800' : '#00E676', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                                  <Clock size={12} />
                                  {dueInfo.diffDays < 0 
                                    ? `Overdue by ${Math.abs(dueInfo.diffDays)} Days` 
                                    : dueInfo.diffDays === 0 
                                    ? `Payment Due Today` 
                                    : `Next Payment in ${dueInfo.diffDays} Days`}
                                </div>
                              )}
                              
                                {/* Initial payment rejection notice */}
                                {order.initialPaymentStatus === 'Rejected' && (
                                  <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(255,23,68,0.1)', border: '1px solid var(--danger)', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--danger)', marginBottom: '4px' }}>⚠️ Deposit Payment Rejected</div>
                                    {order.initialPaymentRejectReason && (
                                      <div style={{ fontSize: '12px', color: 'var(--gray-1)', marginBottom: '8px' }}>Reason: <strong style={{ color: 'var(--white)' }}>{order.initialPaymentRejectReason}</strong></div>
                                    )}
                                    <input type="file" id={`reupload-deposit-${order.id}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleReuploadInitialDeposit(order.id, e)} />
                                    <label htmlFor={`reupload-deposit-${order.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--danger)', color: 'var(--white)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                      <Upload size={13} /> Re-upload Deposit Receipt
                                    </label>
                                  </div>
                                )}
                                
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white)' }}>Progress</span>
                                  <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700 }}>
                                    {order.installmentsPaid || 0} of {order.installmentsTotal || 1} Payments
                                  </span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--dark)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                                  <div style={{ width: `${Math.min(100, ((order.installmentsPaid || 0) / (order.installmentsTotal || 1)) * 100)}%`, height: '100%', background: 'var(--warning)' }}></div>
                                </div>
                                
                                {(order.installmentsPaid || 0) < (order.installmentsTotal || 1) && remainingBalance > 0 && (
                                  <div>
                                    {activePaymentModal !== order.id ? (
                                      <button 
                                        onClick={() => { setActivePaymentModal(order.id); setPaymentAmountInput(order.recurringAmount?.toString()); }}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--warning)', color: 'var(--black)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none' }}
                                      >
                                        <Upload size={14} /> Make Next Payment
                                      </button>
                                    ) : (
                                      <div style={{ marginTop: '12px', padding: '14px', background: 'var(--dark)', border: '1px solid var(--dark-border)', borderRadius: '6px' }}>
                                        {/* Bank Account Details */}
                                        <div style={{ background: 'rgba(255,152,0,0.07)', border: '1px solid var(--warning)', borderRadius: '4px', padding: '12px', marginBottom: '12px' }}>
                                          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Transfer to this account first</div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                              <span style={{ color: 'var(--gray-1)' }}>Bank Name</span>
                                              <span style={{ fontWeight: 700, color: 'var(--white)' }}>Wema Bank</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                              <span style={{ color: 'var(--gray-1)' }}>Account Name</span>
                                              <span style={{ fontWeight: 700, color: 'var(--white)' }}>Mac-Christar Limited</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                              <span style={{ color: 'var(--gray-1)' }}>Account Number</span>
                                              <span style={{ fontWeight: 900, fontSize: '15px', color: 'var(--warning)', letterSpacing: '1.5px', fontFamily: 'monospace' }}>0125986348</span>
                                            </div>
                                            <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--gray-1)', textAlign: 'center', borderTop: '1px solid var(--dark-border)', paddingTop: '6px' }}>
                                              Transfer exactly <strong style={{ color: 'var(--white)' }}>{formatCurrency(order.recurringAmount)}</strong> or your agreed amount, then upload your receipt below.
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--white)' }}>Enter Amount Paid (₦)</div>
                                        <input type="number" value={paymentAmountInput} onChange={e => setPaymentAmountInput(e.target.value)} placeholder="e.g. 30000" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--white)', borderRadius: '4px', marginBottom: '10px', boxSizing: 'border-box' }} />
                                        
                                        <input 
                                          type="file" 
                                          id={`custom-upload-${order.id}`} 
                                          style={{ display: 'none' }} 
                                          accept="image/*"
                                          onChange={(e) => { handleInstallmentPayment(order.id, paymentAmountInput, e); setActivePaymentModal(null); }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <label htmlFor={`custom-upload-${order.id}`} style={{ flex: 1, textAlign: 'center', background: 'var(--warning)', color: 'var(--black)', padding: '9px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                            <Upload size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} /> Upload Receipt
                                          </label>
                                          <button onClick={() => setActivePaymentModal(null)} style={{ padding: '9px 12px', background: 'var(--dark-border)', color: 'var(--white)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Cancel</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {order.installmentReceipts?.length > 0 && (
                                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {order.installmentReceipts.map((rec, rIdx) => (
                                      <div key={rIdx} style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '8px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--gray-1)', display: 'flex', justifyContent: 'space-between', marginBottom: rec.status === 'Rejected' ? '6px' : '0' }}>
                                          <span>{rec.amount ? formatCurrency(rec.amount) : 'Payment'} on {new Date(rec.uploadedAt).toLocaleDateString()}</span>
                                          <span style={{ color: rec.status === 'Approved' ? 'var(--success)' : rec.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>{rec.status}</span>
                                        </div>
                                        {rec.status === 'Rejected' && (
                                          <div style={{ padding: '8px', background: 'rgba(255,23,68,0.08)', border: '1px solid var(--danger)', borderRadius: '4px' }}>
                                            {rec.rejectReason && (
                                              <div style={{ fontSize: '11px', color: 'var(--danger)', marginBottom: '6px' }}>Reason: <strong>{rec.rejectReason}</strong></div>
                                            )}
                                            <input type="number" id={`reupload-amt-${order.id}-${rIdx}`} placeholder="Enter amount paid (₦)" defaultValue={rec.amount} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--white)', borderRadius: '4px', marginBottom: '6px', boxSizing: 'border-box', fontSize: '12px' }} />
                                            <input type="file" id={`reupload-rec-${order.id}-${rIdx}`} style={{ display: 'none' }} accept="image/*"
                                              onChange={(e) => {
                                                const amtInput = document.getElementById(`reupload-amt-${order.id}-${rIdx}`);
                                                handleReuploadRecurringReceipt(order.id, rIdx, amtInput?.value || rec.amount, e);
                                              }}
                                            />
                                            <label htmlFor={`reupload-rec-${order.id}-${rIdx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--danger)', color: 'var(--white)', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                              <Upload size={11} /> Re-upload Receipt
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {order.payMethod && order.payMethod !== 'installment' && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--gray-1)' }}>
                              Payment Method: <strong style={{ color: 'var(--white)' }}>{order.payMethod.replace('_', ' ').toUpperCase()}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Wishlist</h2>
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center' }}>
                <Heart size={64} color="var(--primary)" strokeWidth={1} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Your Wishlist is Empty</h3>
                <p style={{ color: 'var(--gray-1)', marginBottom: '20px' }}>Save your favourite items to buy later.</p>
                <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}><ShoppingCart size={16} /> Browse Products</Link>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>Delivery Addresses</h2>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none' }}>+ Add Address</button>
              </div>
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>Home <span style={{ background: 'rgba(255,94,0,0.1)', color: 'var(--primary)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' }}>Default</span></div>
                      <div style={{ fontSize: '14px', color: 'var(--gray-1)', lineHeight: 1.7 }}>5 Electronics Way, Ikeja<br />Lagos State, Nigeria</div>
                    </div>
                  </div>
                  <button style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--gray-1)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}>Edit</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Account Settings</h2>
              <form onSubmit={handleSettingsSave} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {settingsSaved && (
                  <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600 }}>
                    ✓ Changes saved successfully!
                  </div>
                )}
                <div className="responsive-grid-2" style={{ gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>First Name</label>
                    <input type="text" value={settingsForm.firstName} onChange={e => setSettingsForm(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" style={{ width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Last Name</label>
                    <input type="text" value={settingsForm.lastName} onChange={e => setSettingsForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" style={{ width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" value={settingsForm.email} readOnly style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--dark-border)', color: 'var(--gray-1)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', cursor: 'not-allowed' }} title="Email cannot be changed here" />
                  <p style={{ fontSize: '11px', color: 'var(--gray-2)', marginTop: '4px' }}>Email address is managed by Firebase Auth and cannot be changed here.</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Phone Number</label>
                  <div style={{ display: 'flex' }}>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 14px', background: 'rgba(255,94,0,0.1)', border: '1.5px solid var(--primary)', borderRight: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>+234</span>
                    <input type="tel" value={settingsForm.phone} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} placeholder="800 000 0000" maxLength="11" style={{ width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '14px' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                  </div>
                </div>
                <button type="submit" disabled={isSavingSettings} style={{ alignSelf: 'flex-start', background: 'var(--primary)', color: 'var(--black)', padding: '12px 28px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '14px', cursor: isSavingSettings ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSavingSettings ? 0.7 : 1 }}>
                  {isSavingSettings ? <><Loader2 className="spinner" size={16} /> Saving...</> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Notifications</h2>
              {[
                { icon: ShoppingCart, title: 'Your order #MAC-002 is in transit', time: '2 hours ago', read: false },
                { icon: Star, title: 'Rate your recent purchase: Samsung Galaxy S24 Ultra', time: '1 day ago', read: false },
                { icon: ShieldCheck, title: 'Your email address has been verified', time: '4 days ago', read: true },
              ].map((notif, i) => (
                <div key={i} style={{ background: notif.read ? 'var(--dark-card)' : 'rgba(255,94,0,0.05)', border: `1px solid ${notif.read ? 'var(--dark-border)' : 'rgba(255,94,0,0.2)'}`, borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,94,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <notif.icon size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: notif.read ? 400 : 600, color: notif.read ? 'var(--gray-1)' : 'var(--white)', marginBottom: '4px' }}>{notif.title}</p>
                    <span style={{ fontSize: '12px', color: 'var(--gray-2)' }}>{notif.time}</span>
                  </div>
                  {!notif.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
