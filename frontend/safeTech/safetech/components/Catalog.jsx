/* Catálogo rediseñado — vista de listado con filtros, grid rica, comparador */

const STCatalog = () => {
  const [activeCat, setActiveCat] = React.useState('all');
  const [activeCond, setActiveCond] = React.useState('all');
  const [activeSort, setActiveSort] = React.useState('relevance');
  const [activePrice, setActivePrice] = React.useState('all');
  const [hoveredCard, setHoveredCard] = React.useState(null);

  const cats = [
    { id: 'all', label: 'Todo', count: 247 },
    { id: 'phone', label: 'Smartphones', count: 89 },
    { id: 'laptop', label: 'Laptops', count: 54 },
    { id: 'tablet', label: 'Tablets', count: 38 },
    { id: 'audio', label: 'Audio', count: 41 },
    { id: 'wear', label: 'Wearables', count: 25 },
  ];

  const conds = ['all', 'Excellent', 'Good', 'Fair'];
  const sorts = [
    { id: 'relevance', label: 'Más relevante' },
    { id: 'price-low', label: 'Precio ↑' },
    { id: 'price-high', label: 'Precio ↓' },
    { id: 'newest', label: 'Recientes' },
    { id: 'discount', label: 'Mayor descuento' },
  ];

  const products = [
    { id: 1, name: 'iPhone 14 Pro', cat: 'phone', cond: 'Excellent', price: 849, original: 1099, color: '#3D3934', tag: 'Más vendido', battery: 94, storage: '256GB', spec: 'Space Black' },
    { id: 2, name: 'iPhone 13', cat: 'phone', cond: 'Excellent', price: 549, original: 799, color: '#5A6B52', tag: null, battery: 91, storage: '128GB', spec: 'Green' },
    { id: 3, name: 'MacBook Pro 14"', cat: 'laptop', cond: 'Excellent', price: 1620, original: 2499, color: '#3D3934', tag: 'Pocas unidades', battery: 96, storage: '512GB SSD', spec: 'M2 Pro · 16GB' },
    { id: 4, name: 'MacBook Air 13"', cat: 'laptop', cond: 'Good', price: 879, original: 1299, color: '#9C9489', tag: null, battery: 88, storage: '256GB SSD', spec: 'M2 · 8GB' },
    { id: 5, name: 'iPad Air 5', cat: 'tablet', cond: 'Good', price: 459, original: 749, color: '#6B655C', tag: 'Recién listado', battery: 89, storage: '64GB', spec: 'WiFi · Space Gray' },
    { id: 6, name: 'iPad Pro 11"', cat: 'tablet', cond: 'Excellent', price: 879, original: 1299, color: '#1F1D1A', tag: null, battery: 93, storage: '128GB', spec: 'M2 · WiFi+Cellular' },
    { id: 7, name: 'AirPods Pro 2', cat: 'audio', cond: 'Excellent', price: 159, original: 249, color: '#E4E0D8', tag: null, battery: 95, storage: 'Case incluido', spec: 'USB-C · 2nd gen' },
    { id: 8, name: 'Apple Watch S9', cat: 'wear', cond: 'Excellent', price: 289, original: 429, color: '#8C5742', tag: 'Nuevo', battery: 97, storage: '45mm GPS', spec: 'Aluminum · Midnight' },
  ];

  const filtered = products.filter((p) => {
    if (activeCat !== 'all' && p.cat !== activeCat) return false;
    if (activeCond !== 'all' && p.cond !== activeCond) return false;
    if (activePrice === '0-500' && p.price > 500) return false;
    if (activePrice === '500-1000' && (p.price < 500 || p.price > 1000)) return false;
    if (activePrice === '1000+' && p.price < 1000) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'price-low') return a.price - b.price;
    if (activeSort === 'price-high') return b.price - a.price;
    if (activeSort === 'discount') return (b.original - b.price) / b.original - (a.original - a.price) / a.original;
    return 0;
  });

  return (
    <div className="st-root" style={{ background: 'var(--st-bone)', minHeight: '100vh' }}>
      <STHeader active="CATÁLOGO" />

      {/* Hero del catálogo */}
      <section style={{ padding: '64px 32px 32px', background: 'var(--st-bone)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p className="st-mono" style={{ fontSize: 11, color: 'var(--st-earth)', letterSpacing: '0.12em', marginBottom: 12 }}>
                CATÁLOGO · {filtered.length} de {products.length} resultados
              </p>
              <h1 className="st-display" style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 300, lineHeight: 0.98, letterSpacing: '-0.04em', color: 'var(--st-clay)', maxWidth: 720 }}>
                Tecnología verificada,<br />
                <em style={{ fontStyle: 'italic', color: 'var(--st-earth)' }}>todo en un sitio.</em>
              </h1>
            </div>

            {/* Search + sort */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 999, width: 280 }}>
                <STIcons.search style={{ color: 'var(--st-earth)' }} />
                <input
                  placeholder="iPhone 14, MacBook..."
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--st-clay)', outline: 'none' }}
                />
              </div>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                style={{ background: 'var(--st-cream)', border: '1px solid var(--st-line)', borderRadius: 999, padding: '0 16px', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--st-clay)', cursor: 'pointer', outline: 'none' }}
              >
                {sorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Filter chips */}
      <section style={{ padding: '24px 32px', background: 'var(--st-bone)', position: 'sticky', top: 64, zIndex: 30, borderBottom: '1px solid var(--st-line)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Categorías */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {cats.map((c) => {
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  style={{
                    padding: '8px 16px',
                    background: active ? 'var(--st-ink)' : 'transparent',
                    color: active ? 'var(--st-bone)' : 'var(--st-clay)',
                    border: `1px solid ${active ? 'var(--st-ink)' : 'var(--st-line)'}`,
                    borderRadius: 999,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s var(--st-ease)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {c.label}
                  <span className="st-mono" style={{ fontSize: 10.5, opacity: 0.6 }}>{c.count}</span>
                </button>
              );
            })}
          </div>

          {/* Filtros secundarios */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em' }}>CONDICIÓN</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {conds.map((c) => {
                const active = activeCond === c;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCond(c)}
                    style={{
                      padding: '6px 12px',
                      background: active ? 'var(--st-cream)' : 'transparent',
                      color: 'var(--st-clay)',
                      border: 'none',
                      borderRadius: 999,
                      fontFamily: 'inherit',
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {c === 'all' ? 'Todas' : c}
                  </button>
                );
              })}
            </div>

            <span style={{ width: 1, height: 16, background: 'var(--st-line)' }} />

            <span className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em' }}>PRECIO</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['all', 'Cualquiera'], ['0-500', '< $500'], ['500-1000', '$500–$1k'], ['1000+', '> $1k']].map(([id, l]) => {
                const active = activePrice === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActivePrice(id)}
                    style={{
                      padding: '6px 12px',
                      background: active ? 'var(--st-cream)' : 'transparent',
                      color: 'var(--st-clay)',
                      border: 'none',
                      borderRadius: 999,
                      fontFamily: 'inherit',
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid de productos */}
      <section style={{ padding: '40px 32px 80px', background: 'var(--st-bone)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {sorted.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--st-earth)' }}>
              <p className="st-display" style={{ fontSize: 32, fontStyle: 'italic', color: 'var(--st-clay)', marginBottom: 8 }}>Nada por aquí.</p>
              <p style={{ fontSize: 14 }}>Prueba con otros filtros — el inventario rota cada semana.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {sorted.map((p) => (
                <CatalogCard key={p.id} p={p} hovered={hoveredCard === p.id} onHover={() => setHoveredCard(p.id)} onLeave={() => setHoveredCard(null)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 64 }}>
            {[1, 2, 3, '...', 8].map((n, i) => (
              <button
                key={i}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: n === 1 ? 'var(--st-ink)' : 'transparent',
                  color: n === 1 ? 'var(--st-bone)' : 'var(--st-clay)',
                  border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
            <button style={{ marginLeft: 12, padding: '8px 16px', borderRadius: 999, background: 'var(--st-cream)', border: '1px solid var(--st-line)', color: 'var(--st-clay)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Siguiente <STIcons.arrow />
            </button>
          </div>
        </div>
      </section>

      <STFooter />
    </div>
  );
};

const CatalogCard = ({ p, hovered, onHover, onLeave }) => {
  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        background: 'var(--st-cream)',
        border: '1px solid var(--st-line)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.4s var(--st-ease)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 28px 56px -16px rgba(31,29,26,0.16)' : 'none',
      }}
    >
      {/* Imagen del producto */}
      <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--st-bone)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Mock device */}
        <div
          style={{
            width: '54%', height: '72%',
            background: `linear-gradient(145deg, ${p.color}EE, ${p.color})`,
            borderRadius: 18,
            boxShadow: '0 16px 36px -10px rgba(31,29,26,0.3)',
            transform: hovered ? 'rotate(-6deg) scale(1.08)' : 'rotate(0) scale(1)',
            transition: 'transform 0.6s var(--st-ease)',
            position: 'relative',
          }}
        >
          {/* Pequeño detalle interno */}
          <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '20%', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
        </div>

        {/* Overlay con quick-view + wishlist */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, right: 12,
          display: 'flex', gap: 6,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.3s var(--st-ease)',
        }}>
          <button style={{ flex: 1, padding: '8px 0', background: 'var(--st-ink)', color: 'var(--st-bone)', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            Vista rápida
          </button>
          <button style={{ width: 32, height: 32, background: 'var(--st-bone)', border: '1px solid var(--st-line)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-clay)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.5-2-4.5-4.5-4.5-1.7 0-3.2 1-4 2.4-.8-1.4-2.3-2.4-4-2.4C6 3.75 4 5.75 4 8.25c0 7.2 8.5 11.5 8.5 11.5s8.5-4.3 8.5-11.5z" />
            </svg>
          </button>
        </div>

        {/* Tags */}
        {p.tag && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <STBadge variant="rust">{p.tag}</STBadge>
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <STBadge variant="leaf">
            <STDot color="var(--st-leaf)" size={5} />
            {p.cond}
          </STBadge>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: 18 }}>
        <p className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          {p.spec}
        </p>
        <h3 className="st-display" style={{ fontSize: 19, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.15 }}>
          {p.name}
        </h3>

        {/* Specs row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--st-line)' }}>
          <div style={{ flex: 1 }}>
            <p className="st-mono" style={{ fontSize: 9.5, color: 'var(--st-earth)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Batería</p>
            <p style={{ fontSize: 12.5, color: 'var(--st-clay)', fontWeight: 500 }}>{p.battery}%</p>
          </div>
          <div style={{ flex: 1 }}>
            <p className="st-mono" style={{ fontSize: 9.5, color: 'var(--st-earth)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Almac.</p>
            <p style={{ fontSize: 12.5, color: 'var(--st-clay)', fontWeight: 500 }}>{p.storage}</p>
          </div>
        </div>

        {/* Precio */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="st-display" style={{ fontSize: 22, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em' }}>
              ${p.price}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--st-earth)', textDecoration: 'line-through' }}>${p.original}</span>
          </div>
          <span className="st-mono" style={{ fontSize: 11, color: 'var(--st-leaf)', fontWeight: 500 }}>
            −{Math.round((1 - p.price / p.original) * 100)}%
          </span>
        </div>
      </div>
    </article>
  );
};

window.STCatalog = STCatalog;
