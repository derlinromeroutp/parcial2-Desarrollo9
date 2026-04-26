import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const CATEGORY_LABEL: Record<string, string> = {
  celular: 'Celular',
  laptop: 'Laptop',
  pc: 'PC',
  auriculares: 'Auriculares',
  tablet: 'Tablet',
};

const CONDITION_LABEL: Record<string, string> = {
  A: 'Excelente',
  B: 'Buena',
  C: 'Regular',
};

const conditionColors: Record<string, { bg: string; color: string; border: string }> = {
  A: { bg: 'rgba(16,185,129,0.08)', color: '#065f46', border: 'rgba(16,185,129,0.3)' },
  B: { bg: 'rgba(59,130,246,0.08)', color: '#1e3a8a', border: 'rgba(59,130,246,0.3)' },
  C: { bg: 'rgba(245,158,11,0.08)', color: '#92400e', border: 'rgba(245,158,11,0.3)' },
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error } = useProduct(id);

  const addItem = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="page-container" style={{ padding: '3rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <SkeletonCard />
          <div>
            <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%', height: 28, marginBottom: '1.5rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '30%', height: 32, marginBottom: '1.5rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: 8 }} />
            <div className="skeleton skeleton-text" style={{ width: '95%', marginBottom: 8 }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="page-container" style={{ padding: '4rem 2.5rem' }}>
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
          title="Producto no encontrado"
          description={error?.message || 'No pudimos cargar este producto. Es posible que ya no esté disponible.'}
          cta={
            <button className="btn-outline" onClick={() => navigate('/home')}>
              Volver al catálogo
            </button>
          }
        />
      </div>
    );
  }

  const images = product.image_urls?.length
    ? product.image_urls
    : [`https://picsum.photos/seed/${product._id}/800/800`];

  const cond = conditionColors[product.condition] ?? conditionColors.A;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product);
    toggleDrawer();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--white)' }}>
        <div className="page-container" style={{ padding: '0.85rem 2.5rem' }}>
          <nav
            aria-label="breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.78rem',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink3)',
            }}
          >
            <Link to="/" style={{ color: 'var(--ink3)' }}>Inicio</Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <Link to="/home" style={{ color: 'var(--ink3)' }}>Catálogo</Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="page-container" style={{ padding: '3rem 2.5rem' }}>
        <div
          className="product-detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'start',
          }}
        >
          {/* Gallery */}
          <div>
            <div
              style={{
                aspectRatio: '1 / 1',
                background: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '1rem',
                position: 'relative',
              }}
            >
              <img
                src={images[activeImg]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  ...cond,
                  border: `1px solid ${cond.border}`,
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Condición {product.condition} · {CONDITION_LABEL[product.condition]}
              </span>
            </div>

            {images.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {images.slice(0, 4).map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    style={{
                      aspectRatio: '1',
                      border: `2px solid ${activeImg === i ? 'var(--ink)' : 'var(--line)'}`,
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'var(--white)',
                      padding: 0,
                      transition: 'border-color var(--transition)',
                    }}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <p
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'var(--ink3)',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: '0.75rem',
                }}
              >
                {CATEGORY_LABEL[product.category] ?? product.category} · Reacondicionado
              </p>
            )}

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: '2rem',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  letterSpacing: '-0.04em',
                }}
              >
                ${product.price.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--ink3)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Impuestos incluidos
              </span>
            </div>

            {/* Stock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : 'var(--ink2)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#10b981',
                  display: 'inline-block',
                }}
              />
              {isOutOfStock
                ? 'Agotado'
                : isLowStock
                ? `Solo quedan ${product.stock} unidades`
                : `${product.stock} disponibles en stock`}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: '2rem' }}>
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--ink3)',
                    fontFamily: 'var(--font-sans)',
                    marginBottom: '0.625rem',
                  }}
                >
                  Descripción
                </p>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--ink2)',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.7,
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: added ? '#10b981' : 'var(--ink)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  letterSpacing: '0.3px',
                  opacity: isOutOfStock ? 0.5 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                {isOutOfStock ? 'Agotado' : added ? 'Añadido al carrito' : 'Añadir al carrito'}
              </button>

              <Link
                to="/home"
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                }}
              >
                Seguir comprando
              </Link>
            </div>

            {/* Trust strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--line)',
              }}
            >
              {[
                { label: 'Garantía 90 días', sub: 'Cubrimos defectos' },
                { label: 'Envío gratis', sub: 'En pedidos > $100' },
                { label: 'Devolución 30 días', sub: 'Sin preguntas' },
                { label: 'Pago seguro', sub: 'SSL 256-bit' },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(0,0,0,0.025)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-sans)',
                      marginBottom: 2,
                    }}
                  >
                    {t.label}
                  </p>
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--ink3)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {t.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
