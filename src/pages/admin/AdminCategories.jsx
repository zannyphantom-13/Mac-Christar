import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Tag, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  listenToCategories, addCategory, deleteCategory, updateCategory, seedTaxonomy
} from '../../utils/catalogService';

// Build initial tree from DB additions only
function buildTree(dbCats) {
  const tree = {};

  // Merge DB custom entries
  dbCats.forEach(c => {
    if (!c.department) return; // legacy flat category
    if (!tree[c.department]) tree[c.department] = {};
    if (c.type === 'department') return; // dept already created
    if (c.type === 'category' || (!c.subcategory && c.category)) {
      if (!tree[c.department][c.category]) tree[c.department][c.category] = [];
    }
    if (c.type === 'subcategory' || c.subcategory) {
      if (!tree[c.department]) tree[c.department] = {};
      if (!tree[c.department][c.category]) tree[c.department][c.category] = [];
      if (!tree[c.department][c.category].includes(c.subcategory)) {
        tree[c.department][c.category].push(c.subcategory);
      }
    }
  });
  return tree;
}

const iStyles = {
  input: {
    flex: 1, background: 'var(--dark)', border: '1.5px solid var(--dark-border)',
    color: 'var(--white)', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    fontSize: '13px', outline: 'none'
  },
  btn: (disabled) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    background: disabled ? 'var(--dark-border)' : 'var(--primary)',
    color: disabled ? 'var(--gray-2)' : 'var(--black)',
    padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 800,
    fontSize: '13px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap', transition: 'var(--transition)'
  })
};

export default function AdminCategories() {
  const [dbCats, setDbCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Add form state
  const [newDept, setNewDept] = useState('');
  const [newCat, setNewCat] = useState('');
  const [newSub, setNewSub] = useState('');
  const [selDept, setSelDept] = useState('');
  const [selCat, setSelCat] = useState('');

  // Expand state for UI tree
  const [expanded, setExpanded] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    const unsub = listenToCategories(cats => setDbCats(cats));
    return () => unsub();
  }, []);

  const tree = buildTree(dbCats);
  const allDepts = Object.keys(tree);
  const catsForDept = selDept ? Object.keys(tree[selDept] || {}) : [];

  const handleAddDept = async () => {
    const name = newDept.trim();
    if (!name) return showToast('Department name is required', 'error');
    if (tree[name]) return showToast('Department already exists', 'error');
    setLoading(true);
    try {
      await addCategory({ type: 'department', department: name, name, order: 99 });
      setNewDept('');
      showToast(`Department "${name}" added!`);
    } catch { showToast('Failed to add department', 'error'); }
    finally { setLoading(false); }
  };

  const handleAddCategory = async () => {
    const dept = selDept.trim();
    const name = newCat.trim();
    if (!dept) return showToast('Select a department first', 'error');
    if (!name) return showToast('Category name is required', 'error');
    if (tree[dept]?.[name] !== undefined) return showToast('Category already exists', 'error');
    setLoading(true);
    try {
      await addCategory({ type: 'category', department: dept, category: name, name, order: 99 });
      setNewCat('');
      showToast(`Category "${name}" added under ${dept}!`);
    } catch { showToast('Failed to add category', 'error'); }
    finally { setLoading(false); }
  };

  const handleAddSubcategory = async () => {
    const dept = selDept.trim();
    const cat = selCat.trim();
    const name = newSub.trim();
    if (!dept) return showToast('Select a department first', 'error');
    if (!cat) return showToast('Select a category first', 'error');
    if (!name) return showToast('Subcategory name is required', 'error');
    if (tree[dept]?.[cat]?.includes(name)) return showToast('Subcategory already exists', 'error');
    setLoading(true);
    try {
      await addCategory({ type: 'subcategory', department: dept, category: cat, subcategory: name, name, order: 99 });
      setNewSub('');
      showToast(`Subcategory "${name}" added!`);
    } catch { showToast('Failed to add subcategory', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (dbId, label) => {
    if (!window.confirm(`Delete "${label}"?`)) return;
    setLoading(true);
    try {
      await deleteCategory(dbId);
      showToast(`"${label}" deleted.`);
    } catch { showToast('Failed to delete', 'error'); }
    finally { setLoading(false); }
  };

  // Get DB record for a specific item
  const getDbRecord = (dept, cat, sub) => dbCats.find(c => {
    if (sub) return c.type === 'subcategory' && c.department === dept && c.category === cat && c.subcategory === sub;
    if (cat) return c.type === 'category' && c.department === dept && c.category === cat;
    return c.type === 'department' && c.department === dept;
  });

  const handleSeed = async () => {
    if (!window.confirm("This will add the default taxonomy to the database. Proceed?")) return;
    setLoading(true);
    try {
      await seedTaxonomy();
      showToast("Taxonomy seeded successfully!");
    } catch (e) {
      showToast("Failed to seed taxonomy", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggle = key => setExpanded(e => ({ ...e, [key]: !e[key] }));

  const labelStyle = { fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', display: 'block', marginBottom: '8px' };

  return (
    <div>
      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: toast.type === 'success' ? 'rgba(0,230,118,0.15)' : 'rgba(255,61,0,0.15)', border: `1px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--danger)'}`, color: toast.type === 'success' ? 'var(--success)' : '#ff8066', padding: '12px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '14px', backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tag size={24} color="var(--primary)" /> Manage Categories
          </h1>
          <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>Build your full Department → Category → Subcategory taxonomy. These appear in the Shop sidebar and Add Product form.</p>
        </div>
        <button onClick={handleSeed} disabled={loading} style={iStyles.btn(loading)}>
          {loading ? <Loader2 className="spinner" size={14} /> : null} Seed Taxonomy
        </button>
      </div>

      {/* ── ADD FORMS ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>

        {/* Add Department */}
        <div style={{ background: 'rgba(255,94,0,0.05)', border: '1px solid rgba(255,94,0,0.2)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
          <label style={labelStyle}>➕ Add Department</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={newDept} onChange={e => setNewDept(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDept()}
              placeholder="e.g. Smart Home" disabled={loading} style={iStyles.input}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
            <button onClick={handleAddDept} disabled={loading || !newDept.trim()} style={iStyles.btn(loading || !newDept.trim())}>
              {loading ? <Loader2 className="spinner" size={14} /> : <Plus size={14} />} Add
            </button>
          </div>
        </div>

        {/* Add Category */}
        <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
          <label style={{ ...labelStyle, color: '#7c3aed' }}>➕ Add Category</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select value={selDept} onChange={e => { setSelDept(e.target.value); setSelCat(''); }}
              style={{ ...iStyles.input, flex: 'unset' }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
              <option value="">— Select Department —</option>
              {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                placeholder="e.g. Wearables" disabled={!selDept || loading} style={{ ...iStyles.input, opacity: !selDept ? 0.5 : 1 }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              <button onClick={handleAddCategory} disabled={loading || !selDept || !newCat.trim()} style={iStyles.btn(loading || !selDept || !newCat.trim())}>
                {loading ? <Loader2 className="spinner" size={14} /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>
        </div>

        {/* Add Subcategory */}
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
          <label style={{ ...labelStyle, color: '#10b981' }}>➕ Add Subcategory</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select value={selDept} onChange={e => { setSelDept(e.target.value); setSelCat(''); }}
              style={{ ...iStyles.input, flex: 'unset' }}
              onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
              <option value="">— Select Department —</option>
              {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selCat} onChange={e => setSelCat(e.target.value)} disabled={!selDept}
              style={{ ...iStyles.input, flex: 'unset', opacity: !selDept ? 0.5 : 1 }}
              onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
              <option value="">— Select Category —</option>
              {catsForDept.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSubcategory()}
                placeholder="e.g. Bone Conduction" disabled={!selCat || loading} style={{ ...iStyles.input, opacity: !selCat ? 0.5 : 1 }}
                onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              <button onClick={handleAddSubcategory} disabled={loading || !selCat || !newSub.trim()} style={iStyles.btn(loading || !selCat || !newSub.trim())}>
                {loading ? <Loader2 className="spinner" size={14} /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAXONOMY TREE DISPLAY ──────────────────────────── */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {allDepts.length} Departments
          </span>
          <span style={{ fontSize: '11px', color: 'var(--gray-2)' }}>All items are deletable</span>
        </div>

        {allDepts.map((dept, di) => {
          const deptRec = getDbRecord(dept, null, null);
          const isExpanded = expanded[dept] !== false; // default open
          return (
            <div key={dept} style={{ borderBottom: di < allDepts.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
              {/* Department Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'rgba(255,94,0,0.03)', cursor: 'pointer' }}
                onClick={() => toggle(dept)}>
                {isExpanded ? <ChevronDown size={15} color="var(--primary)" /> : <ChevronRight size={15} color="var(--primary)" />}
                <span style={{ fontWeight: 800, fontSize: '14px', flex: 1 }}>{dept}</span>
                <button onClick={e => { e.stopPropagation(); handleDelete(deptRec?.id, dept); }}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,61,0,0.25)', background: 'rgba(255,61,0,0.06)', color: 'var(--danger)', cursor: 'pointer' }}>
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Categories */}
              {isExpanded && Object.entries(tree[dept] || {}).map(([cat, subs]) => {
                const catRec = getDbRecord(dept, cat, null);
                const catKey = `${dept}::${cat}`;
                const catExpanded = expanded[catKey] !== false;
                return (
                  <div key={cat} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px 10px 40px', cursor: 'pointer' }}
                      onClick={() => toggle(catKey)}>
                      {catExpanded ? <ChevronDown size={13} color="#7c3aed" /> : <ChevronRight size={13} color="#7c3aed" />}
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gray-1)', flex: 1 }}>{cat}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gray-2)' }}>{subs.length} sub</span>
                      <button onClick={e => { e.stopPropagation(); handleDelete(catRec?.id, cat); }}
                        style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,61,0,0.25)', background: 'rgba(255,61,0,0.06)', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Subcategories */}
                    {catExpanded && subs.map(sub => {
                      const subRec = getDbRecord(dept, cat, sub);
                      return (
                        <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 20px 7px 64px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-2)', flex: 1 }}>{sub}</span>
                          <button onClick={() => handleDelete(subRec?.id, sub)}
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,61,0,0.25)', background: 'rgba(255,61,0,0.06)', color: 'var(--danger)', cursor: 'pointer' }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>


    </div>
  );
}
