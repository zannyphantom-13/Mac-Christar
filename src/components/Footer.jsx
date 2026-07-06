import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, CreditCard, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="ref-footer" aria-label="Site footer">
      <div className="ref-container">
        <div className="ref-footer-grid">

          {/* Col 1 — Brand */}
          <div className="ref-footer-col ref-footer-brand-col">
            <Link to="/" className="ref-footer-logo">
              MAC-CHRISTAR<span>.</span>
            </Link>
            <p>Your trusted destination for premium electronics in Nigeria. We make luxury affordable through transparent installment plans and Buy-Now-Pay-Later options.</p>

            {/* Contact info */}
            <div className="ref-footer-contact">
              <div className="ref-footer-contact-row">
                <PhoneCall size={15} />
                <div>
                  <div className="ref-footer-contact-label">Customer Service & WhatsApp</div>
                  <a href="tel:09035636810" className="ref-footer-contact-value">09035636810</a>
                  <div className="ref-footer-contact-hours">Mon – Sat: 8am – 8pm</div>
                </div>
              </div>
              <div className="ref-footer-contact-row">
                <Mail size={15} />
                <div>
                  <div className="ref-footer-contact-label">Email</div>
                  <a href="mailto:macchristar@gmail.com" className="ref-footer-contact-value">macchristar@gmail.com</a>
                </div>
              </div>
              <div className="ref-footer-contact-row">
                <MapPin size={15} />
                <div>
                  <div className="ref-footer-contact-label">Address</div>
                  <div className="ref-footer-contact-value" style={{ fontSize: '12px' }}>Mac-Christar Limited plaza/complex, okearo busstop, ogun state</div>
                </div>
              </div>
            </div>

            {/* Payment Badges */}
            <div className="ref-payment-methods">
              {['VISA', 'Mastercard', 'Klump', 'Bank Transfer'].map(p => (
                <span key={p} className="ref-pay-icon">
                  <CreditCard size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{p}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2 — Company */}
          <div className="ref-footer-col">
            <h4 className="ref-footer-col-title">Company</h4>
            <ul className="ref-footer-links">
              {['About Us', 'Careers', 'Store Locations', 'Terms & Conditions', 'Privacy Policy'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Customer Care */}
          <div className="ref-footer-col">
            <h4 className="ref-footer-col-title">Customer Care</h4>
            <ul className="ref-footer-links">
              {['Track Your Order', 'How Installments Work', 'Returns & Refunds', 'Payment Methods', 'Help Center / FAQ', 'Contact Support'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="ref-footer-col">
            <h4 className="ref-footer-col-title">Stay Updated</h4>
            <p className="ref-footer-newsletter-desc">
              Subscribe to receive updates on flash sales, new electronics and exclusive installment offers.
            </p>
            <div className="ref-newsletter-box">
              <form onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-label="Email for newsletter"
                />
                <button type="submit">SUBSCRIBE</button>
              </form>
            </div>

            {/* Social Links */}
            <div className="ref-social-links">
              {[
                { label: 'Facebook', href: '#', icon: '𝐟' },
                { label: 'Instagram', href: '#', icon: '📸' },
                { label: 'Twitter / X', href: '#', icon: '𝕏' },
                { label: 'YouTube', href: '#', icon: '▶' },
              ].map(s => (
                <a key={s.label} href={s.href} className="ref-social-link" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="ref-footer-bottom">
          <p>© {new Date().getFullYear()} <span>Mac-Christar Limited</span>. All Rights Reserved.</p>
          <p className="ref-footer-tagline">Nigeria's most trusted electronics marketplace.</p>
        </div>
      </div>
    </footer>
  );
}
