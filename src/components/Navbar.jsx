import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, User, Heart, ShoppingCart, ShieldCheck,
  Menu, X, Smartphone, Laptop, Tv, Gamepad2, Home as HomeIcon, LayoutGrid
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../pages/Home';
import { listenToCategories } from '../utils/catalogService';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, cartCount, cartTotal, wishlist } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false); setSearchOpen(false); }, [location.pathname]);

  // Scroll detection for shrink effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  // Load departments
  useEffect(() => {
    const unsub = listenToCategories(cats => {
      const tree = {};
      cats.forEach(c => {
        const dept = c.department || c.name;
        if (!tree[dept]) tree[dept] = true;
      });
      setDepartments(Object.keys(tree).slice(0, 6));
    });
    return () => unsub();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getDeptIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('phone') || n.includes('wearable')) return <Smartphone size={16} />;
    if (n.includes('comput') || n.includes('laptop')) return <Laptop size={16} />;
    if (n.includes('tv') || n.includes('audio')) return <Tv size={16} />;
    if (n.includes('gam')) return <Gamepad2 size={16} />;
    if (n.includes('home') || n.includes('appliance')) return <HomeIcon size={16} />;
    return <LayoutGrid size={16} />;
  };

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/shop?sort=featured', label: 'Deals' },
  ];

  return (
    <>
      {/* ── ANNOUNCEMENT TICKER ── */}
      <div className="mc-ticker">
        <div className="mc-ticker-track">
          {['Free delivery on orders over ₦50,000', '⚡ Buy Now, Pay Later Available', '100% Genuine Products', 'Call: 09032272294', 'Flexible Installment Plans', 'Trusted & Secure Payments'].map((t, i) => (
            <span key={i} className="mc-ticker-item">{t}</span>
          ))}
          {/* duplicate for seamless loop */}
          {['Free delivery on orders over ₦50,000', '⚡ Buy Now, Pay Later Available', '100% Genuine Products', 'Call: 09032272294', 'Flexible Installment Plans', 'Trusted & Secure Payments'].map((t, i) => (
            <span key={`d${i}`} className="mc-ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ── FLOATING PILL NAVBAR ── */}
      <div className={`mc-nav-wrapper ${scrolled ? 'scrolled' : ''}`}>
        <nav className="mc-navbar">
          {/* Logo */}
          <Link to="/" className="mc-logo">
            <div className="mc-logo-emblem">
              <span>MC</span>
            </div>
            <div className="mc-logo-text">
              <span className="mc-logo-brand">MAC-CHRISTAR</span>
              <span className="mc-logo-sub">ELECTRONICS</span>
            </div>
          </Link>

          {/* Center Nav Links (Desktop) */}
          <div className="mc-nav-links">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`mc-nav-link ${location.pathname === l.to ? 'active' : ''}`}>{l.label}</Link>
            ))}
            {departments.slice(0, 3).map(dept => (
              <Link key={dept} to={`/shop?dept=${encodeURIComponent(dept)}`} className="mc-nav-link">
                {dept}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="mc-nav-actions">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Search Toggle */}
            <button className="mc-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="mc-icon-btn mc-wishlist-btn" aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="mc-badge">{wishlist.length}</span>}
            </Link>

            {/* Admin */}
            {user?.isAdmin && (
              <Link to="/admin" className="mc-icon-btn mc-admin-btn" aria-label="Admin">
                <ShieldCheck size={20} />
              </Link>
            )}

            {/* Cart – CTA pill */}
            <Link to="/cart" className="mc-cart-pill" aria-label="Cart">
              <ShoppingCart size={18} />
              <span className="mc-cart-amount">{formatCurrency(cartTotal)}</span>
              {cartCount > 0 && <span className="mc-cart-count">{cartCount}</span>}
            </Link>

            {/* Mobile Hamburger */}
            <button className="mc-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </div>

      {/* ── FULLSCREEN SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="mc-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="mc-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="mc-search-form">
              <Search size={22} className="mc-search-icon" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search phones, laptops, TVs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mc-search-input"
              />
              <button type="submit" className="mc-search-submit">Go</button>
            </form>
            <button className="mc-search-close" onClick={() => setSearchOpen(false)}><X size={20} /></button>
          </div>
        </div>
      )}

      {/* ── MOBILE DRAWER ── */}
      {drawerOpen && (
        <div className="mc-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="mc-drawer" onClick={e => e.stopPropagation()}>
            <div className="mc-drawer-header">
              <Link to="/" className="mc-logo" onClick={() => setDrawerOpen(false)}>
                <div className="mc-logo-emblem"><span>MC</span></div>
                <div className="mc-logo-text">
                  <span className="mc-logo-brand">MAC-CHRISTAR</span>
                </div>
              </Link>
              <button className="mc-icon-btn" onClick={() => setDrawerOpen(false)}><X size={22} /></button>
            </div>

            <div className="mc-drawer-section-label">Navigation</div>
            <nav className="mc-drawer-nav">
              <Link to="/shop" className="mc-drawer-link" onClick={() => setDrawerOpen(false)}>Shop All</Link>
              {departments.map(dept => (
                <Link key={dept} to={`/shop?dept=${encodeURIComponent(dept)}`} className="mc-drawer-link" onClick={() => setDrawerOpen(false)}>
                  <span className="mc-drawer-link-icon">{getDeptIcon(dept)}</span>{dept}
                </Link>
              ))}
            </nav>

            <div className="mc-drawer-section-label">Shopping</div>
            <nav className="mc-drawer-nav">
              <Link to="/wishlist" className="mc-drawer-link" onClick={() => setDrawerOpen(false)}>
                <Heart size={16} /> Saved Items ({wishlist.length})
              </Link>
              <Link to="/cart" className="mc-drawer-link mc-drawer-cart" onClick={() => setDrawerOpen(false)}>
                <ShoppingCart size={16} /> Cart · {formatCurrency(cartTotal)} ({cartCount})
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className="mc-drawer-link mc-drawer-admin" onClick={() => setDrawerOpen(false)}>
                  <ShieldCheck size={16} /> Admin Panel
                </Link>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
