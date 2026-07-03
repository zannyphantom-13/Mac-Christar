import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck, ShieldCheck } from 'lucide-react';
import { formatCurrency } from './Home';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { cart: items, updateCartQty: updateQty, removeFromCart: removeItem } = useApp();
  const [coupon, setCoupon] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  return (
    <main className="main-content" style={{ padding: '28px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingCart size={24} color="var(--primary)" /> Shopping Cart
          <span style={{ fontSize: '15px', color: 'var(--gray-1)', fontWeight: 400 }}>({items.length} items)</span>
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)' }}>
            <ShoppingCart size={72} color="var(--gray-2)" strokeWidth={1} style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--gray-1)', marginBottom: '24px' }}>Add some products to get started!</p>
            <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '14px 28px', borderRadius: 'var(--radius-md)', fontWeight: 800 }}>
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
              {items.map(item => (
                <div key={item.id} className="cart-item-card">
                  {/* Thumbnail */}
                  <Link to={`/product/${item.id}`} className="item-thumb">
                    <img
                      src={item.imgUrl || item.image || (item.images && item.images[0]) || '/placeholder.jpg'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="item-details">
                    <div style={{ fontSize: '10px', color: 'var(--gray-1)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '2px' }}>{item.brand}</div>
                    <Link to={`/product/${item.id}`} className="item-name" style={{ color: 'var(--white)', marginBottom: '10px' }}>{item.name}</Link>

                    {/* Qty + Remove row */}
                    <div className="cart-row-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ minWidth: '36px', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="item-price-col">
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{formatCurrency(item.price * item.qty)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-1)', whiteSpace: 'nowrap' }}>{formatCurrency(item.price)} each</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--dark-border)' }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--gray-1)' }}>
                  <span>Subtotal ({items.length} items)</span>
                  <span style={{ color: 'var(--white)', fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--gray-1)' }}>
                  <span>Delivery</span>
                  <span style={{ color: shipping === 0 ? 'var(--success)' : 'var(--white)', fontWeight: 600 }}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--success)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Truck size={14} /> Add {formatCurrency(50000 - subtotal)} more for FREE delivery!
                </div>
              )}

              {/* Coupon */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '0 12px', minWidth: 0 }}>
                    <Tag size={14} color="var(--gray-1)" style={{ flexShrink: 0 }} />
                    <input type="text" placeholder="Coupon code" value={coupon} onChange={e => setCoupon(e.target.value)} style={{ background: 'none', color: 'var(--white)', fontSize: '13px', flex: 1, padding: '10px 0', minWidth: 0 }} />
                  </div>
                  <button style={{ background: 'var(--dark-border)', color: 'var(--white)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none', flexShrink: 0 }}>Apply</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--dark-border)', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>{formatCurrency(total)}</span>
              </div>

              <Link to="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '16px', fontFamily: 'var(--font-display)', boxShadow: '0 8px 24px var(--primary-glow)', marginBottom: '16px' }}>
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gray-2)' }}><ShieldCheck size={12} color="var(--success)" /> Secure</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gray-2)' }}><Truck size={12} color="var(--info)" /> Fast Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
