import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { allProducts, productData } from '../data/productData';
import {
  Smartphone, Laptop, Tv, Headphones, Refrigerator, Gamepad2, Camera, Watch,
  ShoppingCart, Heart, Truck, ShieldCheck, Mail, Zap,
  ChevronLeft, ChevronRight, Calendar, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTilt, useMagnetic } from '../hooks/useInteraction';

export const formatCurrency = (amount) => '₦' + (amount || 0).toLocaleString('en-NG');

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
export const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.id);
  const tiltRef = useTilt();

  let badge = null;
  if (product.badge === 'hot') badge = <span className="product-badge hot">HOT</span>;
  else if (product.badge === 'new') badge = <span className="product-badge new">NEW</span>;
  else if (product.badge === 'sale' || product.originalPrice) badge = <span className="product-badge">SALE</span>;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article className="product-card" tabIndex="0" ref={tiltRef}>
      <Link to={`/product/${product.id}`} style={{ display: 'contents' }}>
        <div className="product-img-wrap">
          {badge}
          <button
            className={`product-wishlist ${inWishlist ? 'active' : ''}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={e => { e.preventDefault(); toggleWishlist(product); }}
          >
            <Heart size={15} fill={inWishlist ? '#C0202A' : 'none'} color={inWishlist ? '#C0202A' : '#9A8E7A'} />
          </button>
          <img
            src={product.imgUrl || product.image || (product.images && product.images[0]) || '/placeholder.jpg'}
            alt={product.name}
            className="product-img"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="product-actions">
            <button
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',background:'transparent',font:'inherit',fontWeight:700,width:'100%',height:'100%',cursor:'pointer',color:'#fff',fontSize:'13px' }}
              onClick={e => { e.preventDefault(); addToCart(product); }}
            >
              <ShoppingCart size={15} /> Add to Cart
            </button>
          </div>
        </div>
        <div className="product-info">
          <div className="product-brand">{product.brand || 'Mac-Christar'}</div>
          <h3 className="product-name" title={product.name}>{product.name}</h3>
          <div className="product-rating">
            <span className="stars">
              {'★'.repeat(Math.max(0,Math.min(5,Math.floor(Number(product.rating)||4))))}
              {'☆'.repeat(Math.max(0,5-Math.min(5,Math.floor(Number(product.rating)||4))))}
            </span>
            <span className="rating-count">({Number(product.reviews)||0})</span>
          </div>
          <div className="product-price-wrap">
            {product.originalPrice && <span className="product-old-price">{formatCurrency(product.originalPrice)}</span>}
            <span className="product-price">{formatCurrency(product.price)}</span>
            {discount > 0 && <span className="product-discount">-{discount}%</span>}
          </div>
        </div>
      </Link>
    </article>
  );
};

/* ─────────────────────────────────────────────
   SCROLLABLE PRODUCT SLIDER
───────────────────────────────────────────── */
const ScrollableProductSlider = ({ products }) => {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -420 : 420, behavior: 'smooth' });
  };
  return (
    <div className="slider-container">
      <button className="slider-btn left" onClick={() => scroll('left')} aria-label="Scroll left"><ChevronLeft size={18} /></button>
      <div className="scrollable-2row" ref={scrollRef}>
        {products?.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <button className="slider-btn right" onClick={() => scroll('right')} aria-label="Scroll right"><ChevronRight size={18} /></button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ─────────────────────────────────────────────
   CATEGORY BILLBOARD COMPONENT
───────────────────────────────────────────── */
const CategoryBillboard = ({ cat }) => {
  const tiltRef = useTilt();
  
  return (
    <Link
      to={`/shop?q=${cat.q}`}
      className="mc-cat-billboard"
      style={{ 
        '--cat-bg': cat.bg, 
        '--cat-text': cat.text,
        '--cat-shadow': cat.shadow
      }}
      ref={tiltRef}
    >
      <div className="mc-cat-icon-bg">{cat.icon}</div>
      <div className="mc-cat-content">
        <div className="mc-cat-icon">{cat.icon}</div>
        <div className="mc-cat-name">{cat.name}</div>
        <div className="mc-cat-cta">Shop <ArrowRight size={12}/></div>
      </div>
    </Link>
  );
};

/* ─────────────────────────────────────────────
   BRAND CARD COMPONENT
───────────────────────────────────────────── */
const BrandCard = ({ to, className, eyebrow, title, sub, cta, icon }) => {
  const tiltRef = useTilt();
  return (
    <Link to={to} className={`mc-brand-card ${className}`} ref={tiltRef}>
      <div className="mc-brand-bg"></div>
      <div className="mc-brand-content">
        <div className="mc-brand-eyebrow">{eyebrow}</div>
        <h3 className="mc-brand-title" dangerouslySetInnerHTML={{ __html: title }}></h3>
        <p className="mc-brand-sub">{sub}</p>
        <div className="mc-brand-cta">{cta} <ArrowRight size={14}/></div>
      </div>
      {icon}
    </Link>
  );
};

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
export default function Home() {
  const { showToast } = useApp();
  const [data, setData] = useState({ flashSale:[], newArrivals:[], featured:[], all:[] });
  const [heroSlides, setHeroSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);
  
  const magRef1 = useMagnetic();
  const magRef2 = useMagnetic();

  useScrollReveal();

  /* ── FETCH DATA ── */
  useEffect(() => {
    getDoc(doc(db,'settings','site_settings'))
      .then(snap => { if (snap.exists()&&snap.data().heroSlides) setHeroSlides(snap.data().heroSlides); })
      .catch(()=>{});
  }, []);

  useEffect(() => {
    import('../utils/productService').then(({getProducts})=>getProducts()).then(dbProducts => {
      if (dbProducts?.length) setData({ flashSale:dbProducts.slice(0,8), newArrivals:dbProducts.slice(0,10), featured:dbProducts.slice(0,8), all:dbProducts });
    }).catch(()=>{});
  }, []);

  /* ── HERO AUTO-ADVANCE ── */
  const goToSlide = useCallback((idx) => {
    if (isTransitioning || !heroSlides.length) return;
    setIsTransitioning(true);
    setActiveSlide(idx);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning, heroSlides.length]);

  useEffect(() => {
    if (!heroSlides.length) return;
    timerRef.current = setInterval(() => goToSlide((activeSlide+1) % heroSlides.length), 7000);
    return () => clearInterval(timerRef.current);
  }, [heroSlides.length, activeSlide, goToSlide]);

  const slide = heroSlides[activeSlide] || {};

  /* ── CATEGORY DATA ── */
  const categories = [
    { icon:<Smartphone size={38} strokeWidth={1.5}/>, name:'Smartphones', q:'smartphone', 
      bg: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', text: '#fff', shadow: 'rgba(255, 75, 43, 0.4)' },
    { icon:<Laptop size={38} strokeWidth={1.5}/>, name:'Laptops', q:'laptop', 
      bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#fff', shadow: 'rgba(0, 242, 254, 0.4)' },
    { icon:<Tv size={38} strokeWidth={1.5}/>, name:'Televisions', q:'tv', 
      bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#005522', shadow: 'rgba(56, 249, 215, 0.4)' },
    { icon:<Headphones size={38} strokeWidth={1.5}/>, name:'Headphones', q:'headphone', 
      bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#882244', shadow: 'rgba(254, 225, 64, 0.4)' },
    { icon:<Refrigerator size={38} strokeWidth={1.5}/>, name:'Appliances', q:'appliance', 
      bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', text: '#884400', shadow: 'rgba(253, 160, 133, 0.4)' },
    { icon:<Gamepad2 size={38} strokeWidth={1.5}/>, name:'Gaming', q:'gaming', 
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff', shadow: 'rgba(118, 75, 162, 0.4)' },
    { icon:<Camera size={38} strokeWidth={1.5}/>, name:'Cameras', q:'camera', 
      bg: 'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)', text: '#fff', shadow: 'rgba(128, 208, 199, 0.4)' },
    { icon:<Watch size={38} strokeWidth={1.5}/>, name:'Watches', q:'watch', 
      bg: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)', text: '#fff', shadow: 'rgba(36, 59, 85, 0.4)' },
  ];

  const promoTiles = [
    { num:'01', icon:<Smartphone size={22}/>, label:'New Arrivals', sub:'Phones & Tablets', to:'/shop?sort=new', bg:'#A00000' },
    { num:'02', icon:<Calendar size={22}/>, label:'Flexible Plans', sub:'Daily, Weekly, Monthly', to:'/shop', bg:'#1A1208' },
    { num:'03', icon:<Zap size={22}/>, label:'Flash Deals', sub:"Today's Best Prices", to:'/shop', bg:'#C9A84C' },
  ];

  const dynamicSections = [
    ['Mac-Christar Exclusives','Best Deals',0],
    ['Phones & Tablets','Top Picks',1],
    ['Home Appliances','Best Sellers',2],
    ['Laptops & Computing','Offers',3],
    ['Premium TVs & Audio','Explore',4],
    ['Gaming Consoles','Best Sellers',5],
  ];

  return (
    <main id="main" style={{ background:'var(--bg)' }}>
      <SEO
        title="Mac-Christar Limited — Premium Electronics Nigeria"
        description="Buy the latest phones, laptops, TVs and home appliances at Mac-Christar Limited. Flexible installment plans, Buy Now Pay Later, fast nationwide delivery."
        url="/"
      />

      {/* ══════════════════════════════════════════
          CINEMATIC HERO — Asymmetric Editorial
      ══════════════════════════════════════════ */}
      {heroSlides.length > 0 && (
        <section className="mc-hero" aria-label="Featured promotion">

          {/* ── Background image layer ── */}
          <div
            className={`mc-hero-bg ${isTransitioning ? 'transitioning' : ''}`}
            style={{ backgroundImage: slide.image ? `url(${slide.image})` : 'none' }}
            aria-hidden="true"
          />
          {/* Gradient overlay — red sweep from left */}
          <div className="mc-hero-overlay" aria-hidden="true" />

          {/* ── Decorative backdrop number ── */}
          <span className="mc-hero-backdrop-num" aria-hidden="true">
            {String(activeSlide + 1).padStart(2, '0')}
          </span>

          {/* ── EDITORIAL TEXT BLOCK ── */}
          <div className="mc-hero-inner">
            <div className={`mc-hero-content ${isTransitioning ? 'exit' : 'enter'}`}>

              {/* Eyebrow line */}
              <div className="mc-hero-eyebrow">
                <span className="mc-hero-line" />
                <span className="mc-hero-eyebrow-text">Mac-Christar Limited</span>
              </div>

              {/* Giant display title — split */}
              <h1 className="mc-hero-title">
                {(slide.title || 'Premium Electronics').split(' ').map((word, i) => (
                  <span key={i} className="mc-hero-word" style={{ animationDelay: `${i * 0.08}s` }}>
                    {word}
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p className="mc-hero-subtitle">{slide.subtitle || 'The best brands. Flexible payments. Delivered to your door.'}</p>

              {/* CTA Row */}
              <div className="mc-hero-ctas">
                <div ref={magRef1}>
                  <Link to={slide.link || '/shop'} className="mc-hero-cta-primary">
                    <span>{slide.buttonText || 'Shop Now'}</span>
                    <ArrowUpRight size={18} className="mc-cta-arrow" />
                  </Link>
                </div>
                <div ref={magRef2}>
                  <Link to="/shop" className="mc-hero-cta-ghost">
                    Browse All <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Slide counter + dots ── */}
            {heroSlides.length > 1 && (
              <div className="mc-hero-nav">
                <div className="mc-hero-counter">
                  <span className="mc-counter-current">{String(activeSlide+1).padStart(2,'0')}</span>
                  <span className="mc-counter-sep" />
                  <span className="mc-counter-total">{String(heroSlides.length).padStart(2,'0')}</span>
                </div>
                <div className="mc-hero-tracks">
                  {heroSlides.map((_,i) => (
                    <button
                      key={i}
                      className={`mc-hero-track ${i === activeSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(i)}
                      aria-label={`Go to slide ${i+1}`}
                    />
                  ))}
                </div>
                <div className="mc-hero-arrows">
                  <button onClick={() => goToSlide(activeSlide===0 ? heroSlides.length-1 : activeSlide-1)} aria-label="Previous">
                    <ChevronLeft size={18}/>
                  </button>
                  <button onClick={() => goToSlide((activeSlide+1)%heroSlides.length)} aria-label="Next">
                    <ChevronRight size={18}/>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Scroll cue ── */}
          <div className="mc-scroll-cue" aria-hidden="true">
            <span className="mc-scroll-line"/>
            <span className="mc-scroll-label">Scroll</span>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          HORIZONTAL PROMO STRIP
          (Replaces the old sidebar tiles)
      ══════════════════════════════════════════ */}
      <section className="mc-promo-strip" aria-label="Quick access">
        {promoTiles.map((tile, i) => (
          <Link
            key={tile.num}
            to={tile.to}
            className="mc-promo-tile"
            style={{ '--tile-bg': tile.bg, animationDelay: `${i * 0.12}s` }}
          >
            <div className="mc-promo-num">{tile.num}</div>
            <div className="mc-promo-icon">{tile.icon}</div>
            <div className="mc-promo-body">
              <div className="mc-promo-label">{tile.label}</div>
              <div className="mc-promo-sub">{tile.sub}</div>
            </div>
            <div className="mc-promo-arrow"><ArrowUpRight size={20}/></div>
          </Link>
        ))}
      </section>

      {/* ══════════════════════════════════════════
          CATEGORY BILLBOARDS
          (Large editorial grid, not small pills)
      ══════════════════════════════════════════ */}
      <section className="main-content section-gap" aria-label="Browse by category">
        <div className="mc-cat-header reveal">
          <div className="mc-section-kicker">Explore</div>
          <h2 className="mc-section-display">Shop by Category</h2>
          <Link to="/shop" className="mc-text-link">All categories <ArrowRight size={14}/></Link>
        </div>

        <div className="mc-cat-billboard-grid reveal">
          {categories.map((cat, i) => {
            return (
              <CategoryBillboard key={cat.name} cat={cat} />
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST ROW
      ══════════════════════════════════════════ */}
      <section className="mc-trust-strip reveal" aria-label="Why shop with us">
        {[
          { icon:<ShoppingCart size={20} color="#A00000"/>, label:'Buy Now, Pay Later' },
          { icon:<Calendar size={20} color="#C9A84C"/>, label:'Installment Plans' },
          { icon:<ShieldCheck size={20} color="#1A7A4A"/>, label:'100% Genuine' },
          { icon:<Truck size={20} color="#1A4DA0"/>, label:'Nationwide Delivery' },
        ].map(item => (
          <div key={item.label} className="mc-trust-chip">
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════
          FLASH SALE
      ══════════════════════════════════════════ */}
      {data.flashSale.length > 0 && (
        <section className="main-content flash-sale section-gap reveal" aria-label="Flash sale">
          <div className="flash-header">
            <div className="flash-title-wrap">
              <div className="flash-title"><Zap size={20} className="flash-icon"/> Flash Sale</div>
            </div>
            <div className="countdown" role="timer">
              <span className="countdown-label">Ends in:</span>
              <div className="time-unit"><span className="time-num">02</span><span className="time-label">HRS</span></div>
              <span className="time-sep">:</span>
              <div className="time-unit"><span className="time-num">14</span><span className="time-label">MIN</span></div>
              <span className="time-sep">:</span>
              <div className="time-unit"><span className="time-num">37</span><span className="time-label">SEC</span></div>
            </div>
            <Link to="/shop" className="see-all" style={{background:'rgba(255,255,255,0.12)',borderColor:'rgba(255,255,255,0.25)',color:'#fff'}}>
              See All <ArrowRight size={13}/>
            </Link>
          </div>
          <div className="flash-products">
            {data.flashSale.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          PREMIUM BRAND SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="main-content mc-brand-showcase section-gap reveal" aria-label="Brand promotions">
        <div className="mc-brand-grid">
          
          <BrandCard
            to="/shop?brand=apple"
            className="apple span-col-2 span-row-2"
            eyebrow="Apple Premium Reseller"
            title="MacBook Pro M3<br/>& iPhone 15 Pro"
            sub="Pro power. Pro performance."
            cta="Shop Apple"
            icon={<Laptop size={320} strokeWidth={0.5} className="mc-brand-icon" />}
          />

          <BrandCard
            to="/shop?brand=samsung"
            className="samsung span-col-2"
            eyebrow="Samsung Official"
            title="Galaxy AI is here"
            sub="Unleash new ways to create and connect."
            cta="Shop Samsung"
            icon={<Smartphone size={180} strokeWidth={0.5} className="mc-brand-icon" />}
          />

          <BrandCard
            to="/shop?brand=sony"
            className="sony"
            eyebrow="Sony Audio"
            title="Pure Noise<br/>Cancelling"
            sub="Immersive sound."
            cta="Shop Sony"
            icon={<Headphones size={180} strokeWidth={0.5} className="mc-brand-icon" />}
          />

          <BrandCard
            to="/shop?brand=lg"
            className="lg"
            eyebrow="LG Electronics"
            title="OLED<br/>Perfect Black"
            sub="Self-lit pixels."
            cta="Shop LG"
            icon={<Tv size={180} strokeWidth={0.5} className="mc-brand-icon" />}
          />

          <BrandCard
            to="/shop?brand=hp"
            className="hp span-col-2"
            eyebrow="HP Computing"
            title="Omen & Envy Series"
            sub="Unstoppable performance for work and play."
            cta="Shop HP"
            icon={<Laptop size={180} strokeWidth={0.5} className="mc-brand-icon" />}
          />

          <BrandCard
            to="/shop?category=gaming"
            className="gaming span-col-2"
            eyebrow="Gaming Hub"
            title="Next-Gen<br/>Entertainment"
            sub="PlayStation, Xbox, Nintendo & accessories"
            cta="Shop Gaming"
            icon={<Gamepad2 size={240} strokeWidth={0.5} className="mc-brand-icon" />}
          />

        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      {data.featured.length > 0 && (
        <section className="main-content products-section section-gap reveal" aria-label="Featured">
          <div className="section-header">
            <div><div className="section-label">Handpicked</div><h2 className="section-title">Featured Products</h2></div>
            <Link to="/shop" className="see-all">View all <ArrowRight size={13}/></Link>
          </div>
          <ScrollableProductSlider products={data.featured}/>
        </section>
      )}

      {/* ══════════════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════════════ */}
      {data.newArrivals.length > 0 && (
        <section className="main-content products-section section-gap reveal" aria-label="New arrivals">
          <div className="section-header">
            <div><div className="section-label">Just In</div><h2 className="section-title">New Arrivals</h2></div>
            <Link to="/shop" className="see-all">View all <ArrowRight size={13}/></Link>
          </div>
          <ScrollableProductSlider products={data.newArrivals}/>
        </section>
      )}

      {/* ══════════════════════════════════════════
          DYNAMIC SECTIONS
      ══════════════════════════════════════════ */}
      {data.all?.length > 0 && dynamicSections.map(([title,sub,offset]) => {
        const shifted = [...data.all.slice(offset%data.all.length),...data.all.slice(0,offset%data.all.length)];
        return (
          <section key={title} className="main-content products-section section-gap reveal" aria-label={title}>
            <div className="section-header">
              <div><div className="section-label">{sub}</div><h2 className="section-title">{title}</h2></div>
              <Link to="/shop" className="see-all">View all <ArrowRight size={13}/></Link>
            </div>
            <ScrollableProductSlider products={shifted}/>
          </section>
        );
      })}

      {/* ══════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════ */}
      <div className="main-content">
        <section className="newsletter-section section-gap reveal" aria-label="Newsletter">
          <div className="newsletter-icon"><Mail size={44} strokeWidth={1.5} color="#C9A84C"/></div>
          <h2 className="newsletter-title">Get <span>Exclusive Deals</span> First</h2>
          <p className="newsletter-sub">Subscribe and be the first to know about flash sales, new arrivals and installment offers.</p>
          <form className="newsletter-form" onSubmit={e=>{e.preventDefault();showToast('Subscribed! 🎉');}}>
            <input type="email" className="newsletter-input" placeholder="Your email address..." required/>
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </section>
      </div>

    </main>
  );
}

/* ── GET PRODUCT ICON ─────────────────────── */
const getProductIcon = (category) => {
  if (!category) return <Smartphone size={48} strokeWidth={1} color="#9A8E7A"/>;
  const c = category.toLowerCase();
  if (c.includes('phone')||c.includes('tablet')) return <Smartphone size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('laptop')||c.includes('computer')) return <Laptop size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('tv')||c.includes('television')) return <Tv size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('headphone')||c.includes('audio')) return <Headphones size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('fridge')||c.includes('home')) return <Refrigerator size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('gaming')) return <Gamepad2 size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('camera')) return <Camera size={48} strokeWidth={1} color="#9A8E7A"/>;
  if (c.includes('watch')) return <Watch size={48} strokeWidth={1} color="#9A8E7A"/>;
  return <Smartphone size={48} strokeWidth={1} color="#9A8E7A"/>;
};
export { getProductIcon };
