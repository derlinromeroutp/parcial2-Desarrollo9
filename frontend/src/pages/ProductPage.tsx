import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import type { Product } from '../types/product';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCheck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconStar = ({ filled = true }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconReturn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.29"/>
  </svg>
);
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconLeaf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2s0 18 20 20C22 4 2 2 2 2z"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

// ── Mock product data ──────────────────────────────────────────────────────
const DEMO_PRODUCT: Product = {
  _id: 'prod_1',
  name: 'iPhone 15 Pro Max',
  description: 'Diseño de titanio de calidad aeroespacial, chip A17 Pro y el sistema de cámara más avanzado de la historia del iPhone. Inspección técnica de 40+ puntos. Batería con 88%+ de salud.',
  price: 849.00,
  stock: 4,
  condition: 'A',
  category: 'celular',
  image_urls: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=800&q=80',
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const ORIGINAL_PRICE = 1199.00;

const SPECS = [
  { label: 'Pantalla', value: 'Super Retina XDR 6.7" OLED' },
  { label: 'Chip', value: 'Apple A17 Pro' },
  { label: 'Almacenamiento', value: '256 GB' },
  { label: 'RAM', value: '8 GB' },
  { label: 'Cámara principal', value: '48 MP Fusion, f/1.78' },
  { label: 'Batería', value: '4,422 mAh · 88%+ salud' },
  { label: 'Conectividad', value: '5G, Wi-Fi 6E, Bluetooth 5.3' },
  { label: 'Sistema operativo', value: 'iOS 17 (actualizable)' },
  { label: 'Resistencia', value: 'IP68 (6m / 30 min)' },
  { label: 'Puerto', value: 'USB-C (USB 3)' },
];

const CONDITIONS = [
  {
    grade: 'A' as const,
    label: 'Como nuevo',
    desc: 'Sin rayones visibles. Puede tener marcas microscópicas menores a 1mm.',
    price: 849,
  },
  {
    grade: 'B' as const,
    label: 'Excelente',
    desc: 'Rayones muy leves solo visibles con luz directa. Funciona perfectamente.',
    price: 749,
  },
  {
    grade: 'C' as const,
    label: 'Bueno',
    desc: 'Rayones leves en la pantalla o carcasa. Funcionalidad 100%.',
    price: 649,
  },
];

const REVIEWS = [
  {
    name: 'María F.',
    rating: 5,
    date: 'Mar 2025',
    verified: true,
    title: 'Exactamente como lo describieron',
    body: 'Llegó en caja sellada, incluía cargador y auriculares nuevos. La pantalla no tiene un rasguño. La garantía de 90 días me dio mucha tranquilidad.',
  },
  {
    name: 'Carlos R.',
    rating: 5,
    date: 'Feb 2025',
    verified: true,
    title: 'Vale cada centavo',
    body: 'Compré condición B y honestamente no le veo ningún defecto. La batería al 91%. El proceso de compra fue rápido y el soporte respondió en minutos.',
  },
  {
    name: 'Ana L.',
    rating: 4,
    date: 'Ene 2025',
    verified: true,
    title: 'Muy buena experiencia',
    body: 'El producto llegó perfectamente empacado. El único detalle es que tardó un día más de lo esperado, pero el equipo llegó impecable. Lo recomiendo.',
  },
];

const RELATED_PRODUCTS = [
  { name: 'iPhone 14 Pro', price: 699, condition: 'A', img: 'https://images.unsplash.com/photo-1677117867736-76df50c62c1f?auto=format&fit=crop&w=400&q=80' },
  { name: 'MacBook Air M2', price: 1099, condition: 'A', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { name: 'iPad Air 5', price: 499, condition: 'B', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80' },
  { name: 'AirPods Pro 2', price: 199, condition: 'A', img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80' },
];

const conditionColors: Record<string, { bg: string; color: string; border: string }> = {
  A: { bg: 'rgba(16,185,129,0.08)', color: '#065f46', border: 'rgba(16,185,129,0.3)' },
  B: { bg: 'rgba(59,130,246,0.08)', color: '#1e3a8a', border: 'rgba(59,130,246,0.3)' },
  C: { bg: 'rgba(245,158,11,0.08)', color: '#92400e', border: 'rgba(245,158,11,0.3)' },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: '#d97706' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>
          <IconStar filled={i <= Math.round(rating)} />
        </span>
      ))}
    </span>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      background: 'rgba(0,0,0,0.03)',
      border: '1px solid var(--line)',
      borderRadius: 6,
      fontSize: '0.78rem',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      color: 'var(--ink2)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ color: 'var(--ink)', display: 'flex' }}>{icon}</span>
      {label}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', width: 30, textAlign: 'right' }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--ink)',
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.72rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', width: 24 }}>{count}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ProductPage() {
  const navigate = useNavigate();
  const addToCart = useCartStore(s => s.addItem);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState<'A' | 'B' | 'C'>('A');
  const [added, setAdded] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState<string | null>('specs');

  const product = DEMO_PRODUCT;
  const condData = CONDITIONS.find(c => c.grade === selectedCondition)!;
  const savings = Math.round(ORIGINAL_PRICE - condData.price);

  function handleAddToCart() {
    addToCart({ ...product, condition: selectedCondition, price: condData.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: 'var(--header-height)' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--white)' }}>
        <div className="page-container" style={{ padding: '0.75rem 2.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontFamily: 'var(--font-sans)', color: 'var(--ink3)' }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <IconArrowLeft /> Inicio
            </button>
            <span style={{ opacity: 0.35 }}>/</span>
            <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', padding: 0 }}>
              Celulares
            </button>
            <span style={{ opacity: 0.35 }}>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero: Image + Details ── */}
      <div className="page-container" style={{ padding: '3.5rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

          {/* Left: Image Gallery */}
          <div style={{ position: 'sticky', top: 'calc(var(--header-height) + 1.5rem)' }}>
            <div style={{
              aspectRatio: '1 / 1',
              background: 'var(--white)',
              borderRadius: 12,
              border: '1px solid var(--line)',
              overflow: 'hidden',
              marginBottom: '1rem',
              position: 'relative',
            }}>
              <img
                src={product.image_urls[activeImg]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
              />
              {/* Condition badge overlay */}
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                ...conditionColors[selectedCondition],
                border: `1px solid ${conditionColors[selectedCondition].border}`,
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: '0.7rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Grado {selectedCondition} — {condData.label}
              </div>
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {product.image_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    aspectRatio: '1',
                    border: `2px solid ${activeImg === i ? 'var(--ink)' : 'var(--line)'}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'var(--white)',
                    padding: 0,
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div>
            {/* Label */}
            <p style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'var(--ink3)',
              fontFamily: 'var(--font-sans)',
              marginBottom: '0.75rem',
            }}>
              Reacondicionado · Verificado SafeTech
            </p>

            {/* Product name */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 400,
              color: 'var(--ink)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <StarRow rating={4.8} />
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-sans)', color: 'var(--ink2)', fontWeight: 500 }}>
                4.8 · 128 reseñas
              </span>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2rem' }}>
              <TrustBadge icon={<IconCheck />} label="Verificado" />
              <TrustBadge icon={<IconShield />} label="Garantía 90 días" />
              <TrustBadge icon={<IconSearch />} label="40+ inspecciones" />
            </div>

            {/* Price */}
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  letterSpacing: '-0.04em',
                }}>
                  ${condData.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span style={{
                  fontSize: '1.1rem',
                  color: 'var(--ink3)',
                  textDecoration: 'line-through',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 300,
                }}>
                  ${ORIGINAL_PRICE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span style={{
                  background: 'rgba(16,185,129,0.1)',
                  color: '#065f46',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 5,
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                }}>
                  Ahorras ${savings}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', marginTop: 6 }}>
                Impuestos incluidos · Envío gratis
              </p>
            </div>

            {/* Condition Selector */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', marginBottom: '0.75rem' }}>
                Condición
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CONDITIONS.map(c => (
                  <button
                    key={c.grade}
                    onClick={() => setSelectedCondition(c.grade)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      border: `1.5px solid ${selectedCondition === c.grade ? 'var(--ink)' : 'var(--line)'}`,
                      borderRadius: 8,
                      background: selectedCondition === c.grade ? 'var(--ink)' : 'var(--white)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-sans)',
                          ...conditionColors[c.grade],
                          border: `1px solid ${conditionColors[c.grade].border}`,
                          borderRadius: 4,
                          padding: '2px 8px',
                          letterSpacing: '0.3px',
                        }}>
                          Grado {c.grade}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: selectedCondition === c.grade ? 'var(--white)' : 'var(--ink)',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {c.label}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.75rem',
                        color: selectedCondition === c.grade ? 'rgba(255,255,255,0.55)' : 'var(--ink3)',
                        fontFamily: 'var(--font-sans)',
                        lineHeight: 1.45,
                        maxWidth: 280,
                      }}>
                        {c.desc}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: selectedCondition === c.grade ? 'var(--white)' : 'var(--ink)',
                      letterSpacing: '-0.02em',
                      flexShrink: 0,
                      marginLeft: 16,
                    }}>
                      ${c.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: product.stock <= 5 ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', color: 'var(--ink2)' }}>
                {product.stock <= 3
                  ? `Solo quedan ${product.stock} unidades`
                  : product.stock <= 5
                  ? `Pocas unidades disponibles (${product.stock})`
                  : `En stock · ${product.stock} disponibles`}
              </span>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: added ? '#10b981' : 'var(--ink)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'background 0.25s ease, transform 0.15s ease',
                  letterSpacing: '0.2px',
                }}
                onMouseEnter={e => { if (!added) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
              >
                {added ? <IconCheck size={18} /> : <IconCart />}
                {added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>

              <button
                onClick={() => navigate('/home')}
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1.5px solid var(--ink)',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.2px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--ink)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--white)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)';
                }}
              >
                Ver más opciones
              </button>
            </div>

            {/* Trust note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: <IconReturn />, text: 'Devoluciones gratis en 30 días' },
                { icon: <IconShield />, text: 'Garantía SafeTech de 90 días incluida' },
                { icon: <IconLock />, text: 'Pago 100% seguro y encriptado' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', fontFamily: 'var(--font-sans)', color: 'var(--ink2)' }}>
                  <span style={{ color: 'var(--ink3)', display: 'flex' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Strip ── */}
      <section style={{ background: 'var(--ink)', padding: '3rem 0' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {[
              { icon: <IconSearch />, title: '40+ Puntos de inspección', sub: 'Hardware y software revisado' },
              { icon: <IconShield />, title: 'Garantía de 90 días', sub: 'Cubrimos defectos de fábrica' },
              { icon: <IconReturn />, title: 'Devolución en 30 días', sub: 'Sin preguntas, sin costo' },
              { icon: <IconLock />, title: 'Pago seguro', sub: 'SSL 256-bit encriptado' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--white)', fontFamily: 'var(--font-sans)', marginBottom: 4 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)' }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Info Accordions ── */}
      <div className="page-container" style={{ padding: '4rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>

          {/* Specs */}
          <div>
            <button
              onClick={() => setExpandedSpec(expandedSpec === 'specs' ? null : 'specs')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                borderBottom: '1.5px solid var(--ink)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                Especificaciones técnicas
              </h2>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSpec === 'specs' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {expandedSpec === 'specs' && (
              <div>
                {SPECS.map((spec, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                      {spec.label}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What's included */}
          <div>
            <div style={{
              borderBottom: '1.5px solid var(--ink)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                ¿Qué incluye?
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'iPhone 15 Pro Max (condición seleccionada)',
                'Cable USB-C de 1 m (nuevo)',
                'Cargador USB-C de 20W (nuevo)',
                'Guía de inicio SafeTech',
                'Caja SafeTech certificada',
                'Garantía SafeTech 90 días activada',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.875rem', fontFamily: 'var(--font-sans)', color: 'var(--ink2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: 'var(--ink)', borderRadius: '50%', flexShrink: 0 }}>
                    <IconCheck size={11} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.025)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', lineHeight: 1.6, fontStyle: 'italic' }}>
                Todos los dispositivos SafeTech pasan por un protocolo de 40+ puntos de inspección y son restablecidos a configuración de fábrica. Los datos del dueño anterior son completamente borrados.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Condition Grade Explainer ── */}
      <section style={{ background: 'var(--white)', padding: '5rem 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', marginBottom: '0.75rem' }}>
              Nuestro sistema de calificación
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.025em' }}>
              Cada grado, verificado y garantizado
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {CONDITIONS.map(c => (
              <div
                key={c.grade}
                style={{
                  padding: '2rem',
                  border: `1.5px solid ${selectedCondition === c.grade ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: 12,
                  background: selectedCondition === c.grade ? 'var(--ink)' : 'var(--white)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedCondition(c.grade)}
              >
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 44,
                    height: 44,
                    lineHeight: '44px',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: selectedCondition === c.grade ? 'rgba(255,255,255,0.1)' : conditionColors[c.grade].bg,
                    border: `1.5px solid ${selectedCondition === c.grade ? 'rgba(255,255,255,0.2)' : conditionColors[c.grade].border}`,
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: selectedCondition === c.grade ? 'var(--white)' : conditionColors[c.grade].color,
                  }}>
                    {c.grade}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: selectedCondition === c.grade ? 'var(--white)' : 'var(--ink)',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.01em',
                }}>
                  {c.label}
                </h3>
                <p style={{ fontSize: '0.83rem', color: selectedCondition === c.grade ? 'rgba(255,255,255,0.55)' : 'var(--ink3)', fontFamily: 'var(--font-sans)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {c.desc}
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.375rem',
                  fontWeight: 400,
                  letterSpacing: '-0.03em',
                  color: selectedCondition === c.grade ? 'var(--white)' : 'var(--ink)',
                }}>
                  ${c.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why SafeTech ── */}
      <section style={{ padding: '5rem 0', background: 'var(--cream)' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', marginBottom: '0.75rem' }}>
              Por qué elegir SafeTech
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.025em' }}>
              Tecnología que puedes confiar
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              {
                icon: <IconSearch />,
                title: 'Inspección experta',
                body: 'Cada dispositivo es revisado por técnicos certificados en 40+ puntos: pantalla, batería, cámara, puertos, conectividad y software.',
              },
              {
                icon: <IconShield />,
                title: 'Garantía real de 90 días',
                body: 'No es letra pequeña. Si algo falla en 90 días, lo reparamos o te devolvemos tu dinero. Sin condiciones absurdas.',
              },
              {
                icon: <IconLeaf />,
                title: 'Impacto positivo',
                body: 'Cada dispositivo reacondicionado evita hasta 70kg de CO₂. Comprar usado es la decisión más inteligente y sostenible.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '2.5rem 2rem',
                  background: 'var(--white)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 12,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 48px rgba(0,0,0,0.1)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)';
                }}
              >
                <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.04)', borderRadius: 10, marginBottom: '1.25rem', color: 'var(--ink)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.625rem', letterSpacing: '-0.01em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink2)', fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section style={{ padding: '5rem 0', background: 'var(--white)', borderTop: '1px solid var(--line)' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem', alignItems: 'start' }}>

            {/* Aggregate rating */}
            <div style={{ position: 'sticky', top: 'calc(var(--header-height) + 2rem)' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', marginBottom: '1rem' }}>
                Reseñas de clientes
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 300, color: 'var(--ink)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  4.8
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)' }}>/ 5</span>
              </div>
              <StarRow rating={4.8} />
              <p style={{ fontSize: '0.8rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', marginTop: 6, marginBottom: '1.75rem' }}>
                128 reseñas verificadas
              </p>

              <div>
                <RatingBar label="5★" count={95} total={128} />
                <RatingBar label="4★" count={24} total={128} />
                <RatingBar label="3★" count={6} total={128} />
                <RatingBar label="2★" count={2} total={128} />
                <RatingBar label="1★" count={1} total={128} />
              </div>
            </div>

            {/* Individual reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
                Lo que dicen nuestros clientes
              </h3>
              {REVIEWS.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--cream)',
                    border: '1.5px solid var(--line)',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>{r.name}</span>
                        {r.verified && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 600, color: '#065f46', fontFamily: 'var(--font-sans)', background: 'rgba(16,185,129,0.1)', borderRadius: 4, padding: '2px 8px' }}>
                            <IconCheck size={10} /> Compra verificada
                          </span>
                        )}
                      </div>
                      <StarRow rating={r.rating} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', flexShrink: 0 }}>{r.date}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)', marginBottom: '0.4rem' }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', fontFamily: 'var(--font-sans)', lineHeight: 1.65 }}>
                    {r.body}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      <section style={{ padding: '5rem 0', background: 'var(--cream)', borderTop: '1px solid var(--line)' }}>
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.025em' }}>
              También te puede gustar
            </h2>
            <button
              onClick={() => navigate('/home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
            >
              Ver todo el catálogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {RELATED_PRODUCTS.map((p, i) => (
              <button
                key={i}
                onClick={() => navigate('/home')}
                style={{
                  display: 'block',
                  background: 'var(--white)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = '';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)';
                }}
              >
                <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--cream)' }}>
                  <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)'}
                    onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ''}
                  />
                </div>
                <div style={{ padding: '1rem 1.125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>{p.name}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
                      ...conditionColors[p.condition],
                      border: `1px solid ${conditionColors[p.condition].border}`,
                      borderRadius: 4, padding: '2px 7px',
                    }}>
                      {p.condition}
                    </span>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    ${p.price.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 1024px) {
          .product-hero-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .product-hero-sticky { position: static !important; }
        }
        @media (max-width: 900px) {
          .trust-strip-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .condition-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .trust-strip-grid { grid-template-columns: 1fr 1fr !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
