import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from './Home';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useApp();

  return (
    <main className="main-content" style={{ padding: '28px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Heart size={28} color="var(--primary)" /> Saved Items
          <span style={{ fontSize: '16px', color: 'var(--gray-1)', fontWeight: 400 }}>({wishlist.length} items)</span>
        </h1>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)' }}>
            <Heart size={80} color="var(--gray-2)" strokeWidth={1} style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--gray-1)', marginBottom: '24px' }}>Save items you love to keep track of them here.</p>
            <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '14px 28px', borderRadius: 'var(--radius-md)', fontWeight: 800 }}>
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="shop-grid">
            {wishlist.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-img-wrap">
                  <img src={product.imgUrl || product.image || (product.images && product.images[0]) || '/placeholder.jpg'} alt={product.name} />
                  <button 
                    className="wishlist-btn" 
                    style={{ background: 'rgba(255, 94, 0, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <Heart size={18} fill="var(--primary)" />
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-brand">{product.brand}</div>
                  <Link to={`/product/${product.id}`} className="product-title">{product.name}</Link>
                  <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="count">(42)</span>
                  </div>
                  <div className="product-price-row">
                    <div className="product-price">{formatCurrency(product.price)}</div>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => {
                      addToCart(product);
                    }}
                  >
                    <ShoppingCart size={18} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
