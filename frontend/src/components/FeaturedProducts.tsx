import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { Link } from 'react-router-dom';
import { SkeletonCard } from './ui/Skeleton';

export const FeaturedProducts: React.FC = () => {
  const { data: products, isLoading, isError } = useProducts();
  const addItem = useCartStore((state) => state.addItem);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const featured = products?.slice(0, 4) ?? [];

  const conditionColor: Record<string, string> = {
    A: 'rgba(74,92,69,0.14)',
    B: 'rgba(142,141,136,0.14)',
    C: 'rgba(92,91,87,0.14)',
  };
  const conditionText: Record<string, string> = {
    A: 'var(--st-leaf)',
    B: 'var(--st-earth)',
    C: 'var(--st-taupe)',
  };

  return (
    <section style={{ padding: '120px 32px', background: 'var(--st-bone)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <p className="st-eyebrow" style={{ marginBottom: 16 }}>Catálogo destacado</p>
            <h2
              className="st-display"
              style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', color: 'var(--st-clay)' }}
            >
              Lo que está saliendo{' '}
              <em style={{ fontStyle: 'italic' }}>esta semana.</em>
            </h2>
          </div>
          <Link
            to="/home"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', background: 'transparent', color: 'var(--st-clay)',
              border: '1px solid var(--st-clay)', borderRadius: 'var(--st-radius-pill)',
              fontFamily: 'var(--st-font-sans)', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.3s var(--st-ease)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--st-ink)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--st-bone)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--st-ink)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--st-clay)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--st-clay)'; }}
          >
            Ver todo el catálogo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        {isError ? null : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map((product, i) => {
                  const isActive = activeIdx === i;
                  const cond = product.condition ?? 'A';
                  return (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                      aria-label={`Ver detalles de ${product.name}`}
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseLeave={() => setActiveIdx(null)}
                    >
                      <article
                        style={{
                          background: 'var(--st-cream)',
                          border: '1px solid var(--st-line)',
                          borderRadius: 16,
                          padding: 20,
                          cursor: 'pointer',
                          transition: 'all 0.4s var(--st-ease)',
                          transform: isActive ? 'translateY(-4px)' : 'none',
                          boxShadow: isActive ? '0 24px 48px -16px rgba(46,45,43,0.18)' : 'none',
                        }}
                      >
                        {/* Image area */}
                        <div
                          style={{
                            position: 'relative', aspectRatio: '1',
                            background: 'var(--st-bone)', borderRadius: 12,
                            marginBottom: 18, overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <img
                            src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/400/300`}
                            alt={product.name}
                            style={{
                              width: '100%', height: '100%', objectFit: 'cover',
                              transition: 'transform 500ms var(--st-ease)',
                              transform: isActive ? 'rotate(-4deg) scale(1.05)' : 'none',
                            }}
                          />
                          {/* Condition badge */}
                          <div style={{ position: 'absolute', top: 12, right: 12 }}>
                            <span
                              className="st-mono"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '4px 10px', fontSize: 11, fontWeight: 500,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                borderRadius: 'var(--st-radius-pill)',
                                background: conditionColor[cond] ?? conditionColor.A,
                                color: conditionText[cond] ?? conditionText.A,
                              }}
                            >
                              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'currentColor', animation: 'st-pulse 2s ease-in-out infinite' }} />
                              Cond. {cond}
                            </span>
                          </div>
                        </div>

                        <p className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-earth)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                          {product.category ?? 'Dispositivo'}
                        </p>
                        <h3 className="st-display" style={{ fontSize: 20, fontWeight: 400, color: 'var(--st-clay)', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.15 }}>
                          {product.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                          <span className="st-display" style={{ fontSize: 22, fontWeight: 400, color: 'var(--st-clay)' }}>
                            ${product.price.toFixed(2)}
                          </span>
                        </div>

                        <button
                          style={{
                            width: '100%', padding: '10px 0',
                            background: isActive ? 'var(--st-clay)' : 'transparent',
                            color: isActive ? 'var(--st-bone)' : 'var(--st-clay)',
                            border: `1px solid ${isActive ? 'var(--st-clay)' : 'var(--st-line)'}`,
                            borderRadius: 'var(--st-radius-pill)',
                            fontFamily: 'var(--st-font-sans)', fontSize: 13, fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.3s var(--st-ease)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product);
                            toggleDrawer();
                          }}
                        >
                          Añadir
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </article>
                    </Link>
                  );
                })}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 1100px) {
          .featured-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .featured-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .featured-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};
