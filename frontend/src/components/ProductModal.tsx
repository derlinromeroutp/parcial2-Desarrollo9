import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../types/product';
import type { CreateProductDTO, UpdateProductDTO } from '../services/products.service';

interface ProductModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSubmit:  (data: CreateProductDTO | UpdateProductDTO) => Promise<void>;
  product?:  Product | null;
  isLoading?: boolean;
}

const CONDITIONS = [
  { value: 'A', label: 'A — Excelente' },
  { value: 'B', label: 'B — Bueno'     },
  { value: 'C', label: 'C — Regular'   },
];

const CATEGORIES = [
  { value: 'celular', label: 'Celular' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'pc', label: 'PC' },
  { value: 'auriculares', label: 'Auriculares' },
  { value: 'tablet', label: 'Tablet' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius-ui)',
  fontFamily: 'var(--font-display)',
  fontSize: '0.9rem',
  fontWeight: 400,
  background: 'var(--cream)',
  color: 'var(--ink)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: 'var(--ink3)',
  marginBottom: 6,
};

export default function ProductModal({ isOpen, onClose, onSubmit, product, isLoading }: ProductModalProps) {
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [stock,       setStock]       = useState('');
  const [condition,   setCondition]   = useState<'A' | 'B' | 'C'>('A');
  const [category,    setCategory]    = useState<'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet'>('celular');
  const [imageUrls,   setImageUrls]   = useState('');
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCondition(product.condition);
      setCategory(product.category);
      setImageUrls(product.image_urls.join(', '));
    } else {
      setName(''); setDescription(''); setPrice('');
      setStock(''); setCondition('A'); setCategory('celular'); setImageUrls('');
    }
    setError('');
  }, [product, isOpen]);

  /* cerrar con Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (!name.trim())                       { setError('El nombre es requerido'); return; }
    if (isNaN(priceNum) || priceNum <= 0)   { setError('El precio debe ser mayor a 0'); return; }
    if (isNaN(stockNum) || stockNum < 0)    { setError('El stock debe ser 0 o mayor'); return; }

    const image_urls = imageUrls.split(',').map(u => u.trim()).filter(Boolean);

    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, price: priceNum, stock: stockNum, condition, category, image_urls });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar producto');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,16,16,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          border: '1.5px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUpFade 0.25s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.375rem 1.75rem',
          borderBottom: '1.5px solid var(--line)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 2 }}>
              {product ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink3)', fontWeight: 500 }}>
              {product ? `Editando: ${product.name}` : 'Completa los campos para agregar un producto'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--radius-ui)',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink2)',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ink)'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Error */}
          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'var(--error-light)',
              border: '1.5px solid var(--error)',
              borderRadius: 'var(--radius-ui)',
              color: 'var(--error)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: iPhone 13 Pro"
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción del producto (opcional)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Precio + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Precio (USD) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink3)', pointerEvents: 'none',
                }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{ ...inputStyle, paddingLeft: 26 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="0"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Condición */}
          <div>
            <label style={labelStyle}>Condición</label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value as 'A' | 'B' | 'C')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1.5px solid',
                    borderColor: condition === c.value ? 'var(--accent)' : 'var(--line)',
                    borderRadius: 'var(--radius-ui)',
                    background: condition === c.value ? 'var(--accent-light)' : 'transparent',
                    color: condition === c.value ? 'var(--accent)' : 'var(--ink2)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.82rem',
                    fontWeight: condition === c.value ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label style={labelStyle}>Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet')}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* URLs de imágenes */}
          <div>
            <label style={labelStyle}>URLs de imágenes</label>
            <input
              type="text"
              value={imageUrls}
              onChange={e => setImageUrls(e.target.value)}
              placeholder="https://ejemplo.com/img1.jpg, https://..."
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--ink3)', marginTop: 5, fontWeight: 500 }}>
              Separa múltiples URLs con comas
            </p>
          </div>

          {/* Acciones */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1.5px solid var(--line)',
            marginTop: '0.25rem',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-outline"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {isLoading
                ? (product ? 'Actualizando…' : 'Creando…')
                : (product ? 'Actualizar producto' : 'Crear producto')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
