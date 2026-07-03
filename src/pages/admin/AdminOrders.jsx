import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  ClipboardList, Package, CheckCircle, Clock, AlertCircle,
  Search, ChevronDown, ChevronUp, Loader2, Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STATUS_COLORS = {
  Pending: { bg: 'rgba(255,206,30,0.1)', color: 'var(--warning)', border: 'rgba(255,206,30,0.3)' },
  'Pending Verification': { bg: 'rgba(255,152,0,0.1)', color: '#FF9800', border: 'rgba(255,152,0,0.3)' },
  Processing: { bg: 'rgba(0,176,255,0.1)', color: 'var(--info)', border: 'rgba(0,176,255,0.3)' },
  'In Transit': { bg: 'rgba(0,176,255,0.12)', color: '#29b6f6', border: 'rgba(0,176,255,0.3)' },
  Delivered: { bg: 'rgba(0,230,118,0.1)', color: 'var(--success)', border: 'rgba(0,230,118,0.3)' },
  Cancelled: { bg: 'rgba(255,61,0,0.1)', color: 'var(--danger)', border: 'rgba(255,61,0,0.3)' },
  'Payment Failed': { bg: 'rgba(255,0,0,0.1)', color: '#ff1744', border: 'rgba(255,0,0,0.3)' },
};

const STATUS_OPTIONS = ['Pending', 'Pending Verification', 'Processing', 'In Transit', 'Delivered', 'Cancelled', 'Payment Failed'];

const fmt = n => '₦' + Math.ceil(n || 0).toLocaleString('en-NG');

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

function OrderCard({ order }) {
  const { showToast } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const s = STATUS_COLORS[order.status] || STATUS_COLORS['Pending'];

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
      showToast(`Order status updated to ${newStatus}`);
    } catch (e) {
      showToast('Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleInitialPaymentStatus = async (status) => {
    if (updating) return;

    if (status === 'Rejected') {
      const reason = prompt('Enter reason for rejection (e.g. "Amount too low", "Receipt unclear", "Wrong account"):');
      if (!reason || !reason.trim()) return;
      setUpdating(true);
      try {
        await updateDoc(doc(db, 'orders', order.id), {
          initialPaymentStatus: 'Rejected',
          initialPaymentRejectReason: reason.trim(),
        });
        showToast('Initial payment rejected. Customer will be notified.');
      } catch (e) {
        showToast('Failed to reject payment.', 'error');
      } finally {
        setUpdating(false);
      }
      return;
    }

    // Approve flow — admin confirms/adjusts actual amount received
    const confirmed = prompt(
      `Confirm actual deposit amount received (₦). Required was ₦${Math.ceil(order.depositAmount || 0).toLocaleString('en-NG')}. Enter actual amount received:`,
      String(Math.ceil(order.depositAmount || 0))
    );
    if (confirmed === null) return; // cancelled
    const actualAmount = Number(confirmed);
    if (isNaN(actualAmount) || actualAmount <= 0) return showToast('Invalid amount', 'error');

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        initialPaymentStatus: 'Approved',
        initialPaymentRejectReason: null,
        depositAmount: actualAmount, // overwrite with confirmed actual amount
      });
      const diff = actualAmount - (order.depositAmount || 0);
      if (diff > 0) {
        showToast(`Approved! ₦${Math.ceil(diff).toLocaleString('en-NG')} overpayment subtracted from future balance.`);
      } else if (diff < 0) {
        showToast(`Approved! ₦${Math.ceil(Math.abs(diff)).toLocaleString('en-NG')} shortfall added to remaining balance.`);
      } else {
        showToast('Initial payment approved successfully!');
      }
    } catch (e) {
      showToast('Failed to approve payment.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveReceipt = async (rIdx) => {
    if (updating) return;
    setUpdating(true);
    try {
      const updatedReceipts = [...(order.installmentReceipts || [])];
      updatedReceipts[rIdx] = { ...updatedReceipts[rIdx], status: 'Approved', rejectReason: null };
      const newPaid = (order.installmentsPaid || 0) + 1;
      await updateDoc(doc(db, 'orders', order.id), {
        installmentReceipts: updatedReceipts,
        installmentsPaid: newPaid
      });
      showToast('Installment payment approved!');
    } catch (e) {
      showToast('Failed to approve payment.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectReceipt = async (rIdx) => {
    const reason = prompt('Enter reason for rejection (e.g. "Amount doesn\'t match", "Receipt unclear"):');
    if (!reason || !reason.trim()) return;
    if (updating) return;
    setUpdating(true);
    try {
      const updatedReceipts = [...(order.installmentReceipts || [])];
      updatedReceipts[rIdx] = { ...updatedReceipts[rIdx], status: 'Rejected', rejectReason: reason.trim() };
      await updateDoc(doc(db, 'orders', order.id), { installmentReceipts: updatedReceipts });
      showToast('Receipt rejected. Customer can re-upload.');
    } catch (e) {
      showToast('Failed to reject receipt.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddManualPayment = async () => {
    const amountStr = prompt(`Enter custom manual payment amount for order ${order.id.slice(0,8).toUpperCase()} (e.g. 50000)`);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return showToast('Invalid amount', 'error');
    
    if (updating) return;
    setUpdating(true);
    try {
      const updatedReceipts = [...(order.installmentReceipts || []), {
        receiptUrl: '',
        amount: amount,
        uploadedAt: new Date().toISOString(),
        status: 'Approved' // auto-approved since admin is adding it manually
      }];
      const newPaid = (order.installmentsPaid || 0) + 1;
      
      await updateDoc(doc(db, 'orders', order.id), { 
        installmentReceipts: updatedReceipts,
        installmentsPaid: newPaid
      });
      showToast(`Manual payment of ${fmt(amount)} added successfully!`);
    } catch (e) {
      showToast('Failed to add manual payment.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || '—';

  const customPaid = (order.installmentReceipts || [])
    .filter(r => r.status === 'Approved')
    .reduce((sum, r) => sum + (Number(r.amount) || order.recurringAmount || 0), 0);
  const paidSoFar = (order.initialPaymentStatus !== 'Rejected' ? (order.depositAmount || 0) : 0) + customPaid;
  const remainingBalance = Math.max(0, (order.total || order.totalAmount || 0) - paidSoFar);
  const dueInfo = getNextDueDateInfo(order);

  return (
    <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'var(--transition)' }}>
      {/* Summary Row */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flexWrap: 'wrap' }}
      >
        <div style={{ minWidth: '130px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Order ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>#{order.id?.slice(0, 12)}</div>
        </div>

        <div style={{ minWidth: '90px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Date</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{date}</div>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Customer</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{order.customerName || order.userId || 'Guest'}</div>
          {order.customerEmail && <div style={{ fontSize: '12px', color: 'var(--gray-1)' }}>{order.customerEmail}</div>}
        </div>

        <div style={{ minWidth: '120px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Total</div>
          <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{fmt(order.total || order.totalAmount)}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            {order.status === 'Delivered' ? <CheckCircle size={12} /> : order.status === 'Cancelled' ? <AlertCircle size={12} /> : <Clock size={12} />}
            {order.status || 'Pending'}
          </span>
          <div style={{ color: 'var(--gray-1)' }}>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--dark-border)', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {/* Items */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Items Ordered</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(order.items || order.cartItems || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--dark)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(item.imgUrl || item.image || item.img) ? (
                      <img src={item.imgUrl || item.image || item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <Package size={18} color="var(--gray-2)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.name} <span style={{ color: 'var(--gray-1)', fontWeight: 400 }}>×{item.qty || item.quantity || 1}</span></div>
                    <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>{fmt(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Status & Delivery */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Update Status</h4>
            <select
              value={order.status || 'Pending'}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updating}
              style={{ width: '100%', padding: '12px 14px', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 600, outline: 'none', cursor: 'pointer', marginBottom: '12px' }}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {order.deliveryAddress && (
              <div style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><Truck size={12} /> Delivery Address</div>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--gray-1)', margin: 0 }}>{order.deliveryAddress}</p>
              </div>
            )}

            {order.payMethod === 'installment' && (
              <div style={{ background: 'rgba(255,152,0,0.05)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Installment Plan</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--white)', marginBottom: '12px' }}>
                  <div style={{ color: 'var(--gray-1)' }}>Plan: <strong style={{ color: 'var(--white)' }}>{order.installmentPlan?.replace('_', ' ').toUpperCase()}</strong></div>
                  <div style={{ color: 'var(--gray-1)' }}>Deposit: <strong style={{ color: 'var(--white)' }}>{fmt(order.depositAmount)}</strong></div>
                  <div style={{ color: 'var(--gray-1)' }}>Recurring: <strong style={{ color: 'var(--white)' }}>{fmt(order.recurringAmount)}</strong></div>
                  <div style={{ color: 'var(--gray-1)' }}>Interest: <strong style={{ color: 'var(--white)' }}>{fmt(order.installmentInterest)}</strong></div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--gray-1)', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px' }}>
                  <div>Total: <br/><strong style={{ color: 'var(--white)' }}>{fmt(order.total || order.totalAmount)}</strong></div>
                  <div>Paid: <br/><strong style={{ color: 'var(--success)' }}>{fmt(paidSoFar)}</strong></div>
                  <div>Balance: <br/><strong style={{ color: 'var(--danger)' }}>{fmt(remainingBalance)}</strong></div>
                </div>

                {dueInfo && (
                  <div style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: dueInfo.diffDays < 0 ? 'rgba(255,0,0,0.1)' : dueInfo.diffDays === 0 ? 'rgba(255,152,0,0.1)' : 'rgba(0,255,0,0.1)', color: dueInfo.diffDays < 0 ? '#ff1744' : dueInfo.diffDays === 0 ? '#FF9800' : '#00E676', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                    <Clock size={12} />
                    {dueInfo.diffDays < 0 
                      ? `Overdue by ${Math.abs(dueInfo.diffDays)} Days` 
                      : dueInfo.diffDays === 0 
                      ? `Payment Due Today` 
                      : `Next Payment in ${dueInfo.diffDays} Days`}
                  </div>
                )}
                
                <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white)' }}>Progress</span>
                    <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700 }}>
                      {order.installmentsPaid || 0} of {order.installmentsTotal || 1} Payments
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--dark)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${Math.min(100, ((order.installmentsPaid || 0) / (order.installmentsTotal || 1)) * 100)}%`, height: '100%', background: 'var(--warning)' }}></div>
                  </div>
                  
                  {order.installmentReceipts?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recurring Payment Receipts</div>
                      {order.installmentReceipts.map((rec, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--dark-border)', background: 'var(--dark)', flexShrink: 0 }}>
                              {rec.receiptUrl ? <img src={rec.receiptUrl} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={16} color="var(--gray-2)" style={{ margin: '12px' }} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', color: 'var(--white)', fontWeight: 600 }}>{rec.amount ? fmt(rec.amount) : 'Payment'} on {new Date(rec.uploadedAt).toLocaleDateString()}</div>
                              <div style={{ fontSize: '11px', color: rec.status === 'Approved' ? 'var(--success)' : rec.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)' }}>{rec.status}</div>
                              {rec.status === 'Rejected' && rec.rejectReason && (
                                <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px', fontStyle: 'italic' }}>Reason: {rec.rejectReason}</div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            {rec.receiptUrl && (
                              <a href={rec.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--white)', background: 'var(--dark-border)', padding: '6px 10px', borderRadius: '20px', textDecoration: 'none' }}>View</a>
                            )}
                            {rec.status === 'Pending Verification' && (
                              <>
                                <button onClick={() => handleApproveReceipt(rIdx)} disabled={updating} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--black)', background: 'var(--success)', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: updating ? 'not-allowed' : 'pointer' }}>Approve</button>
                                <button onClick={() => handleRejectReceipt(rIdx)} disabled={updating} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--white)', background: 'var(--danger)', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: updating ? 'not-allowed' : 'pointer' }}>Reject</button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(order.installmentsPaid || 0) < (order.installmentsTotal || 1) && remainingBalance > 0 && (
                    <button onClick={handleAddManualPayment} disabled={updating} style={{ marginTop: '12px', width: '100%', padding: '10px', background: 'var(--warning)', color: 'var(--black)', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: updating ? 'not-allowed' : 'pointer' }}>
                      Add Custom Payment (Cash/POS)
                    </button>
                  )}
                </div>
              </div>
            )}

            {order.payMethod && order.payMethod !== 'installment' && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Payment Method</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{order.payMethod.replace('_', ' ').toUpperCase()}</div>
              </div>
            )}

            {order.receiptUrl && (
              <div style={{ background: 'rgba(0,176,255,0.05)', border: '1px solid var(--info)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initial Payment Receipt</div>
                  {order.initialPaymentStatus && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: order.initialPaymentStatus === 'Approved' ? 'var(--success)' : order.initialPaymentStatus === 'Rejected' ? 'var(--danger)' : 'var(--warning)' }}>
                      {order.initialPaymentStatus}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
                    <img src={order.receiptUrl} alt="Receipt Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, background: 'var(--primary)', color: 'var(--black)', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
                    View Full Receipt
                  </a>
                  
                  {(!order.initialPaymentStatus || order.initialPaymentStatus === 'Pending') && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleInitialPaymentStatus('Approved')} disabled={updating} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--black)', background: 'var(--success)', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: updating ? 'not-allowed' : 'pointer' }}>Approve</button>
                      <button onClick={() => handleInitialPaymentStatus('Rejected')} disabled={updating} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--white)', background: 'var(--danger)', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: updating ? 'not-allowed' : 'pointer' }}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {updating && <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '8px' }}>Updating…</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || (o.id || '').toLowerCase().includes(q) || (o.customerName || '').toLowerCase().includes(q) || (o.customerEmail || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = [
    { label: 'Total', value: orders.length },
    { label: 'Pending', value: orders.filter(o => o.status === 'Pending' || !o.status).length, color: 'var(--warning)' },
    { label: 'In Transit', value: orders.filter(o => o.status === 'In Transit').length, color: 'var(--info)' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: 'var(--success)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0 }}>Customer Orders</h1>
        <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>Real-time order management — updates automatically</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-display)', color: s.color || 'var(--white)' }}>{s.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, email…"
            style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'var(--dark-card)', border: '1.5px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', color: 'var(--white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', background: 'var(--dark-card)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
          <option value="All">All Orders</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--gray-1)' }}>Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)' }}>
          <ClipboardList size={56} color="var(--gray-2)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--gray-1)', fontWeight: 600, fontSize: '16px' }}>No orders found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '12px', color: 'var(--gray-2)', marginBottom: '4px' }}>Showing {filtered.length} of {orders.length} orders</p>
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
