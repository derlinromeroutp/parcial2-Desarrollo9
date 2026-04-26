/* Benefits Grid + Product Showcase */

const STBenefitsGrid = () => {
  const benefits = [
    {
      eyebrow: '01 · INSPECCIÓN',
      title: '40+ puntos de control',
      desc: 'Cada dispositivo pasa por verificación rigurosa de hardware, software y batería.',
      stat: '40',
      statLabel: 'Puntos verificados',
      visual: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x1 = 50 + Math.cos(angle) * 32;
            const y1 = 50 + Math.sin(angle) * 32;
            const x2 = 50 + Math.cos(angle) * 38;
            const y2 = 50 + Math.sin(angle) * 38;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.8" />;
          })}
          <circle cx="50" cy="50" r="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      eyebrow: '02 · GARANTÍA',
      title: '90 días de respaldo',
      desc: 'Si algo falla en los primeros tres meses, lo reemplazamos. Punto.',
      stat: '90d',
      statLabel: 'Cobertura total',
      visual: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M50 12 L82 24 V52 C82 70 68 84 50 88 C32 84 18 70 18 52 V24 L50 12 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <path d="M50 18 L76 28 V52 C76 67 64 79 50 82 C36 79 24 67 24 52 V28 L50 18 Z" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <path d="M40 50 L47 57 L62 42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      eyebrow: '03 · PRECIO',
      title: 'Hasta 40% menos',
      desc: 'Misma calidad técnica que un equipo nuevo. Sin pagar el sobreprecio del estreno.',
      stat: '−40%',
      statLabel: 'Vs. precio retail',
      visual: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
          <rect x="20" y="30" width="50" height="6" rx="3" fill="currentColor" opacity="0.15" />
          <rect x="20" y="42" width="50" height="6" rx="3" fill="currentColor" opacity="0.3" />
          <rect x="20" y="54" width="50" height="6" rx="3" fill="currentColor" opacity="0.5" />
          <rect x="20" y="66" width="30" height="6" rx="3" fill="currentColor" />
          <path d="M62 24 L72 24 L72 34 M72 24 L60 36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      eyebrow: '04 · IMPACTO',
      title: 'Una vida más, no menos',
      desc: 'Cada dispositivo refurbished evita extracción de tierras raras y reduce e-waste.',
      stat: '12kg',
      statLabel: 'CO₂ ahorrado / equipo',
      visual: (
        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M50 18 C30 28 24 45 30 60 C36 75 50 80 50 80 C50 80 64 75 70 60 C76 45 70 28 50 18 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <path d="M50 78 V40" stroke="currentColor" strokeWidth="0.8" />
          <path d="M50 50 L40 42 M50 58 L60 50 M50 66 L40 58" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-bone)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 32 }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>Por qué SafeTech</p>
            <h2 className="st-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)', maxWidth: 640 }}>
              Cuatro promesas <em style={{ fontStyle: 'italic' }}>concretas</em>, no marketing.
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--st-earth)', maxWidth: 280, lineHeight: 1.6, paddingBottom: 8 }}>
            Lo que distingue un equipo de SafeTech de cualquier otro reacondicionado del mercado.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--st-line)', border: '1px solid var(--st-line)', borderRadius: 18, overflow: 'hidden' }}>
          {benefits.map((b, i) => (
            <BenefitCard key={i} b={b} />
          ))}
        </div>
      </div>
    </section>
  );
};

const BenefitCard = ({ b }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--st-ink)' : 'var(--st-bone)',
        color: hover ? 'var(--st-bone)' : 'var(--st-clay)',
        padding: '40px 36px',
        position: 'relative',
        minHeight: 320,
        cursor: 'pointer',
        transition: 'all 0.5s var(--st-ease)',
        overflow: 'hidden',
      }}
    >
      {/* Visual graphic */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          right: 28,
          width: 100,
          height: 100,
          color: hover ? 'var(--st-taupe)' : 'var(--st-sand)',
          opacity: hover ? 0.5 : 0.7,
          transition: 'all 0.5s var(--st-ease)',
          transform: hover ? 'rotate(20deg) scale(1.1)' : 'rotate(0) scale(1)',
        }}
      >
        {b.visual}
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 240 }}>
        <p className="st-mono" style={{ fontSize: 11, color: hover ? 'var(--st-taupe)' : 'var(--st-earth)', letterSpacing: '0.1em', marginBottom: 'auto', transition: 'color 0.5s var(--st-ease)' }}>
          {b.eyebrow}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <p
            className="st-display"
            style={{
              fontSize: 64,
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: hover ? 'var(--st-bone)' : 'var(--st-clay)',
              marginBottom: 8,
              transition: 'color 0.5s var(--st-ease)',
            }}
          >
            {b.stat}
          </p>
          <p className="st-mono" style={{ fontSize: 11, color: hover ? 'var(--st-taupe)' : 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, transition: 'color 0.5s var(--st-ease)' }}>
            {b.statLabel}
          </p>

          <h3 className="st-display" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {b.title}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: hover ? 'rgba(247,243,236,0.7)' : 'var(--st-earth)', maxWidth: 380, transition: 'color 0.5s var(--st-ease)' }}>
            {b.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Product Showcase ─────────────────────────────────────

const STProductShowcase = () => {
  const products = [
    { name: 'iPhone 14 Pro', cat: 'Smartphone', cond: 'Excellent', price: 849, original: 1099, badge: 'Más vendido', color: '#3A2E26' },
    { name: 'MacBook Pro 14"', cat: 'Laptop', cond: 'Excellent', price: 1620, original: 2499, badge: null, color: '#5C4632' },
    { name: 'iPad Air 5', cat: 'Tablet', cond: 'Good', price: 459, original: 749, badge: 'Pocas unidades', color: '#8C7256' },
    { name: 'AirPods Pro 2', cat: 'Audio', cond: 'Excellent', price: 159, original: 249, badge: null, color: '#B5A187' },
  ];

  const [active, setActive] = React.useState(0);

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-bone)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>Catálogo destacado</p>
            <h2 className="st-display" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)' }}>
              Lo que está saliendo <em style={{ fontStyle: 'italic' }}>esta semana.</em>
            </h2>
          </div>
          <STButton variant="secondary" iconRight={<STIcons.arrow />}>Ver todo el catálogo</STButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {products.map((p, i) => (
            <ProductCard key={p.name} p={p} active={active === i} onHover={() => setActive(i)} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ p, active, onHover }) => {
  return (
    <article
      onMouseEnter={onHover}
      style={{
        background: 'var(--st-cream)',
        border: '1px solid var(--st-line)',
        borderRadius: 16,
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.4s var(--st-ease)',
        transform: active ? 'translateY(-4px)' : 'none',
        boxShadow: active ? '0 24px 48px -16px rgba(92,70,50,0.18)' : 'none',
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--st-bone)', borderRadius: 12, marginBottom: 18, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Mock device shape */}
        <div
          style={{
            width: '50%',
            height: '70%',
            background: `linear-gradient(145deg, ${p.color}DD, ${p.color})`,
            borderRadius: 16,
            boxShadow: '0 12px 32px -8px rgba(42,31,23,0.3)',
            transform: active ? 'rotate(-4deg) scale(1.05)' : 'rotate(0) scale(1)',
            transition: 'transform 0.5s var(--st-ease)',
          }}
        />
        {/* Badge */}
        {p.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <STBadge variant="rust">{p.badge}</STBadge>
          </div>
        )}
        {/* Cond badge */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <STBadge variant="leaf">
            <STDot color="var(--st-leaf)" size={5} />
            {p.cond}
          </STBadge>
        </div>
      </div>

      <p className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        {p.cat}
      </p>
      <h3 className="st-display" style={{ fontSize: 20, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.15 }}>
        {p.name}
      </h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span className="st-display" style={{ fontSize: 22, fontWeight: 400, color: 'var(--st-clay)' }}>
          ${p.price}
        </span>
        <span style={{ fontSize: 13, color: 'var(--st-earth)', textDecoration: 'line-through' }}>${p.original}</span>
      </div>
      <button
        style={{
          width: '100%',
          padding: '10px 0',
          background: active ? 'var(--st-ink)' : 'transparent',
          color: active ? 'var(--st-bone)' : 'var(--st-clay)',
          border: `1px solid ${active ? 'var(--st-ink)' : 'var(--st-line)'}`,
          borderRadius: 'var(--st-radius-pill)',
          fontFamily: 'var(--st-font-sans)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.3s var(--st-ease)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        Añadir <STIcons.plus />
      </button>
    </article>
  );
};

window.STBenefitsGrid = STBenefitsGrid;
window.STProductShowcase = STProductShowcase;
