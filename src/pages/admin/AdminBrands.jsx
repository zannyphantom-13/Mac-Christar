import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Briefcase, Loader2 } from 'lucide-react';
import {
  listenToBrands, addBrand, updateBrand, deleteBrand, DEFAULT_BRANDS
} from '../../utils/catalogService';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    const unsub = listenToBrands(list => {
      setBrands(list);
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return showToast('Brand name cannot be empty.', 'error');
    if (brands.some(b => b.name.toLowerCase() === name.toLowerCase())) return showToast('Brand already exists.', 'error');
    setLoading(true);
    try {
      await addBrand({ name, order: brands.length });
      setNewName('');
      showToast(`"${name}" added!`);
    } catch { showToast('Failed to add brand.', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!id) return showToast('This is a default brand. Add it first to be able to delete it.', 'error');
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    setLoading(true);
    try {
      await deleteBrand(id);
      showToast(`"${name}" deleted.`);
    } catch { showToast('Failed to delete.', 'error'); }
    finally { setLoading(false); }
  };

  const handleMove = async (index, dir) => {
    const targetIndex = dir === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;
    const newArr = [...brands];
    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
    setLoading(true);
    try {
      for (let i = 0; i < newArr.length; i++) {
        if (newArr[i].id) await updateBrand(newArr[i].id, { order: i });
      }
      showToast('Order updated!');
    } catch { showToast('Failed to update order.', 'error'); }
    finally { setLoading(false); }
  };

  const inputStyle = { flex: 1, background: 'var(--dark)', border: '1.5px solid var(--dark-border)', color: 'var(--white)', padding: '11px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', outline: 'none' };

  return (
    <div>
      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: toast.type === 'success' ? 'rgba(0,230,118,0.15)' : 'rgba(255,61,0,0.15)', border: `1px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--danger)'}`, color: toast.type === 'success' ? 'var(--success)' : '#ff8066', padding: '12px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '14px', backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase size={24} color="var(--primary)" /> Manage Brands
        </h1>
        <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>Brands appear in Shop filters and the product form. Use arrows to reorder.</p>
      </div>

      {/* Add Form */}
      <div style={{ background: 'rgba(255,94,0,0.05)', border: '1px solid rgba(255,94,0,0.2)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Add New Brand</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Dyson, Bose, OnePlus…"
            disabled={loading}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}
          />
          <button
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '11px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '14px', border: 'none', cursor: loading || !newName.trim() ? 'not-allowed' : 'pointer', opacity: loading || !newName.trim() ? 0.6 : 1, whiteSpace: 'nowrap', transition: 'var(--transition)' }}
          >
            {loading ? <Loader2 className="spinner" size={16} /> : <Plus size={16} />} Add
          </button>
        </div>
      </div>

      {/* Brands List */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--dark-border)' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{brands.length} Active Brands</span>
        </div>

        {brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-1)' }}>No brands yet. Add one above!</div>
        ) : (
          brands.map((brand, index) => (
            <div
              key={brand.id || brand.name}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: index < brands.length - 1 ? '1px solid var(--dark-border)' : 'none', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,94,0,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <GripVertical size={16} color="var(--gray-2)" style={{ cursor: 'grab', flexShrink: 0 }} />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{brand.name}</div>
                {!brand.id && <div style={{ fontSize: '11px', color: 'var(--gray-2)', marginTop: '2px' }}>Default • not yet in DB</div>}
                {brand.createdAt && (
                  <div style={{ fontSize: '11px', color: 'var(--gray-2)', marginTop: '2px' }}>
                    Added {new Date(brand.createdAt?.toDate?.() || brand.createdAt).toLocaleDateString('en-GB')}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => handleMove(index, 'up')} disabled={index === 0 || loading}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)', background: 'var(--dark)', color: 'var(--gray-1)', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1, transition: 'var(--transition)' }}
                  title="Move up">
                  <ChevronUp size={15} />
                </button>
                <button onClick={() => handleMove(index, 'down')} disabled={index === brands.length - 1 || loading}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)', background: 'var(--dark)', color: 'var(--gray-1)', cursor: index === brands.length - 1 ? 'not-allowed' : 'pointer', opacity: index === brands.length - 1 ? 0.3 : 1, transition: 'var(--transition)' }}
                  title="Move down">
                  <ChevronDown size={15} />
                </button>
                <button onClick={() => handleDelete(brand.id, brand.name)} disabled={loading}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,61,0,0.25)', background: 'rgba(255,61,0,0.06)', color: 'var(--danger)', cursor: 'pointer', transition: 'var(--transition)', marginLeft: '4px' }}
                  title="Delete brand">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info note */}
      <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(255,206,30,0.06)', border: '1px solid rgba(255,206,30,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--warning)', fontWeight: 600 }}>
        ⚡ Brands automatically appear in the Shop filter bar and the Add Product form. Use arrows to control display order.
      </div>
    </div>
  );
}
