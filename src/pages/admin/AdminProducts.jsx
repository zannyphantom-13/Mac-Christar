import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import {
  Package, PlusCircle, Search, Trash2, Edit, Eye, EyeOff,
  Star, Loader2, SlidersHorizontal
} from 'lucide-react';
import { formatCurrency } from '../Home';

const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Televisions', 'Audio', 'Gaming', 'Accessories', 'Home Appliances'];

function ProductRow({ product, onDelete, onToggleHide, onToggleFeatured }) {
  const [hovered, setHovered] = useState(false);
  const savings = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,94,0,0.03)' : 'var(--dark-card)',
        border: `1px solid ${hovered ? 'rgba(255,94,0,0.3)' : 'var(--dark-border)'}`,
        borderRadius: 'var(--radius-md)', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        transition: 'var(--transition)', position: 'relative',
        opacity: product.is_hidden ? 0.6 : 1
      }}
    >
      {/* Product Image */}
      <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {product.image || product.imgUrl || (product.images && product.images[0]) ? (
          <img src={product.image || product.imgUrl || product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Package size={28} color="var(--gray-2)" />
        )}
      </div>

      {/* Product Info */}
      <div style={{ flex: '1 1 250px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 100%' }}>{product.name}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {product.featured && <span style={{ background: 'rgba(255,206,30,0.15)', color: 'var(--warning)', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>⭐ Featured</span>}
            {product.is_hidden && <span style={{ background: 'rgba(255,61,0,0.15)', color: 'var(--danger)', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>Hidden</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--gray-1)' }}>{product.brand || '—'}</span>
          <span style={{ fontSize: '11px', background: 'rgba(255,94,0,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>{product.category || 'Uncategorized'}</span>
          <span style={{ fontSize: '12px', color: 'var(--gray-1)' }}>Stock: <strong style={{ color: (product.stock || 0) > 0 ? 'var(--success)' : 'var(--danger)' }}>{product.stock ?? 'N/A'}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: '1 1 200px', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        {/* Price */}
        <div style={{ textAlign: 'left', flexShrink: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{formatCurrency(product.price)}</div>
          {product.originalPrice && <div style={{ fontSize: '12px', color: 'var(--gray-2)', textDecoration: 'line-through' }}>{formatCurrency(product.originalPrice)}</div>}
          {savings > 0 && <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>-{savings}%</div>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <Link to={`/admin/edit/${product.id}`} title="Edit Product"
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--dark-border)', background: 'var(--dark)', color: 'var(--gray-1)', transition: 'var(--transition)' }}>
            <Edit size={15} />
          </Link>
          <button onClick={() => onToggleFeatured(product.id, product.featured)} title={product.featured ? 'Unfeature' : 'Feature'}
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${product.featured ? 'var(--warning)' : 'var(--dark-border)'}`, background: product.featured ? 'rgba(255,206,30,0.1)' : 'var(--dark)', color: product.featured ? 'var(--warning)' : 'var(--gray-1)', transition: 'var(--transition)' }}>
            <Star size={15} fill={product.featured ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onToggleHide(product.id, product.is_hidden)} title={product.is_hidden ? 'Show Product' : 'Hide Product'}
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--dark-border)', background: 'var(--dark)', color: product.is_hidden ? 'var(--warning)' : 'var(--gray-1)', transition: 'var(--transition)' }}>
            {product.is_hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button onClick={() => onDelete(product.id, product.name)}
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,61,0,0.3)', background: 'rgba(255,61,0,0.08)', color: 'var(--danger)', transition: 'var(--transition)' }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'products', id));
  };

  const handleToggleHide = async (id, current) => {
    await updateDoc(doc(db, 'products', id), { is_hidden: !current });
  };

  const handleToggleFeatured = async (id, current) => {
    await updateDoc(doc(db, 'products', id), { featured: !current });
  };

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
      const matchCat = filterCat === 'All' || p.category === filterCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

  const stats = [
    { label: 'Total', value: products.length, color: 'var(--white)' },
    { label: 'Featured', value: products.filter(p => p.featured).length, color: 'var(--warning)' },
    { label: 'Hidden', value: products.filter(p => p.is_hidden).length, color: 'var(--danger)' },
    { label: 'On Sale', value: products.filter(p => p.originalPrice).length, color: 'var(--success)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0 }}>Manage Products</h1>
          <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>{products.length} product{products.length !== 1 ? 's' : ''} in your catalogue</p>
        </div>
        <Link to="/admin/add-product" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '12px 22px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '0 4px 16px var(--primary-glow)' }}>
          <PlusCircle size={16} /> Add Product
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', color: 'var(--white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: '1 1 100%' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--gray-2)', alignSelf: 'center' }} />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{ padding: '5px 14px', borderRadius: '20px', border: '1.5px solid', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'var(--transition)', background: filterCat === cat ? 'var(--primary)' : 'transparent', borderColor: filterCat === cat ? 'var(--primary)' : 'var(--dark-border)', color: filterCat === cat ? 'var(--black)' : 'var(--gray-1)' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--dark-border)', background: 'var(--dark)', color: 'var(--white)', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name">A → Z</option>
        </select>
      </div>

      {/* Product List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--gray-1)' }}>Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)' }}>
          <Package size={56} color="var(--gray-2)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--gray-1)', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>{search || filterCat !== 'All' ? 'No products match your filters.' : 'No products yet.'}</p>
          {!search && filterCat === 'All' && (
            <Link to="/admin/add-product" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 800, textDecoration: 'none' }}>
              <PlusCircle size={16} /> Add First Product
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '12px', color: 'var(--gray-2)', marginBottom: '4px' }}>Showing {filtered.length} of {products.length} products</p>
          {filtered.map(product => (
            <ProductRow key={product.id} product={product} onDelete={handleDelete} onToggleHide={handleToggleHide} onToggleFeatured={handleToggleFeatured} />
          ))}
        </div>
      )}
    </div>
  );
}
