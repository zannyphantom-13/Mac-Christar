import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Heart, ShoppingCart, ShieldCheck,
  Menu, X, Phone, MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../pages/Home';
import { listenToCategories } from '../utils/catalogService';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, cartCount, cartTotal, wishlist } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    const unsub = listenToCategories(cats => {
      const tree = {};
      cats.forEach(c => {
        const dept = c.department || c.name;
        if (!tree[dept]) tree[dept] = true;
      });
      setDepartments(Object.keys(tree).slice(0, 7));
    });
    return () => unsub();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ── TOP INFO BAR ── */}
      <div className="mc-top-bar">
        <div className="mc-top-bar-left">
          <Phone size={13} />
          <span>Need Help? Call <a href="tel:09032272294">09032272294</a></span>
        </div>
        <div className="mc-top-bar-right">
          <a href="#">Track Order</a>
          <a href="#">Buyer Protection</a>
          <a href="#"><MapPin size={12} style={{ verticalAlign: 'middle' }} /> Store Locations</a>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="mc-header">
        <div className="mc-header-inner">

          {/* Logo */}
          <Link to="/" className="mc-logo" aria-label="Mac-Christar Home">
            MAC-CHRISTAR<span className="mc-logo-dot">.</span>
          </Link>

          {/* Inline Search Bar */}
          <form className="mc-search-bar" onSubmit={handleSearch} role="search">
            <input
              type="text"
              placeholder="Search for electronics, brands, models..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <Search size={20} />
            </button>
          </form>

          {/* Right Actions */}
          <div className="mc-nav-actions">
            <ThemeToggle />

            <Link to="/wishlist" className="mc-nav-action-item" aria-label="Wishlist">
              <div className="mc-nav-action-icon-wrap">
                <Heart size={26} strokeWidth={1.5} />
                {wishlist.length > 0 && <span className="mc-nav-badge">{wishlist.length}</span>}
              </div>
              <span className="mc-nav-action-label">Saved</span>
            </Link>

            <Link to="/cart" className="mc-nav-action-item" aria-label="Cart">
              <div className="mc-nav-action-icon-wrap">
                <ShoppingCart size={26} strokeWidth={1.5} />
                {cartCount > 0 && <span className="mc-nav-badge">{cartCount}</span>}
              </div>
              <span className="mc-nav-action-label">Cart</span>
            </Link>

            {user?.isAdmin && (
              <Link to="/admin" className="mc-nav-action-item mc-admin-action" aria-label="Admin Panel">
                <div className="mc-nav-action-icon-wrap">
                  <ShieldCheck size={26} strokeWidth={1.5} />
                </div>
                <span className="mc-nav-action-label">Admin</span>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button className="mc-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* ── CATEGORY NAV STRIP ── */}
        <nav className="mc-cat-nav" aria-label="Category navigation">
          <div className="mc-cat-nav-inner">
            <Link to="/shop" className="mc-cat-nav-link mc-cat-nav-all">All Products</Link>
            {departments.map(dept => (
              <Link key={dept} to={`/shop?dept=${encodeURIComponent(dept)}`} className="mc-cat-nav-link">
                {dept}
              </Link>
            ))}
            <Link to="/shop?sort=featured" className="mc-cat-nav-link mc-cat-nav-deals">⚡ Flash Deals</Link>
          </div>
        </nav>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {drawerOpen && (
        <div className="mc-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="mc-drawer" onClick={e => e.stopPropagation()}>
            <div className="mc-drawer-header">
              <Link to="/" className="mc-logo" onClick={() => setDrawerOpen(false)}>
                MAC-CHRISTAR<span className="mc-logo-dot">.</span>
              </Link>
              <button className="mc-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>

            {/* Mobile Search */}
            <form className="mc-drawer-search" onSubmit={e => { handleSearch(e); setDrawerOpen(false); }}>
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button type="submit" aria-label="Search"><Search size={16} /></button>
            </form>

            <div className="mc-drawer-section-label">Shop Categories</div>
            <nav className="mc-drawer-nav">
              <Link to="/shop" className="mc-drawer-link" onClick={() => setDrawerOpen(false)}>All Products</Link>
              {departments.map(dept => (
                <Link key={dept} to={`/shop?dept=${encodeURIComponent(dept)}`} className="mc-drawer-link" onClick={() => setDrawerOpen(false)}>
                  {dept}
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
