import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewedStore } from '../store/recentlyViewed.store';
import { useProduct } from '../hooks/useProducts';

const RecentlyViewedCard: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: product } = useProduct(productId);
  if (!product) return null;

  return (
    <Link
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
  );
};

export const RecentlyViewedSection: React.FC = () => {
  const productIds = useRecentlyViewedStore((s) => s.productIds);
  const clearRecentlyViewed = useRecentlyViewedStore((s) => s.clearRecentlyViewed);

  if (productIds.length === 0) return null;

  return (
    <section style={{ padding: '3rem 0 0', background: 'var(--white)' }}>
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
            Vistos recientemente
          </h2>
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '8px 16px' }}
          >
            Limpiar historial
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {productIds.map((productId) => (
            <RecentlyViewedCard key={productId} productId={productId} />
          ))}
        </div>
      </div>
    </section>
  );
};
