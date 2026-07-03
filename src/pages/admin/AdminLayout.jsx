import React, { useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';
import {
  Package, PlusCircle, LogOut, Users, ClipboardList,
  LayoutDashboard, Menu, X, Loader2, Tag, Briefcase, Settings
} from 'lucide-react';

export default function AdminLayout() {
  const { user, authLoading, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
        <Loader2 className="spinner" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
    { to: '/admin/add-product', icon: <PlusCircle size={18} />, label: 'Add Product' },
    { to: '/admin/orders', icon: <ClipboardList size={18} />, label: 'Orders' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/admin/categories', icon: <Tag size={18} />, label: 'Categories' },
    { to: '/admin/brands', icon: <Briefcase size={18} />, label: 'Brands' },
    { to: '/admin/settings', icon: <Settings size={18} />, label: 'Site Settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--black)' }}>
      <Navbar />

      {/* Mobile Header for Admin Toggle */}
      <div style={{ display: 'none', background: 'var(--dark-card)', borderBottom: '1px solid var(--dark-border)', padding: '16px 20px', justifyContent: 'space-between', alignItems: 'center' }} className="admin-mobile-header">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', background: 'linear-gradient(90deg, var(--primary), var(--warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ADMIN PANEL
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'var(--dark-border)', padding: '6px', borderRadius: 'var(--radius-sm)', border: 'none', color: 'var(--white)', cursor: 'pointer', display: 'flex' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Sidebar Overlay (Mobile) */}
        {mobileOpen && (
          <div 
            className="admin-overlay"
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1999, backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`} style={{
          width: '260px', background: 'var(--dark-card)', borderRight: '1px solid var(--dark-border)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          position: 'sticky', top: 0, height: 'calc(100vh - 140px)', overflowY: 'auto'
        }}>
          {/* Logo */}
          <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--dark-border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '15px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
              MAC-CHRISTAR LIMITED
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-dark)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>
              Admin Panel
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-2)', marginTop: '8px', wordBreak: 'break-all' }}>{user.email}</div>
          </div>

          {/* Nav Links */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                  transition: 'var(--transition)',
                  background: isActive ? 'rgba(255,94,0,0.12)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--gray-1)',
                  borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`
                })}
              >
                {link.icon} {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Sign Out */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid var(--dark-border)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '12px', borderRadius: 'var(--radius-sm)',
                background: 'transparent', border: '1px solid var(--dark-border)',
                color: 'var(--gray-1)', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', transition: 'var(--transition)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--dark-border)'; e.currentTarget.style.color = 'var(--gray-1)'; }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowX: 'hidden', overflowY: 'auto' }} className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
