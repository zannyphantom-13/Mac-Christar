import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { addProduct } from '../utils/productService';
import { uploadImage } from '../utils/cloudinaryService';
import { PackagePlus, Image as ImageIcon, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user, authLoading } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    rating: '5',
    reviews: '0',
    description: '',
    brand: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (authLoading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spinner" size={48} color="var(--primary)" /></div>;

  // Protect route
  if (!user || !user.isAdmin) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div>
          <ShieldAlert size={64} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Access Denied</h1>
          <p style={{ color: 'var(--gray-1)', marginBottom: '24px' }}>You do not have administrator privileges to view this page.</p>
          <button onClick={() => navigate('/')} style={{ background: 'var(--primary)', color: 'var(--black)', padding: '10px 24px', borderRadius: 'var(--radius-md)', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Return Home</button>
        </div>
      </main>
    );
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!imageFile) {
      setMessage('Please select a product image.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload image to Cloudinary
      const imageUrl = await uploadImage(imageFile);
      
      // 2. Save product to Firestore
      const productToSave = {
        name: formData.name,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        category: formData.category,
        stock: Number(formData.stock),
        rating: Number(formData.rating),
        reviews: Number(formData.reviews),
        description: formData.description,
        brand: formData.brand,
        image: imageUrl,
        sales: 0 // Default sales counter
      };

      await addProduct(productToSave);
      
      setMessage('✅ Product added successfully!');
      
      // Reset form
      setFormData({
        name: '', price: '', originalPrice: '', category: '', stock: '', rating: '5', reviews: '0', description: '', brand: ''
      });
      setImageFile(null);
      setImagePreview('');

    } catch (error) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--white)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textTransform: 'uppercase', marginBottom: '8px' };

  return (
    <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <PackagePlus size={32} color="var(--primary)" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Admin Dashboard</h1>
      </div>

      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--dark-border)', paddingBottom: '16px' }}>Add New Product</h2>
        
        {message && (
          <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', background: message.includes('✅') ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,0,0.1)', color: message.includes('✅') ? 'var(--success)' : '#ff8066', border: `1px solid ${message.includes('✅') ? 'var(--success)' : 'var(--danger)'}` }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="e.g. iPhone 15 Pro" />
            </div>
            <div>
              <label style={labelStyle}>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required style={inputStyle} placeholder="e.g. Apple" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Price (₦)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required style={inputStyle} placeholder="e.g. 1500000" />
            </div>
            <div>
              <label style={labelStyle}>Original Price (₦) - Optional</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} style={inputStyle} placeholder="e.g. 1800000" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Category...</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Laptops">Laptops</option>
                <option value="Televisions">Televisions</option>
                <option value="Audio">Audio & Headphones</option>
                <option value="Gaming">Gaming</option>
                <option value="Accessories">Accessories</option>
                <option value="Home Appliances">Home Appliances</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required style={inputStyle} placeholder="e.g. 50" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Product Image</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div 
                style={{ width: '120px', height: '120px', background: 'var(--dark)', border: '2px dashed var(--dark-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                onClick={() => document.getElementById('productImage').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--gray-2)' }}>
                    <ImageIcon size={24} style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>Click to Upload</span>
                  </div>
                )}
              </div>
              <input type="file" id="productImage" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: 'var(--gray-1)', lineHeight: 1.6 }}>Please upload a high-quality product image with a clear background. Recommended size: 800x800 pixels. File size should not exceed 5MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product features and specifications..."></textarea>
          </div>

          <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'var(--black)', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '15px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Loader2 className="spinner" size={18} /> Uploading Product...</> : <><PackagePlus size={18} /> Add Product to Store</>}
          </button>

        </form>
      </div>
    </main>
  );
}
