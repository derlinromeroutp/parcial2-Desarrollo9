import { Link } from 'react-router-dom';
import { SkeletonCard } from './ui/Skeleton';
import { useBestSellers } from '../hooks/useBestSellers';

function formatUnits(unitsSold: number) {
  return unitsSold === 1 ? '1 vendido' : `${unitsSold} vendidos`;
}

export const BestSellersSection = () => {
  const { data: products, isLoading, isError } = useBestSellers(4);
  const featured = products ?? [];

  return (
    <section style={{ padding: '3rem 0 1.5rem', background: 'var(--white)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2.5px', color: 'var(--gray)', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>
              Más vendidos
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
              Lo que más compran otros clientes
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink2)', fontFamily: 'var(--font-sans)', maxWidth: 460, lineHeight: 1.6 }}>
            Se ordena por volumen de ventas confirmadas, no por heurísticas de frontend.
          </p>
        </div>

        {isError ? null : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.length === 0
                ? (
                    <div style={{ gridColumn: '1 / -1', padding: '1rem 0', color: 'var(--ink2)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                      Todavia no hay suficientes ventas confirmadas para mostrar productos destacados.
                    </div>
                  )
                : featured.map((product, index) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                      aria-label={`Ver detalles de ${product.name}`}
                    >
                      <article
                        style={{
                          height: '100%',
                          border: '1px solid var(--line)',
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: 'var(--white)',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.04)',
                          transition: 'transform 180ms ease, box-shadow 180ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.04)';
                        }}
                      >
                        <div style={{ aspectRatio: '1 / 1', background: 'var(--cream)', overflow: 'hidden' }}>
                          <img
                            src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/500/500`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>
                              #{index + 1}
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>
                              {formatUnits(product.unitsSold)}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.25, marginBottom: '0.4rem', color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                            {product.name}
                          </h3>
                          <p style={{ fontSize: '0.9rem', color: 'var(--ink2)', fontFamily: 'var(--font-sans)', marginBottom: '0.85rem' }}>
                            ${product.price.toFixed(2)}
                          </p>
                          <p style={{ fontSize: '0.74rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)', lineHeight: 1.4 }}>
                            Vendido desde pedidos pagados confirmados.
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
          </div>
        )}
      </div>
    </section>
  );
};
