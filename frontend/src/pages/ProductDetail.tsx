import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '../hooks/useProducts';
import { useProductInspection } from '../hooks/useInspection';
import { useCartStore } from '../store/cart.store';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useWishlistCheck, useAddToWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useAuth } from '../lib/auth';
import { useCompareStore, MAX_COMPARE_ITEMS } from '../store/compare.store';

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
  const { data: relatedProducts } = useRelatedProducts(id);
  const { data: inspectionReport, isLoading: isInspectionLoading } = useProductInspection(id);

  const addItem = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  const { isSignedIn } = useAuth();
  const { data: isWishlisted } = useWishlistCheck(id);
  const addWishlist = useAddToWishlist();
  const removeWishlist = useRemoveFromWishlist();

  const isComparing = useCompareStore((s) => (id ? s.productIds.includes(id) : false));
  const compareCount = useCompareStore((s) => s.productIds.length);
  const toggleCompare = useCompareStore((s) => s.toggleProduct);
  const compareDisabled = !isComparing && compareCount >= MAX_COMPARE_ITEMS;

  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleWishlist = () => {
    if (!id) return;
    if (isWishlisted) {
      removeWishlist.mutate(id);
    } else {
      addWishlist.mutate(id);
    }
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
                  fontSize: '0.875rem',
                  letterSpacing: '0.3px',
                  opacity: isOutOfStock ? 0.5 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                {isOutOfStock ? 'Agotado' : added ? 'Añadido al carrito' : 'Añadir al carrito'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {copied ? 'Enlace copiado' : 'Compartir'}
              </button>

              {isSignedIn && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="btn-outline"
                  style={{
                    width: '100%',
                    padding: '13px 24px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? '#ef4444' : 'none'} stroke={isWishlisted ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  {isWishlisted ? 'En mi lista de deseos' : 'Agregar a mi lista'}
                </button>
              )}

              <button
                type="button"
                onClick={() => id && toggleCompare(id)}
                disabled={compareDisabled}
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: compareDisabled ? 'not-allowed' : 'pointer',
                  opacity: compareDisabled ? 0.5 : 1,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3v18M15 3v18M4 8h5m6 0h5M4 16h5m6 0h5" />
                </svg>
                {isComparing ? 'Quitar de comparación' : 'Comparar'}
              </button>

              <Link
                to="/home"
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '13px 24px',
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

      {/* Ficha de inspeccion tecnica (HU-46) */}
      {!isInspectionLoading && (
        <div className="page-container" style={{ padding: '2rem 2.5rem 0' }}>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
              marginBottom: '1.25rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--line)',
            }}
          >
            Ficha de inspección técnica
          </h2>
          {inspectionReport ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {inspectionReport.checklist.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.9rem 1rem',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: item.passed ? '#22c55e' : '#DC2626', color: '#fff', fontSize: '0.65rem',
                    }}
                    aria-hidden="true"
                  >
                    {item.passed ? '✓' : '✕'}
                  </span>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)', marginBottom: 2 }}>
                      {item.aspect}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink2)', fontFamily: 'var(--font-sans)' }}>
                      {item.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', fontFamily: 'var(--font-sans)' }}>
              Este producto todavía no tiene una ficha de inspección técnica registrada.
            </p>
          )}
        </div>
      )}

      {/* Productos relacionados (HU-44) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="page-container" style={{ padding: '0 2.5rem 3.5rem' }}>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
              marginBottom: '1.25rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--line)',
            }}
          >
            También te puede interesar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {relatedProducts.map((related) => (
              <Link
                key={related._id}
                to={`/product/${related._id}`}
                style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                aria-label={`Ver detalles de ${related.name}`}
              >
                <article
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--white)',
                    transition: 'box-shadow 180ms ease, transform 180ms ease',
                  }}
                >
                  <div style={{ aspectRatio: '4/3', background: 'var(--cream)', overflow: 'hidden' }}>
                    <img
                      src={related.image_urls?.[0] || `https://picsum.photos/seed/${related._id}/400/300`}
                      alt={related.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '0.9rem 1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.4rem', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                      {related.name}
                    </h3>
                    <p style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                      ${related.price.toFixed(2)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}

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
