import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { listenToCategories, listenToBrands } from '../../utils/catalogService';
import { categoryTaxonomy, categorySpecs } from '../../data/taxonomy';
import {
  ArrowLeft, Save, Image as ImageIcon, AlertCircle, FileText, List,
  Tag, DollarSign, Star, Upload, X, CheckCircle2, Sparkles, Infinity, Loader2, Package
} from 'lucide-react';
import { uploadImage } from '../../utils/cloudinaryService';
import { useApp } from '../../context/AppContext';

const TAGS = ['', 'Best Seller', 'New Arrival', 'Hot Deal', 'Top Rated', 'Trending', 'Clearance', 'Premium', 'Limited'];

function FieldGroup({ label, icon, accent = 'var(--primary)', children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent }}>
        {icon} {label}
      </label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: '11px', color: 'var(--gray-2)' }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)',
  borderRadius: 'var(--radius-sm)', padding: '11px 16px', fontSize: '14px',
  fontWeight: 500, color: 'var(--white)', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
};

export default function AdminAddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const isEditing = !!id;
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: '', department: '', category: '', subcategory: '', brand: '', description: '',
    overview: '', colors: [], features: [],
    price: '', originalPrice: '', badge: '', stock: 0,
    unlimited_stock: false, is_hidden: false, featured: false, featuredPosition: ''
  });
  const [colorInput, setColorInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [customSpecKey, setCustomSpecKey] = useState('');
  const [customSpecValue, setCustomSpecValue] = useState('');
  const [specs, setSpecs] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [positionInput, setPositionInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch catalogs
  useEffect(() => {
    const unsubCats = listenToCategories(setCategories);
    const unsubBrands = listenToBrands(setBrands);
    return () => { unsubCats(); unsubBrands(); };
  }, []);

  // Fetch existing product data if editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const rawColors = data.colors || [];
          const normalizedColors = rawColors.map(c => typeof c === 'string' ? { name: c, image: null, file: null } : c);
          setFormData({ ...data, price: String(data.price || ''), originalPrice: String(data.originalPrice || ''), stock: String(data.stock || 0), colors: normalizedColors, features: data.features || [] });
          if (data.specs) setSpecs(data.specs);
          if (data.images && data.images.length > 0) {
            setImagePreviews(data.images);
          } else if (data.image || data.imgUrl || data.img) {
            setImagePreviews([data.image || data.imgUrl || data.img]);
          }
          if (data.featured) setPositionInput(String(data.featuredPosition || ''));
        } else {
          setError('Product not found.');
        }
      } catch (e) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEditing]);

  // Fetch featured products list
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('featured', '==', true));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.featuredPosition || 999) - (b.featuredPosition || 999));
        setFeaturedProducts(list);
      } catch {}
    };
    fetchFeatured();
  }, []);

  const taxonomyTree = React.useMemo(() => {
    const tree = {};

    categories.forEach(c => {
      const dept = c.department || c.name;
      if (!tree[dept]) tree[dept] = {};
      
      if (c.type === 'department') return;
      
      const cat = c.category;
      if (cat || c.type === 'category') {
        const catName = cat || c.name;
        if (!tree[dept][catName]) tree[dept][catName] = [];
        
        if (c.subcategory) {
          if (!tree[dept][catName].includes(c.subcategory)) {
            tree[dept][catName].push(c.subcategory);
          }
        }
      }
    });
    return tree;
  }, [categories]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(p => {
      const updated = { ...p, [name]: type === 'checkbox' ? checked : value };
      if (name === 'department') {
        updated.category = taxonomyTree[value] ? Object.keys(taxonomyTree[value])[0] || '' : '';
        updated.subcategory = taxonomyTree[value]?.[updated.category]?.[0] || '';
      }
      if (name === 'category') {
        updated.subcategory = taxonomyTree[p.department]?.[value]?.[0] || '';
      }
      return updated;
    });
  };

  const processFiles = files => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const clearImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFeaturedToggle = () => {
    if (!formData.featured) {
      setPositionInput(String(featuredProducts.length + 1));
      setShowFeaturedModal(true);
    } else {
      setFormData(p => ({ ...p, featured: false, featuredPosition: '' }));
    }
  };

  const handleSetFeaturedPosition = () => {
    if (!positionInput || isNaN(positionInput)) { showToast('Please enter a valid position.', 'error'); return; }
    setFormData(p => ({ ...p, featured: true, featuredPosition: positionInput }));
    setShowFeaturedModal(false);
  };

  const handleAddColor = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const c = colorInput.trim();
      if (c && !(formData.colors || []).some(col => col.name === c)) {
        setFormData(p => ({ ...p, colors: [...(p.colors || []), { name: c, image: null, file: null }] }));
      }
      setColorInput('');
    }
  };

  const handleRemoveColor = (colName) => {
    setFormData(p => ({ ...p, colors: (p.colors || []).filter(c => c.name !== colName) }));
  };

  const handleColorImageChange = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(p => {
        const newColors = [...p.colors];
        newColors[index] = { ...newColors[index], image: reader.result, file: file };
        return { ...p, colors: newColors };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddFeature = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const f = featureInput.trim();
      if (f && !(formData.features || []).includes(f)) {
        setFormData(p => ({ ...p, features: [...(p.features || []), f] }));
      }
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feat) => {
    setFormData(p => ({ ...p, features: (p.features || []).filter(f => f !== feat) }));
  };

  const handleAddCustomSpec = () => {
    const key = customSpecKey.trim();
    const val = customSpecValue.trim();
    if (key && val) {
      setSpecs(p => ({ ...p, [key]: val }));
      setCustomSpecKey('');
      setCustomSpecValue('');
    }
  };

  const handleRemoveCustomSpec = (key) => {
    setSpecs(p => {
      const newSpecs = { ...p };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let imageUrls = [];
      
      // Keep existing non-file previews (from DB)
      const existingUrls = imagePreviews.filter(p => p.startsWith('http'));
      imageUrls.push(...existingUrls);

      // Upload new files
      for (const file of imageFiles) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }

      if (imageUrls.length === 0 && !isEditing) throw new Error('At least one product image is required.');

      // Upload color images if any
      const finalColors = [];
      for (const col of formData.colors || []) {
        if (col.file) {
          const url = await uploadImage(col.file);
          finalColors.push({ name: col.name, image: url || col.image });
        } else {
          finalColors.push({ name: col.name, image: col.image });
        }
      }

      const payload = {
        name: formData.name,
        brand: formData.brand || '',
        department: formData.department,
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description || '',
        overview: formData.overview || '',
        colors: finalColors,
        features: formData.features || [],
        specs: specs,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        badge: formData.badge || null,
        stock: formData.unlimited_stock ? 9999 : Number(formData.stock || 0),
        unlimited_stock: formData.unlimited_stock,
        is_hidden: formData.is_hidden,
        featured: formData.featured,
        featuredPosition: formData.featured ? (Number(positionInput) || 0) : null,
        images: imageUrls,
        image: imageUrls[0] || '', imgUrl: imageUrls[0] || '',
        rating: formData.rating || 5,
        reviews: formData.reviews || 0,
        updatedAt: new Date(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', id), payload);
      } else {
        const newRef = doc(collection(db, 'products'));
        payload.createdAt = new Date();
        payload.sales = 0;
        await setDoc(newRef, payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const hasDiscount = formData.originalPrice && formData.price && Number(formData.price) < Number(formData.originalPrice);
  const discountPct = hasDiscount ? Math.round(100 - (Number(formData.price) / Number(formData.originalPrice)) * 100) : 0;
  const stockOk = formData.unlimited_stock || Number(formData.stock || 0) > 0;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '760px' }}>
      <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', transition: 'var(--transition)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-1)'}
      >
        <ArrowLeft size={15} /> Back to Products
      </Link>

      {/* Card Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #2d1100)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Product Management</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
            {isEditing ? '✏️ Edit Product' : '✨ Add New Product'}
          </h1>
        </div>
        {imagePreviews.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {imagePreviews.slice(0, 3).map((img, i) => (
              <div key={i} style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(255,94,0,0.3)', flexShrink: 0 }}>
                <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {imagePreviews.length > 3 && (
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', border: '2px solid rgba(255,94,0,0.3)' }}>
                +{imagePreviews.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Card */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '32px' }}>
        {error && (
          <div style={{ background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff8066', fontWeight: 600, fontSize: '14px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Name */}
          <FieldGroup label="Product Name" icon={<Tag size={14} />} accent="var(--primary)">
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. iPhone 15 Pro Max" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
          </FieldGroup>

          {/* ── SECTION: Classification ───────────────────────── */}
          <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Tag size={14} color="#7c3aed" />
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed' }}>Classification</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '12px' }}>
              <FieldGroup label="Department" icon={<Tag size={12} />} accent="#7c3aed">
                <select name="department" value={formData.department} onChange={handleChange} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                  <option value="" disabled>Select department...</option>
                  {Object.keys(taxonomyTree).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Category" icon={<Tag size={12} />} accent="#7c3aed">
                <select name="category" value={formData.category} onChange={handleChange}
                  disabled={!taxonomyTree[formData.department] || Object.keys(taxonomyTree[formData.department]).length === 0}
                  style={{ ...inputStyle, opacity: (!taxonomyTree[formData.department] || Object.keys(taxonomyTree[formData.department]).length === 0) ? 0.5 : 1 }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                  <option value="">— No Category —</option>
                  {taxonomyTree[formData.department] && Object.keys(taxonomyTree[formData.department]).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Subcategory" icon={<Tag size={12} />} accent="#7c3aed">
                <select name="subcategory" value={formData.subcategory} onChange={handleChange}
                  disabled={!taxonomyTree[formData.department]?.[formData.category] || taxonomyTree[formData.department]?.[formData.category]?.length === 0}
                  style={{ ...inputStyle, opacity: (!taxonomyTree[formData.department]?.[formData.category] || taxonomyTree[formData.department]?.[formData.category]?.length === 0) ? 0.5 : 1 }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                  <option value="">— No Subcategory —</option>
                  {taxonomyTree[formData.department]?.[formData.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </FieldGroup>
            </div>
            {/* Breadcrumb preview */}
            <div style={{ fontSize: '11px', color: 'var(--gray-2)', background: 'rgba(0,0,0,0.25)', padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace' }}>
              📂 {[formData.department, formData.category, formData.subcategory].filter(Boolean).join(' › ') || '…'}
            </div>
          </div>

          {/* Brand / Badge */}
          <div className="responsive-grid-2" style={{ gap: '16px' }}>
            <FieldGroup label="Brand" icon={<Tag size={14} />} accent="#10b981">
              <select name="brand" value={formData.brand} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                <option value="" disabled>Select brand...</option>
                {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Product Tag" icon={<Sparkles size={14} />} accent="#ec4899">
              <select name="badge" value={formData.badge || ''} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#ec4899'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                {TAGS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
              </select>
            </FieldGroup>
          </div>

          {/* Colors */}
          <FieldGroup label="Available Colors" icon={<Tag size={14} />} accent="#3b82f6" hint="Type a color and press Enter to add">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input type="text" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={handleAddColor} placeholder="e.g. Midnight Black, Rose Gold..." style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              {(formData.colors && formData.colors.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.colors.map((col, idx) => (
                    <div key={col.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{col.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#3b82f6', cursor: 'pointer', background: 'rgba(59,130,246,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                          <ImageIcon size={12} /> {col.image ? 'Change Image' : 'Add Image'}
                          <input type="file" accept="image/*" onChange={e => handleColorImageChange(idx, e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                        {col.image && (
                          <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
                            <img src={col.image} alt={col.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <button type="button" onClick={() => handleRemoveColor(col.name)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>

          {/* ── SECTION: Overview & Content ─────────────────────── */}
          <div style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={14} color="#8b5cf6" />
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8b5cf6' }}>Overview &amp; Content</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FieldGroup label="Product Overview" icon={<FileText size={14} />} accent="#8b5cf6" hint="Short blurb shown on the Overview tab of the product page">
                <textarea name="overview" value={formData.overview || ''} onChange={handleChange} rows={3}
                  placeholder="e.g. Experience premium performance with the latest flagship — designed for speed, style and all-day battery life."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              </FieldGroup>
              <FieldGroup label="Features / Long Description" icon={<Sparkles size={14} />} accent="#8b5cf6" hint="Detailed feature list, bullet points, specs narrative">
                <textarea name="description" value={formData.description} onChange={handleChange} rows={5}
                  placeholder="Enter product features and specs…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              </FieldGroup>
              <FieldGroup label="Key Features (Bullet Points)" icon={<List size={14} />} accent="#8b5cf6" hint="Type a feature and press Enter to add">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={handleAddFeature} placeholder="e.g. Up to 30 hours of battery life with quick charging." style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
                  {(formData.features && formData.features.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {formData.features.map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '13px', color: 'var(--white)' }}>• {feat}</span>
                          <button type="button" onClick={() => handleRemoveFeature(feat)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FieldGroup>
            </div>
          </div>

          {/* ── SECTION: Specifications ───────────────────────────── */}
          {(() => {
            const specKey = formData.subcategory || formData.category;
            const specFields = categorySpecs[specKey] || categorySpecs[formData.category] || [];
            return (
              <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <List size={14} color="#7c3aed" />
                  <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed' }}>
                    Specifications{specKey ? ` — ${specKey}` : ''}
                  </span>
                  {specFields.length > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--gray-2)', marginLeft: 'auto', fontStyle: 'italic' }}>* required &nbsp;·&nbsp; (optional) can be skipped</span>
                  )}
                </div>
                {specFields.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--dark-border)', borderRadius: 'var(--radius-sm)', color: 'var(--gray-2)', fontSize: '13px' }}>
                    ℹ️ Select <strong style={{ color: 'var(--white)' }}>Department → Category → Subcategory</strong> above to reveal spec fields for this product type
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                    {specFields.map(field => (
                      <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: field.optional ? 'var(--gray-1)' : '#7c3aed' }}>
                          {field.label}{' '}
                          {field.optional
                            ? <span style={{ color: 'var(--gray-2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '10px' }}>(optional)</span>
                            : <span style={{ color: 'var(--danger)' }}>*</span>
                          }
                        </label>
                        {field.type === 'select' ? (
                          /* Combo: pick from list OR type custom value */
                          <>
                            <input
                              list={`dl-${field.id}`}
                              value={specs[field.id] || ''}
                              onChange={e => setSpecs(p => ({ ...p, [field.id]: e.target.value }))}
                              placeholder={`Select or type custom…`}
                              style={{ ...inputStyle, borderColor: specs[field.id] ? '#7c3aed' : 'var(--dark-border)' }}
                              onFocus={e => e.target.style.borderColor = '#7c3aed'}
                              onBlur={e => e.target.style.borderColor = specs[field.id] ? '#7c3aed' : 'var(--dark-border)'}
                            />
                            <datalist id={`dl-${field.id}`}>
                              {field.options.map(opt => <option key={opt} value={opt} />)}
                            </datalist>
                          </>
                        ) : (
                          <input type={field.type === 'number' ? 'number' : 'text'}
                            value={specs[field.id] || ''}
                            onChange={e => setSpecs(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder || ''}
                            style={{ ...inputStyle, borderColor: specs[field.id] ? '#7c3aed' : 'var(--dark-border)' }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = specs[field.id] ? '#7c3aed' : 'var(--dark-border)'} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Specs Section */}
                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', marginBottom: '12px' }}>
                    Custom Specifications
                  </div>
                  
                  {/* Display existing custom specs */}
                  {Object.keys(specs).filter(k => !specFields.find(f => f.id === k)).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {Object.keys(specs).filter(k => !specFields.find(f => f.id === k)).map(k => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
                          <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', width: '120px' }}>{k}</span>
                            <span style={{ fontSize: '13px', color: 'var(--white)' }}>{specs[k]}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveCustomSpec(k)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new custom spec form */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={customSpecKey} onChange={e => setCustomSpecKey(e.target.value)} placeholder="Spec Name (e.g. Refresh Rate)" style={{ ...inputStyle, marginBottom: '8px' }} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input type="text" value={customSpecValue} onChange={e => setCustomSpecValue(e.target.value)} placeholder="Value (e.g. 120Hz)" style={inputStyle} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSpec())} />
                    </div>
                    <button type="button" onClick={handleAddCustomSpec} disabled={!customSpecKey.trim() || !customSpecValue.trim()} style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)', height: '44px', padding: '0 16px', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: (!customSpecKey.trim() || !customSpecValue.trim()) ? 'not-allowed' : 'pointer', opacity: (!customSpecKey.trim() || !customSpecValue.trim()) ? 0.5 : 1 }}>
                      Add
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Price / Original Price */}
          <div className="responsive-grid-2" style={{ gap: '16px' }}>
            <FieldGroup label="Selling Price (₦)" icon={<DollarSign size={14} />} accent="#1d4ed8">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', fontWeight: 700, fontSize: '14px' }}>₦</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="0" style={{ ...inputStyle, paddingLeft: '34px' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              </div>
            </FieldGroup>
            <FieldGroup label="Original Price (₦) — for sale" icon={<DollarSign size={14} />} accent="var(--danger)" hint="Leave empty if no discount">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', fontWeight: 700, fontSize: '14px' }}>₦</span>
                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="0" style={{ ...inputStyle, paddingLeft: '34px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--danger)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
                {hasDiscount && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--danger)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '20px' }}>
                    -{discountPct}% OFF
                  </span>
                )}
              </div>
            </FieldGroup>
          </div>

          {/* Inventory & Visibility */}
          <div className="responsive-grid-4" style={{ gap: '16px' }}>
            <FieldGroup label="Stock Qty" icon={<Tag size={14} />} accent="#059669">
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" disabled={formData.unlimited_stock} placeholder="0" style={{ ...inputStyle, opacity: formData.unlimited_stock ? 0.5 : 1 }}
                onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
            </FieldGroup>
            <FieldGroup label="Unlimited Stock" icon={<Infinity size={14} />} accent="#059669">
              <div style={{ display: 'flex', alignItems: 'center', height: '43px', paddingLeft: '12px', background: formData.unlimited_stock ? 'rgba(5,150,105,0.1)' : 'var(--dark)', border: `1.5px solid ${formData.unlimited_stock ? '#059669' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => setFormData(p => ({ ...p, unlimited_stock: !p.unlimited_stock }))}>
                <input type="checkbox" name="unlimited_stock" checked={formData.unlimited_stock} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }} />
                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 600, color: formData.unlimited_stock ? '#059669' : 'var(--gray-1)' }}>Unlimited</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Stock Status" icon={<CheckCircle2 size={14} />} accent="#059669">
              <div style={{ display: 'flex', alignItems: 'center', height: '43px', paddingLeft: '12px', background: stockOk ? 'rgba(0,230,118,0.08)' : 'rgba(255,61,0,0.08)', border: `1.5px solid ${stockOk ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 700, color: stockOk ? 'var(--success)' : 'var(--danger)' }}>
                {stockOk ? '✓ In Stock' : '✗ Out of Stock'}
              </div>
            </FieldGroup>
            <FieldGroup label="Visibility" icon={<AlertCircle size={14} />} accent="var(--danger)">
              <div style={{ display: 'flex', alignItems: 'center', height: '43px', paddingLeft: '12px', background: formData.is_hidden ? 'rgba(255,61,0,0.08)' : 'var(--dark)', border: `1.5px solid ${formData.is_hidden ? 'var(--danger)' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => setFormData(p => ({ ...p, is_hidden: !p.is_hidden }))}>
                <input type="checkbox" name="is_hidden" checked={formData.is_hidden} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--danger)' }} />
                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 600, color: formData.is_hidden ? 'var(--danger)' : 'var(--gray-1)' }}>Hide Product</span>
              </div>
            </FieldGroup>
          </div>

          {/* Image Upload */}
          <FieldGroup label={`Product Images (${imagePreviews.length})`} icon={<ImageIcon size={14} />} accent="var(--warning)">
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', padding: '40px', background: dragOver ? 'rgba(255,94,0,0.05)' : 'var(--dark)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,94,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={24} color="var(--primary)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Drop images here or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse</span></p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gray-1)' }}>Upload multiple PNG, JPG, WEBP up to 10MB each</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => processFiles(e.target.files)} style={{ display: 'none' }} />
            
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '12px 0' }}>
                {imagePreviews.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--dark-border)', flexShrink: 0 }}>
                    <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={e => { e.stopPropagation(); clearImage(idx); }} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={10} />
                    </button>
                    {idx === 0 && (
                      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--primary)', color: 'var(--black)', fontSize: '9px', fontWeight: 800, textAlign: 'center', padding: '2px' }}>MAIN</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </FieldGroup>

          {/* Featured Toggle */}
          <div
            onClick={handleFeaturedToggle}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: `2px solid ${formData.featured ? 'rgba(255,206,30,0.4)' : 'var(--dark-border)'}`, background: formData.featured ? 'rgba(255,206,30,0.05)' : 'var(--dark)', transition: 'all 0.25s', userSelect: 'none' }}
          >
            <div style={{ width: '48px', height: '26px', borderRadius: '99px', background: formData.featured ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'var(--dark-border)', position: 'relative', transition: 'all 0.25s', flexShrink: 0, boxShadow: formData.featured ? '0 2px 8px rgba(245,158,11,0.4)' : 'none' }}>
              <div style={{ position: 'absolute', top: '3px', left: formData.featured ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '99px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.25s' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <Star size={16} color={formData.featured ? 'var(--warning)' : 'var(--gray-2)'} fill={formData.featured ? 'currentColor' : 'none'} />
                Feature on Homepage
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-1)' }}>This product will appear in the featured section</p>
            </div>
            {formData.featured && (
              <span style={{ background: 'var(--warning)', color: '#000', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.08em', flexShrink: 0 }}>
                ⭐ FEATURED #{positionInput}
              </span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving} style={{ width: '100%', padding: '16px', background: saving ? 'var(--dark-border)' : 'var(--primary)', color: saving ? 'var(--gray-1)' : 'var(--black)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: saving ? 'none' : '0 8px 24px var(--primary-glow)', transition: 'all 0.2s', marginTop: '8px' }}>
            {saving ? <><Loader2 className="spinner" size={18} /> Saving…</> : <><CheckCircle2 size={18} /> {isEditing ? 'Update Product' : 'Save Product'}</>}
          </button>
        </form>

        {/* Featured Modal */}
        {showFeaturedModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '28px', maxWidth: '380px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800 }}>Set Featured Position</h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--gray-1)' }}>
                Enter the position (1–12) where this product should appear in the featured section.
                {featuredProducts.length > 0 && <> Currently {featuredProducts.length} products are featured.</>}
              </p>
              <input type="number" min="1" max="12" value={positionInput} onChange={e => setPositionInput(e.target.value)} placeholder="e.g. 1" autoFocus
                style={{ ...inputStyle, marginBottom: '16px' }}
                onFocus={e => e.target.style.borderColor = 'var(--warning)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowFeaturedModal(false)} style={{ flex: 1, padding: '12px', background: 'var(--dark)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, color: 'var(--gray-1)', transition: 'var(--transition)' }}>Cancel</button>
                <button onClick={handleSetFeaturedPosition} style={{ flex: 1, padding: '12px', background: 'var(--warning)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, color: '#000', transition: 'var(--transition)' }}>Set Position</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
