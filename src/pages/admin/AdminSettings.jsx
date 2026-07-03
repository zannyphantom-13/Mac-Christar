import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, Plus, Trash2, Settings as SettingsIcon, LayoutTemplate, MessageSquare, Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '../../utils/cloudinaryService';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const [tickerMessages, setTickerMessages] = useState([
    "⚡ Best Deals on Electronics & Home Appliances — Limited Offers, Shop Now!",
    "🚚 Enjoy Fast Delivery Across Lagos — Free Shipping on Orders From ₦999,999!"
  ]);

  const [heroSlides, setHeroSlides] = useState([
    {
      title: "Upgrade Your Living Space",
      subtitle: "Premium Air Conditioners, Televisions, and Home Appliances from world-class brands.",
      buttonText: "Shop Appliances",
      link: "/shop",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1920&q=80"
    }
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'site_settings'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tickerMessages) setTickerMessages(data.tickerMessages);
          if (data.heroSlides) setHeroSlides(data.heroSlides);
        }
      } catch (e) {
        showToast('Failed to load settings from Firestore', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site_settings'), {
        tickerMessages,
        heroSlides,
        updatedAt: new Date()
      }, { merge: true });
      showToast('Site settings saved successfully!');
    } catch (e) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (idx, field, val) => {
    const arr = [...heroSlides];
    arr[idx][field] = val;
    setHeroSlides(arr);
  };

  const handleImageUpload = async (idx, file) => {
    if (!file) return;
    try {
      showToast('Uploading image...', 'info');
      const url = await uploadImage(file);
      updateSlide(idx, 'image', url);
      showToast('Image uploaded successfully!');
    } catch {
      showToast('Upload failed', 'error');
    }
  };

  const inputStyle = { width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '13px', color: 'var(--white)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}><Loader2 className="spinner" size={48} color="var(--primary)" /></div>;

  return (
    <div>
      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: toast.type === 'error' ? 'rgba(255,61,0,0.15)' : toast.type === 'info' ? 'rgba(0,176,255,0.15)' : 'rgba(0,230,118,0.15)', border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--info)' : 'var(--success)'}`, color: toast.type === 'error' ? '#ff8066' : toast.type === 'info' ? 'var(--info)' : 'var(--success)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '14px', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SettingsIcon size={24} color="var(--primary)" /> Site Settings
          </h1>
          <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>Manage the announcement ticker and homepage hero slides.</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'var(--black)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px var(--primary-glow)', transition: 'var(--transition)' }}>
          {saving ? <><Loader2 className="spinner" size={18} /> Saving...</> : <><Save size={18} /> Save Settings</>}
        </button>
      </div>

      <div className="admin-settings-layout" style={{ gap: '32px' }}>
        {/* Ticker Messages */}
        <div>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '24px', position: 'sticky', top: '24px' }}>
            <div style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' }}><MessageSquare size={16} color="var(--danger)" /> Announcement Ticker</h3>
              <p style={{ fontSize: '12px', color: 'var(--gray-1)', margin: 0 }}>Scrolling messages shown at the very top of the site.</p>
              <button onClick={() => setTickerMessages([...tickerMessages, ""])} style={{ marginTop: '16px', width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--gray-2)', color: 'var(--white)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, transition: 'var(--transition)' }}>
                <Plus size={14} /> Add Message
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickerMessages.map((msg, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <textarea value={msg} onChange={e => { const a = [...tickerMessages]; a[idx] = e.target.value; setTickerMessages(a); }} placeholder="Enter ticker message..." style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', paddingRight: '40px' }} />
                  <button onClick={() => setTickerMessages(tickerMessages.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,61,0,0.1)', color: 'var(--danger)', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {tickerMessages.length === 0 && <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--dark-border)', borderRadius: 'var(--radius-sm)', color: 'var(--gray-2)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>No messages added</div>}
            </div>
          </div>
        </div>

        {/* Hero Slides */}
        <div>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--dark-border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' }}><LayoutTemplate size={16} color="var(--primary)" /> Hero Carousel</h3>
                <p style={{ fontSize: '12px', color: 'var(--gray-1)', margin: 0 }}>Add giant slides for the homepage banner (Max 5).</p>
              </div>
              <button onClick={() => { if (heroSlides.length >= 5) return showToast('Max 5 slides allowed', 'error'); setHeroSlides([...heroSlides, { title: '', subtitle: '', buttonText: '', link: '', image: '' }]); }} style={{ padding: '8px 16px', background: 'rgba(255,94,0,0.1)', color: 'var(--primary)', border: '1px solid rgba(255,94,0,0.3)', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Plus size={14} /> Add Slide ({heroSlides.length}/5)
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {heroSlides.map((slide, idx) => (
                <div key={idx} style={{ border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: 'var(--gray-1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Slide #{idx + 1}</h4>
                    <button onClick={() => setHeroSlides(heroSlides.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={12} /> Delete Slide
                    </button>
                  </div>

                  <div className="responsive-grid-2" style={{ padding: '20px', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Headline</label>
                      <input value={slide.title} onChange={e => updateSlide(idx, 'title', e.target.value)} placeholder="e.g. Upgrade Your Space" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Image (Upload)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={slide.image} onChange={e => updateSlide(idx, 'image', e.target.value)} placeholder="https://..." style={inputStyle} />
                        <label style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', padding: '0 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Upload Image">
                          <Upload size={16} color="var(--gray-1)" />
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(idx, e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                    <div className="grid-span-2">
                      <label style={labelStyle}>Subtitle</label>
                      <textarea value={slide.subtitle} onChange={e => updateSlide(idx, 'subtitle', e.target.value)} placeholder="Brief description..." style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Button Text</label>
                      <input value={slide.buttonText} onChange={e => updateSlide(idx, 'buttonText', e.target.value)} placeholder="e.g. Shop Now" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Button Link URL</label>
                      <input value={slide.link} onChange={e => updateSlide(idx, 'link', e.target.value)} placeholder="e.g. /shop" style={inputStyle} />
                    </div>
                  </div>

                  {slide.image && (
                    <div style={{ padding: '0 20px 20px' }}>
                      <label style={labelStyle}>Image Preview</label>
                      <div style={{ height: '140px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)', overflow: 'hidden', background: 'var(--dark)' }}>
                        <img src={slide.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {heroSlides.length === 0 && <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--dark-border)', borderRadius: 'var(--radius-md)' }}><LayoutTemplate size={32} color="var(--gray-2)" style={{ marginBottom: '12px' }} /><div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase' }}>No slides added</div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
