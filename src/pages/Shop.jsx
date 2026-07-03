import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getProducts } from '../utils/productService';
import { listenToCategories } from '../utils/catalogService';
import { ProductCard } from './Home';
import { categorySpecs } from '../data/taxonomy';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import SEO from '../components/SEO';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const initialDept = searchParams.get('dept');

  const [view, setView] = useState('grid');
  const [activeCategory, setActiveCategory] = useState(initialDept || null);
  const [expandedDept, setExpandedDept] = useState(initialDept || null);

  useEffect(() => {
    if (initialDept) {
      setActiveCategory(initialDept);
      setExpandedDept(initialDept);
    }
  }, [initialDept]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsub = listenToCategories(setCategories);
    return () => unsub();
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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fp = await getProducts();
        setProducts(fp);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Derive unique spec options from actual products in the active category
  const categoryProducts = products.filter(p =>
    !activeCategory ||
    p.department === activeCategory ||
    p.category === activeCategory ||
    p.subcategory === activeCategory
  );

  // Build dynamic spec filters from actual product specs
  const specKey = activeCategory;
  const specSchema = categorySpecs[specKey] || [];
  const dynamicSpecFilters = specSchema.map(field => {
    const values = [...new Set(
      categoryProducts.map(p => p.specs?.[field.id]).filter(Boolean)
    )].sort();
    return { ...field, liveOptions: values };
  }).filter(f => f.liveOptions.length > 0);

  // Unique brands from filtered category
  const brandsInCategory = [...new Set(categoryProducts.map(p => p.brand).filter(Boolean))].sort();

  const handleFilterChange = (filterId, option) => {
    setSelectedFilters(prev => {
      const cur = prev[filterId] || [];
      return cur.includes(option)
        ? { ...prev, [filterId]: cur.filter(i => i !== option) }
        : { ...prev, [filterId]: [...cur, option] };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setPriceMin('');
    setPriceMax('');
    setActiveCategory(null);
    if (searchParams.has('q') || searchParams.has('dept')) {
      searchParams.delete('q');
      searchParams.delete('dept');
      setSearchParams(searchParams);
    }
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  const filteredProducts = products.filter(p => {
    const matchCat = !activeCategory ||
      p.department === activeCategory ||
      p.category === activeCategory ||
      p.subcategory === activeCategory;

    const matchBrand = (!selectedFilters.brand?.length) || selectedFilters.brand.includes(p.brand);

    // Match dynamic spec filters
    const matchSpecs = specSchema.every(field => {
      const sel = selectedFilters[field.id];
      if (!sel?.length) return true;
      return sel.includes(p.specs?.[field.id]);
    });

    const matchMin = !priceMin || p.price >= Number(priceMin);
    const matchMax = !priceMax || p.price <= Number(priceMax);

    // Advanced search logic across name, brand, taxonomy, and specs
    let matchSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchableText = [
        p.name,
        p.brand,
        p.department,
        p.category,
        p.subcategory,
        ...(p.specs ? Object.values(p.specs) : []),
        ...(p.colors ? p.colors.map(c => c.name) : []),
        ...(p.features || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      matchSearch = searchableText.includes(q);
    }

    return matchCat && matchBrand && matchSpecs && matchMin && matchMax && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'newest') return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
    return 0; // recommended
  });

  return (
    <main className="main-content" id="main">
      <SEO
        title={activeCategory ? `Buy ${activeCategory} in Nigeria` : searchQuery ? `"${searchQuery}" - Electronics Nigeria` : 'Shop All Electronics in Nigeria'}
        description={activeCategory
          ? `Shop ${activeCategory} online in Nigeria at Mac-Christar. Best prices, fast delivery nationwide, flexible installment plans.`
          : 'Browse our full collection of smartphones, laptops, TVs, gaming consoles, home appliances and more. Fast delivery across Nigeria.'}
        url="/shop"
      />
      <div className="section-header">
        <h1 className="section-title">Shop <span className="title-accent">Electronics</span></h1>
        <div className="text-primary" style={{ fontSize: '13px', fontWeight: 600 }}>Home / Shop{activeCategory ? ` / ${activeCategory}` : ''}</div>
      </div>

      <div className="shop-layout">
        {/* Mobile overlay */}
        {isMobileFilterOpen && <div className="mobile-filter-backdrop" onClick={() => setIsMobileFilterOpen(false)} />}

        <aside className={`shop-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
          <div className="mobile-filter-header">
            <span>Filter Products</span>
            <button onClick={() => setIsMobileFilterOpen(false)}>×</button>
          </div>

          {/* Clear all */}
          {(activeFilterCount > 0 || activeCategory) && (
            <button onClick={clearAllFilters} style={{ width: '100%', marginBottom: '12px', padding: '8px', background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <X size={13} /> Clear All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          )}

          {/* ── Category Tree ─────────────────────────────── */}
          <div className="filter-group">
            <div className="filter-title">Categories</div>

            {/* All Products */}
            <div onClick={clearAllFilters}
              style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '5px 0', color: !activeCategory ? 'var(--primary)' : 'var(--gray-1)' }}>
              All Products
            </div>

            <div className="category-tree" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {Object.entries(taxonomyTree).map(([dept, cats]) => (
                <div key={dept} className="tree-dept">
                  <div
                    onClick={() => {
                      setExpandedDept(expandedDept === dept ? null : dept);
                      setActiveCategory(dept);
                      setSelectedFilters({});
                    }}
                    style={{ fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--dark-border)', color: activeCategory === dept ? 'var(--primary)' : 'inherit' }}
                  >
                    {dept} <span style={{ fontSize: '11px' }}>{expandedDept === dept ? '▲' : '▼'}</span>
                  </div>

                  {expandedDept === dept && (
                    <div style={{ paddingLeft: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(cats).map(([catName, subs]) => (
                        <div key={catName}>
                          <div
                            onClick={() => { setActiveCategory(catName); setSelectedFilters({}); }}
                            style={{ fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '3px 0', color: activeCategory === catName ? 'var(--primary)' : 'var(--gray-1)' }}
                          >
                            {catName}
                          </div>
                          <div style={{ paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {subs.map(sub => (
                              <div key={sub} onClick={() => { setActiveCategory(sub); setSelectedFilters({}); }}
                                style={{ fontSize: '11px', cursor: 'pointer', padding: '2px 0', color: activeCategory === sub ? 'var(--primary)' : 'var(--gray-2)' }}>
                                {sub}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Brand Filter (from actual products) ──────── */}
          {brandsInCategory.length > 0 && (
            <div className="filter-group">
              <div className="filter-title">Brand</div>
              <div className="filter-list">
                {brandsInCategory.map(brand => {
                  const count = categoryProducts.filter(p => p.brand === brand).length;
                  return (
                    <label className="filter-item" key={brand}>
                      <input type="checkbox" className="filter-checkbox"
                        checked={(selectedFilters.brand || []).includes(brand)}
                        onChange={() => handleFilterChange('brand', brand)} />
                      {brand} <span className="filter-count">{count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Price Range ───────────────────────────────── */}
          <div className="filter-group">
            <div className="filter-title">Price (₦)</div>
            <div className="price-inputs">
              <input type="number" className="price-input" placeholder="Min" min="0"
                value={priceMin} onChange={e => setPriceMin(e.target.value)} />
              <span>-</span>
              <input type="number" className="price-input" placeholder="Max" min="0"
                value={priceMax} onChange={e => setPriceMax(e.target.value)} />
            </div>
          </div>

          {/* ── Dynamic Spec Filters (from real product data) ── */}
          {dynamicSpecFilters.length > 0 && (
            <>
              <div style={{ padding: '8px 0 4px', fontSize: '11px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid var(--dark-border)', marginTop: '4px' }}>
                Specifications
              </div>
              {dynamicSpecFilters.map(filter => (
                <div className="filter-group" key={filter.id}>
                  <div className="filter-title">{filter.label}</div>
                  <div className="filter-list">
                    {filter.liveOptions.map(option => {
                      const count = categoryProducts.filter(p => p.specs?.[filter.id] === option).length;
                      return (
                        <label className="filter-item" key={option}>
                          <input type="checkbox" className="filter-checkbox"
                            checked={(selectedFilters[filter.id] || []).includes(option)}
                            onChange={() => handleFilterChange(filter.id, option)} />
                          {option} <span className="filter-count">{count}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Rating Filter ─────────────────────────────── */}
          <div className="filter-group">
            <div className="filter-title">Customer Rating</div>
            <div className="filter-list">
              {[5, 4, 3].map(stars => (
                <label className="filter-item" key={stars}>
                  <input type="checkbox" className="filter-checkbox"
                    checked={(selectedFilters.rating || []).includes(stars)}
                    onChange={() => handleFilterChange('rating', stars)} />
                  <span className="stars" style={{ color: 'var(--primary)' }}>
                    {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                  </span> & Up
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Product Area ──────────────────────────── */}
        <section className="shop-main">
          <div className="shop-toolbar">
            <div className="shop-results-count">
              Showing <span>{filteredProducts.length}</span> of <span>{products.length}</span> products
              {searchQuery && <span style={{ marginLeft: '6px' }}>for "<strong style={{ color: 'var(--primary)' }}>{searchQuery}</strong>"</span>}
              {activeCategory && <span style={{ color: 'var(--primary)', marginLeft: '6px' }}>in {activeCategory}</span>}
            </div>

            <button className="mobile-filter-toggle" onClick={() => setIsMobileFilterOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <div className="shop-sort-wrap">
              <span className="sort-label">Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>

              <div className="view-toggles">
                <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} title="Grid View" onClick={() => setView('grid')}>🔲</button>
                <button className={`view-btn ${view === 'list' ? 'active' : ''}`} title="List View" onClick={() => setView('list')}>☰</button>
              </div>
            </div>
          </div>

          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
            gap: '24px'
          }}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--gray-1)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                <p style={{ fontWeight: 700 }}>No products found</p>
                <p style={{ fontSize: '13px' }}>Try adjusting your filters or browse a different category</p>
                <button onClick={clearAllFilters} style={{ marginTop: '12px', padding: '8px 20px', background: 'var(--primary)', color: 'var(--black)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer' }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
