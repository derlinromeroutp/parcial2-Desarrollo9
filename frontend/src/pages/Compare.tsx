import React from 'react';
import { Link } from 'react-router-dom';
import { useCompareStore } from '../store/compare.store';
import { useProductsCompare } from '../hooks/useProducts';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import type { Product } from '../types/product';

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

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ROWS: { label: string; render: (p: Product) => React.ReactNode }[] = [
  { label: 'Precio', render: (p) => fmt(p.price) },
  { label: 'Condición', render: (p) => CONDITION_LABEL[p.condition] ?? p.condition },
  { label: 'Categoría', render: (p) => CATEGORY_LABEL[p.category] ?? p.category },
  { label: 'Stock', render: (p) => (p.stock > 0 ? `${p.stock} disponibles` : 'Agotado') },
  { label: 'Descripción', render: (p) => p.description || '—' },
];

const Compare: React.FC = () => {
  const productIds = useCompareStore((s) => s.productIds);
  const removeProduct = useCompareStore((s) => s.removeProduct);
  const clearCompare = useCompareStore((s) => s.clearCompare);

  const { data: products, isLoading, isError, error } = useProductsCompare(productIds);

  return (
    <div className="page-container" style={{ padding: '3rem 2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--ink)' }}>
          Comparar productos
        </h1>
        {productIds.length > 0 && (
          <button className="btn-outline" onClick={clearCompare} style={{ fontSize: '0.78rem', padding: '8px 16px' }}>
            Vaciar comparación
          </button>
        )}
      </div>

      {productIds.length < 2 ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18m6-18v18M4 8h5m6 0h5M4 16h5m6 0h5" />
            </svg>
          }
          title="Selecciona al menos dos productos"
          description="Agrega productos a la comparación desde el catálogo para ver sus diferencias lado a lado."
          cta={
            <Link to="/home" className="btn-outline" style={{ fontSize: '0.78rem', padding: '8px 16px', textDecoration: 'none' }}>
              Ir al catálogo
            </Link>
          }
        />
      ) : isLoading ? (
        <div className="products-grid">
          {productIds.map((id) => <SkeletonCard key={id} />)}
        </div>
      ) : isError ? (
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
          title="Error al cargar la comparación"
          description={error?.message || 'No pudimos cargar los productos seleccionados.'}
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.75rem', width: 140, borderBottom: '1px solid var(--line)' }} />
                {products?.map((product) => (
                  <th key={product._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)', minWidth: 200, verticalAlign: 'top' }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => removeProduct(product._id)}
                        aria-label={`Quitar ${product.name} de la comparación`}
                        style={{
                          position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%',
                          border: '1px solid var(--line)', background: 'var(--white)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--ink2)',
                        }}
                      >
                        ×
                      </button>
                      <img
                        src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/300/220`}
                        alt={product.name}
                        style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}
                      />
                      <Link
                        to={`/product/${product._id}`}
                        style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <td style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink2)', borderBottom: '1px solid var(--line)' }}>
                    {row.label}
                  </td>
                  {products?.map((product) => (
                    <td key={product._id} style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--ink)', borderBottom: '1px solid var(--line)' }}>
                      {row.render(product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;
