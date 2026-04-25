import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { Link } from 'react-router-dom';
import { SkeletonCard } from './ui/Skeleton';

export const FeaturedProducts: React.FC = () => {
  const { data: products, isLoading, isError } = useProducts();
  const addItem = useCartStore((state) => state.addItem);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  const featured = products?.slice(0, 6) ?? [];

  return (
    <section style={{ padding: '5rem 0', background: 'var(--white)' }}>
      <div className="page-container">

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '0.5px solid var(--line)',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.68rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
              color: 'var(--ink3)',
              marginBottom: '0.75rem',
            }}>
              Verificados por técnicos
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontWeight: 400,
              letterSpacing: '-0.5px',
              lineHeight: 1.05,
              color: 'var(--ink)',
              margin: 0,
            }}>
              Productos destacados
            </h2>
          </div>
          <Link
            to="/home"
            className="nav-link"
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            Ver todo →
          </Link>
        </div>

        {/* Grid */}
        {isError ? null : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map((product) => (
                  <article key={product._id} className="product-card">
                    <div className="product-image-container">
                      <span className="product-badge">{product.condition}</span>
                      <img
                        src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/400/300`}
                        alt={product.name}
                        className="product-image"
                      />
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      <div className="product-price">${product.price.toFixed(2)}</div>
                      <p className="product-desc" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {product.description}
                      </p>
                      <div className="product-add-wrapper">
                        <button
                          className="product-add-btn"
                          onClick={() => {
                            addItem(product);
                            toggleDrawer();
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Añadir al carrito
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        )}

      </div>
    </section>
  );
};
