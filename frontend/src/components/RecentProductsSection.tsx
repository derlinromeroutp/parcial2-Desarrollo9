import { Link } from 'react-router-dom';
import { SkeletonCard } from './ui/Skeleton';
import { useRecentProducts } from '../hooks/useRecentProducts';

export const RecentProductsSection = () => {
  const { data: products, isLoading, isError } = useRecentProducts(8);
  const recent = products ?? [];

  if (isError) return null;

  return (
    <section style={{ padding: '3rem 0 1.5rem', background: 'var(--white)' }}>
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2.5px', color: 'var(--gray)', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>
              Recién llegados
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
              Novedades del catálogo
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : recent.length === 0
              ? (
                  <div style={{ gridColumn: '1 / -1', padding: '1rem 0', color: 'var(--ink2)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                    Todavía no hay productos registrados.
                  </div>
                )
              : recent.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                    aria-label={`Ver detalles de ${product.name}`}
                  >
                    <article
                      style={{
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: 'var(--white)',
                      }}
                    >
                      <div style={{ aspectRatio: '4/3', background: 'var(--cream)', overflow: 'hidden' }}>
                        <img
                          src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/400/300`}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '0.9rem 1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.4rem', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                          {product.name}
                        </h3>
                        <p style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
        </div>
      </div>
    </section>
  );
};
