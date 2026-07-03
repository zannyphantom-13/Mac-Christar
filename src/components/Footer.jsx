import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall, Mail, MapPin, CreditCard,
  ShieldCheck, Calendar, ShoppingCart, ArrowRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site footer">

      {/* ── FOOTER BODY ── */}
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #A00000, #6B0000)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>MC</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.3px' }}>
                  MAC-CHRISTAR
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>
                  ELECTRONICS
                </div>
              </div>
            </Link>
            <p>Nigeria's most trusted electronics marketplace. Best prices on genuine products with flexible installment payment options.</p>
            <div className="social-links">
              {['f', 'in', 'tw', 'yt'].map((s, i) => (
                <a key={i} href="#" className="social-link" aria-label={`Social ${s}`}>
                  {['𝐟', '📸', '𝕏', '▶'][i]}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="footer-col-title">Categories</div>
            <div className="footer-links">
              {['Smartphones', 'Laptops & Computers', 'Televisions', 'Audio & Headphones', 'Cameras', 'Home Appliances', 'Gaming'].map(c => (
                <Link key={c} to={`/shop?q=${c.toLowerCase().split(' ')[0]}`}>{c}</Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <div className="footer-col-title">Help & Support</div>
            <div className="footer-links">
              {['Track Your Order', 'Returns & Refunds', 'Payment Methods', 'Installment Plans', 'FAQ', 'Contact Us'].map(l => (
                <a key={l} href="#">{l}</a>
              ))}
            </div>
          </div>

          {/* Payments */}
          <div>
            <div className="footer-col-title">Payment Options</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: <ShoppingCart size={20} color="#A00000" />, title: 'Buy Now, Pay Later', sub: 'Klump BNPL integration' },
                { icon: <Calendar size={20} color="#C9A84C" />, title: 'Installment Plans', sub: 'Daily, Weekly, Monthly' },
                { icon: <ShieldCheck size={20} color="#1A7A4A" />, title: 'Secure Checkout', sub: 'SSL encrypted payments' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flexShrink: 0, marginTop: '1px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '1px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-col-title">Contact Us</div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><PhoneCall size={16} /></div>
              <div className="footer-contact-text">
                <strong>Customer Service</strong>
                <a href="tel:09032272294" style={{ color: 'inherit', textDecoration: 'none' }}>09032272294</a>
                Mon – Sat: 8am – 8pm
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Mail size={16} /></div>
              <div className="footer-contact-text">
                <strong>Email</strong>
                support@macchristar.ng
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><MapPin size={16} /></div>
              <div className="footer-contact-text">
                <strong>Head Office</strong>
                A7 Adeti Street, FABTECH Plaza, Ilesa, Osun State
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><MapPin size={16} /></div>
              <div className="footer-contact-text">
                <strong>Branch — Lagos</strong>
                Shop 424 Upstairs, Japan Line, Alaba International Market, Ojo, Lagos
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} <span>Mac-Christar Limited</span>. All rights reserved.
          </div>
          <div className="payment-methods">
            {['Visa', 'Mastercard', 'Kora Pay', 'Bank Transfer'].map(p => (
              <span key={p} className="payment-badge">
                <CreditCard size={12} style={{ marginRight: '4px' }} />{p}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
