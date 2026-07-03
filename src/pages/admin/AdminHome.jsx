import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ClipboardList, PlusCircle, TrendingUp, Zap, Settings } from 'lucide-react';

export default function AdminHome() {
  const stats = [
    { label: 'Total Products', icon: <Package size={24} />, value: '—', link: '/admin/products', color: 'var(--primary)' },
    { label: 'All Orders', icon: <ClipboardList size={24} />, value: '—', link: '/admin/orders', color: 'var(--info)' },
    { label: 'Registered Users', icon: <Users size={24} />, value: '—', link: '/admin/users', color: 'var(--success)' },
  ];

  const quickActions = [
    { label: 'Add New Product', icon: <PlusCircle size={20} />, link: '/admin/add-product', desc: 'Upload a product to your store' },
    { label: 'Manage Products', icon: <Package size={20} />, link: '/admin/products', desc: 'Edit, feature, or remove products' },
    { label: 'View Orders', icon: <ClipboardList size={20} />, link: '/admin/orders', desc: 'Review and update customer orders' },
    { label: 'View Users', icon: <Users size={20} />, link: '/admin/users', desc: 'See all registered customers' },
    { label: 'Site Settings', icon: <Settings size={20} />, link: '/admin/settings', desc: 'Manage announcement ticker and hero carousel' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, marginBottom: '6px' }}>
          Welcome back, Admin <span style={{ color: 'var(--primary)' }}>⚡</span>
        </h1>
        <p style={{ color: 'var(--gray-1)', fontSize: '14px' }}>Manage your Mac-Christar Limited storefront from here.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(s => (
          <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--dark-border)'}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-1)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {quickActions.map(a => (
          <Link key={a.label} to={a.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(255,94,0,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--dark-border)'; e.currentTarget.style.background = 'var(--dark-card)'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,94,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--white)', marginBottom: '3px' }}>{a.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-1)' }}>{a.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
