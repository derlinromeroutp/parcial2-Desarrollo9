import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cart.store';
import { SkeletonCard } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';

const ITEMS_PER_PAGE = 12;

const CONDITIONS = [
  { label: 'Todas', value: '' },
  { label: 'A (Excelente)', value: 'A' },
  { label: 'B (Buena)', value: 'B' },
  { label: 'C (Regular)', value: 'C' },
];

const CATEGORIES = [
  { label: 'Todos', value: '' },
  { label: 'Celulares', value: 'celular' },
  { label: 'Laptops', value: 'laptop' },
  { label: 'PCs', value: 'pc' },
  { label: 'Auriculares', value: 'auriculares' },
  { label: 'Tablets', value: 'tablet' },
];

const BRANDS = [
  { label: 'Todas', value: '' },
  { label: 'Apple', value: 'apple' },
  { label: 'Samsung', value: 'samsung' },
  { label: 'Sony', value: 'sony' },
  { label: 'Bose', value: 'bose' },
  { label: 'Lenovo', value: 'lenovo' },
  { label: 'Dell', value: 'dell' },
];

const PRICE_RANGES = [
  { label: 'Cualquier precio', min: 0, max: Infinity },
  { label: 'Menos de $200', min: 0, max: 200 },
  { label: '$200 – $500', min: 200, max: 500 },
  { label: '$500 – $1000', min: 500, max: 1000 },
  { label: 'Más de $1000', min: 1000, max: Infinity },
];

export const ProductList: React.FC = () => {
  const { data: products, isLoading, isError, error } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceIdx, setPriceIdx] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!products) return [];
    const range = PRICE_RANGES[priceIdx];
    const searchLower = search.toLowerCase().trim();
    const brandLower = brand.toLowerCase().trim();
    return products.filter((p) => {
      const condOk = !condition || p.condition === condition;
      const catOk = !category || p.category === category;
      const brandOk = !brandLower || p.name.toLowerCase().includes(brandLower);
      const priceOk = p.price >= range.min && p.price < range.max;
      const searchOk = !searchLower || 
        p.name.toLowerCase().includes(searchLower) || 
        p.description?.toLowerCase().includes(searchLower);
      return condOk && catOk && brandOk && priceOk && searchOk;
    });
  }, [products, condition, category, brand, priceIdx, search]);

  useEffect(() => setPage(1), [condition, category, brand, priceIdx, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div>
        <FilterBar condition={condition} setCondition={setCondition} category={category} setCategory={setCategory} brand={brand} setBrand={setBrand} priceIdx={priceIdx} setPriceIdx={setPriceIdx} search={search} setSearch={setSearch} disabled />
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
        title="Error al cargar"
        description={error?.message || 'No se pudieron cargar los productos.'}
      />
    );
  }

  return (
    <div>
      <FilterBar condition={condition} setCondition={setCondition} category={category} setCategory={setCategory} brand={brand} setBrand={setBrand} priceIdx={priceIdx} setPriceIdx={setPriceIdx} search={search} setSearch={setSearch} />

      {/* Productos destacados (solo si no hay filtros activos) */}
      {!search && !category && !brand && condition === '' && priceIdx === 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Productos destacados</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          </div>
          <div className="products-grid">
            {filtered.filter(p => p.condition === 'A').slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} onAdd={() => { addItem(product); toggleDrawer(); }} featured />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" /></svg>}
          title="Sin resultados"
          description="Ningún producto coincide con los filtros seleccionados."
          cta={<button className="btn-outline" onClick={() => { setCondition(''); setCategory(''); setPriceIdx(0); setSearch(''); }}>Limpiar filtros</button>}
        />
      ) : (
        <>
          <div className="products-grid">
            {paginatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} onAdd={() => { addItem(product); toggleDrawer(); }} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', paddingBottom: '2rem' }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-ui)',
                  background: page === 1 ? 'var(--gray-light)' : 'var(--white)',
                  color: page === 1 ? 'var(--gray)' : 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                Anterior
              </button>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    style={{
                      minWidth: 36,
                      padding: '8px',
                      border: '1px solid',
                      borderColor: page === p ? 'var(--ink)' : 'var(--line)',
                      borderRadius: 'var(--radius-ui)',
                      background: page === p ? 'var(--ink)' : 'transparent',
                      color: page === p ? 'var(--white)' : 'var(--ink)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.8rem',
                      fontWeight: page === p ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-ui)',
                  background: page === totalPages ? 'var(--gray-light)' : 'var(--white)',
                  color: page === totalPages ? 'var(--gray)' : 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: { _id: string; name: string; price: number; description?: string; condition: string; category?: string; stock: number; image_urls?: string[] };
  onAdd: () => void;
  featured?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, featured }) => {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const badgeColor = product.condition === 'A' ? 'var(--ink)' : product.condition === 'B' ? '#D97706' : 'var(--line)';
  const badgeText = product.condition === 'A' ? 'var(--white)' : product.condition === 'B' ? 'var(--white)' : 'var(--ink2)';
  
  const categoryLabel = { celular: 'Celular', laptop: 'Laptop', pc: 'PC', auriculares: 'Audio', tablet: 'Tablet' }[product.category || ''] || product.category;

  const isNew = product.stock >= 10;
  const isLast = product.stock > 0 && product.stock <= 3;
  const isLowStock = product.stock <= 3;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        background: 'var(--white)', 
        border: `1px solid ${hovered ? 'var(--ink)' : 'var(--line)'}`, 
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', 
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)', 
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.08)' : 'none',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'var(--cream)' }} />}
        <img
          src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/400/300`}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)', opacity: imgLoaded ? 1 : 0 }}
        />
        
        {/* Badges superiores */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {featured && (
            <span style={{ padding: '4px 10px', background: '#7C3AED', color: 'var(--white)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', borderRadius: '2px' }}>
              Destacado
            </span>
          )}
          <span style={{ padding: '4px 10px', background: badgeColor, color: badgeText, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', borderRadius: '2px' }}>
            Cond. {product.condition}
          </span>
          {isNew && (
            <span style={{ padding: '4px 10px', background: '#22c55e', color: 'var(--white)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', borderRadius: '2px' }}>
              Nuevo
            </span>
          )}
          {isLast && (
            <span style={{ padding: '4px 10px', background: '#DC2626', color: 'var(--white)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', borderRadius: '2px' }}>
              Último
            </span>
          )}
        </div>

        {product.category && (
          <span style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', background: 'rgba(255,255,255,0.95)', color: 'var(--ink)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.3px', fontFamily: 'var(--font-sans)', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {categoryLabel}
          </span>
        )}
      </div>

      <div style={{ padding: '1.25rem 1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)', lineHeight: 1.35 }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '1.1rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
          ${product.price.toFixed(2)}
        </p>
        <p style={{ fontSize: '0.75rem', color: isLowStock ? '#DC2626' : 'var(--gray)', marginBottom: '1rem', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLowStock ? '#DC2626' : 'var(--gray)' }} />
          {isLowStock ? `Solo ${product.stock} disponibles` : `${product.stock} en stock`}
        </p>
        <button
          onClick={onAdd}
          disabled={product.stock === 0}
          style={{ width: '100%', padding: '10px', background: hovered && product.stock > 0 ? 'var(--ink)' : 'transparent', color: hovered && product.stock > 0 ? 'var(--white)' : product.stock === 0 ? 'var(--gray)' : 'var(--ink)', border: `1px solid ${hovered && product.stock > 0 ? 'var(--ink)' : 'var(--line)'}`, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease', opacity: product.stock === 0 ? 0.5 : 1 }}
        >
          {product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
        </button>
      </div>
    </article>
  );
};

interface FilterBarProps {
  condition: string;
  setCondition: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  priceIdx: number;
  setPriceIdx: (v: number) => void;
  search: string;
  setSearch: (v: string) => void;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ condition, setCondition, category, setCategory, brand, setBrand, priceIdx, setPriceIdx, search, setSearch, disabled }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
    {/* Filtros compactos */}
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Categorías */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => setCategory(cat.value)} disabled={disabled} style={{ padding: '8px 16px', borderRadius: 0, border: '1px solid', borderColor: category === cat.value ? 'var(--ink)' : 'var(--line)', background: category === cat.value ? 'var(--ink)' : 'transparent', color: category === cat.value ? 'var(--white)' : 'var(--ink2)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Condición */}
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        {CONDITIONS.map((cond) => (
          <button key={cond.value} onClick={() => setCondition(cond.value)} disabled={disabled} style={{ padding: '6px 12px', borderRadius: 0, border: '1px solid var(--line)', background: condition === cond.value ? 'var(--ink)' : 'transparent', color: condition === cond.value ? 'var(--white)' : 'var(--ink2)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', cursor: 'pointer' }}>
            {cond.label}
          </button>
        ))}
      </div>

      {/* Precio */}
      <select value={priceIdx} onChange={(e) => setPriceIdx(Number(e.target.value))} disabled={disabled} style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 0, fontFamily: 'var(--font-sans)', fontSize: '0.75rem', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none', minWidth: 160 }}>
        {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
      </select>
    </div>

    {/* Buscador */}
    <div style={{ position: 'relative', width: 280 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-3.5-3.5" />
      </svg>
      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px 10px 40px',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8rem',
          background: 'var(--white)',
          color: 'var(--ink)',
          outline: 'none',
        }}
      />
    </div>
  </div>
);