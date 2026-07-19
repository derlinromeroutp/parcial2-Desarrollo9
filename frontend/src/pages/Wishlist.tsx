import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist, useUpdateWishlistNote, useWishlistSuggestions } from '../hooks/useWishlist';
import { usePriceAlerts, useCreatePriceAlert, useDeactivatePriceAlert } from '../hooks/usePriceAlerts';
import { useCartStore } from '../store/cart.store';
import { SignInButton, useAuth } from '../lib/auth';
import { Skeleton } from '../components/ui/Skeleton';
import type { Product } from '../types/product';

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CATEGORY_LABEL: Record<string, string> = {
  celular: 'Celular', laptop: 'Laptop', pc: 'PC', auriculares: 'Auriculares', tablet: 'Tablet',
};

const Wishlist: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: items, isLoading, isError } = useWishlist();
  const { data: suggestions } = useWishlistSuggestions();
  const { data: priceAlerts } = usePriceAlerts();
  const removeMutation = useRemoveFromWishlist();
  const updateNoteMutation = useUpdateWishlistNote();
  const createAlertMutation = useCreatePriceAlert();
  const deactivateAlertMutation = useDeactivatePriceAlert();
  const addItem = useCartStore(s => s.addItem);
  const toggleDrawer = useCartStore(s => s.toggleDrawer);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleToggleNote = (itemId: string, currentNote: string) => {
    if (editingNote === itemId) {
      updateNoteMutation.mutate({ productId: itemId, note: noteText });
      setEditingNote(null);
    } else {
      setNoteText(currentNote);
      setEditingNote(itemId);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addItem(product);
    toggleDrawer();
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const getActiveAlert = (productId: string) =>
    priceAlerts?.find(alert => alert.product && alert.product._id === productId && alert.active);

  const handleTogglePriceAlert = (productId: string) => {
    const activeAlert = getActiveAlert(productId);
    if (activeAlert) {
      deactivateAlertMutation.mutate(activeAlert._id);
    } else {
      createAlertMutation.mutate(productId);
    }
  };

  if (isLoaded && !isSignedIn) {
    return (
      <div className="wl-root">
        <header className="wl-hero">
          <div className="page-container wl-hero-inner">
            <p className="wl-eyebrow">Mi cuenta · SafeTech</p>
            <h1 className="wl-title">Mi lista de <em>deseos</em></h1>
          </div>
        </header>
        <main className="wl-body">
          <div className="page-container">
            <div className="wl-empty">
              <h3>Debes iniciar sesión para ver tu lista de deseos</h3>
              <SignInButton mode="modal">
                <button className="wl-cta">Iniciar sesión</button>
              </SignInButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="wl-root">
      <header className="wl-hero">
        <div className="page-container wl-hero-inner">
          <p className="wl-eyebrow">Mi cuenta · SafeTech</p>
          <h1 className="wl-title">Mi lista de <em>deseos</em></h1>
          {items && <p className="wl-count">{items.length} producto{items.length !== 1 ? 's' : ''}</p>}
        </div>
      </header>

      <main className="wl-body">
        <div className="page-container">
          {isLoading && (
            <div className="wl-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="wl-card" style={{ minHeight: 320 }}>
                  <Skeleton style={{ width: '100%', height: 200, borderRadius: 0 }} />
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Skeleton style={{ width: '70%', height: 16 }} />
                    <Skeleton style={{ width: '40%', height: 14 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="wl-empty">
              <h3>Error al cargar tu lista de deseos</h3>
              <p>Verifica tu conexión e intenta de nuevo.</p>
            </div>
          )}

          {!isLoading && !isError && items && items.length === 0 && (
            <div className="wl-empty">
              <div className="wl-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <h3>Tu lista de deseos está vacía</h3>
              <p>Guarda productos que te interesen para revisarlos después.</p>
              <Link to="/home" className="wl-cta">Explorar catálogo</Link>
            </div>
          )}

          {!isLoading && !isError && items && items.length > 0 && (
            <div className="wl-grid">
              {items.map(item => (
                <div key={item._id} className="wl-card">
                  <Link to={`/product/${item.product._id}`} className="wl-card-img">
                    <img
                      src={item.product.image_urls?.[0] || `https://picsum.photos/seed/${item.product._id}/400/400`}
                      alt={item.product.name}
                    />
                  </Link>
                  <div className="wl-card-body">
                    <Link to={`/product/${item.product._id}`} className="wl-card-name">{item.product.name}</Link>
                    <p className="wl-card-cat">{CATEGORY_LABEL[item.product.category] ?? item.product.category}</p>
                    <p className="wl-card-price">{fmt(item.product.price)}</p>
                    {getActiveAlert(item.product._id)?.triggered && (
                      <p className="wl-price-drop-badge">¡Bajó de precio!</p>
                    )}

                    {editingNote === item.product._id ? (
                      <div className="wl-note-edit">
                        <textarea
                          className="wl-note-input"
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Escribe una nota..."
                          maxLength={500}
                          rows={3}
                        />
                      </div>
                    ) : item.note ? (
                      <p className="wl-note-text">"{item.note}"</p>
                    ) : null}

                    <div className="wl-card-actions">
                      <button
                        className="wl-btn wl-btn-cart"
                        onClick={() => handleAddToCart(item.product)}
                        disabled={item.product.stock <= 0}
                      >
                        {addedId === item.product._id ? 'Añadido' : item.product.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                      </button>
                      <button
                        className="wl-btn wl-btn-note"
                        onClick={() => handleToggleNote(item.product._id, item.note)}
                      >
                        {editingNote === item.product._id ? 'Guardar nota' : 'Nota'}
                      </button>
                      <button
                        className={`wl-btn wl-btn-alert ${getActiveAlert(item.product._id) ? 'wl-btn-alert-active' : ''}`}
                        onClick={() => handleTogglePriceAlert(item.product._id)}
                        title={getActiveAlert(item.product._id) ? 'Desactivar alerta de precio' : 'Avisarme si baja de precio'}
                      >
                        {getActiveAlert(item.product._id) ? '🔔' : '🔕'}
                      </button>
                      <button
                        className="wl-btn wl-btn-remove"
                        onClick={() => removeMutation.mutate(item.product._id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !isError && suggestions && suggestions.length > 0 && (
            <div className="wl-suggestions">
              <h2 className="wl-suggestions-title">Sugeridos para ti</h2>
              <p className="wl-suggestions-sub">Basados en los productos de tu lista de deseos</p>
              <div className="wl-suggestions-grid">
                {suggestions.map(product => (
                  <Link to={`/product/${product._id}`} key={product._id} className="wl-sug-card">
                    <div className="wl-sug-img">
                      <img
                        src={product.image_urls?.[0] || `https://picsum.photos/seed/${product._id}/300/300`}
                        alt={product.name}
                      />
                    </div>
                    <div className="wl-sug-body">
                      <p className="wl-sug-cat">{CATEGORY_LABEL[product.category] ?? product.category}</p>
                      <p className="wl-sug-name">{product.name}</p>
                      <p className="wl-sug-price">{fmt(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .wl-root { min-height: 100vh; background: var(--cream); }
        .wl-hero { background: var(--clay); padding-bottom: 3rem; }
        .wl-hero-inner { padding-top: calc(var(--header-height) + 3.5rem); }
        .wl-eyebrow { font-family: var(--font-mono); font-size: .62rem; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: rgba(244,244,242,.45); margin-bottom: .875rem; }
        .wl-title { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; color: var(--bone); line-height: 1.0; letter-spacing: -.035em; }
        .wl-title em { font-style: italic; font-weight: 400; color: var(--sand); }
        .wl-count { font-family: var(--font-sans); font-size: .85rem; color: rgba(244,244,242,.5); margin-top: .75rem; }
        .wl-body { padding: 3rem 0 6rem; }
        .wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
        .wl-card { background: var(--bone); border: 1px solid var(--line); border-radius: var(--radius-sm); overflow: hidden; transition: box-shadow .3s, transform .3s; }
        .wl-card:hover { box-shadow: 0 12px 40px rgba(46,45,43,.1); transform: translateY(-2px); }
        .wl-card-img { display: block; aspect-ratio: 1; overflow: hidden; }
        .wl-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
        .wl-card:hover .wl-card-img img { transform: scale(1.04); }
        .wl-card-body { padding: 1rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 6px; }
        .wl-card-name { font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: var(--ink); text-decoration: none; line-height: 1.3; }
        .wl-card-name:hover { text-decoration: underline; }
        .wl-card-cat { font-family: var(--font-mono); font-size: .6rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ink3); }
        .wl-card-price { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--ink); margin-top: 4px; }
        .wl-note-text { font-family: var(--font-sans); font-size: .78rem; font-style: italic; color: var(--ink2); margin-top: 6px; padding: 8px 10px; background: rgba(0,0,0,.025); border-radius: var(--radius-xs); border-left: 3px solid var(--sand); }
        .wl-note-edit { margin-top: 6px; }
        .wl-note-input { width: 100%; padding: 8px 10px; font-family: var(--font-sans); font-size: .82rem; border: 1px solid var(--line); border-radius: var(--radius-xs); resize: vertical; background: var(--white); color: var(--ink); }
        .wl-note-input:focus { outline: none; border-color: var(--ink); }
        .wl-card-actions { display: flex; gap: 6px; margin-top: 10px; }
        .wl-btn { flex: 1; padding: 8px 0; font-family: var(--font-sans); font-size: .75rem; font-weight: 500; border-radius: var(--radius-pill); border: 1px solid var(--line); background: var(--white); color: var(--ink); cursor: pointer; transition: all .2s; text-align: center; }
        .wl-btn:hover { background: var(--cream); border-color: var(--ink); }
        .wl-btn-cart { background: var(--ink); color: var(--bone); border-color: var(--ink); }
        .wl-btn-cart:hover { background: #333; }
        .wl-btn-cart:disabled { opacity: .5; cursor: not-allowed; }
        .wl-btn-note { flex: none; width: 36px; flex-shrink: 0; }
        .wl-btn-alert { flex: none; width: 36px; flex-shrink: 0; }
        .wl-btn-alert-active { background: rgba(46,125,50,.08); border-color: rgba(46,125,50,.4); }
        .wl-btn-remove { flex: none; width: 36px; flex-shrink: 0; color: #ef4444; border-color: rgba(239,68,68,.3); }
        .wl-btn-remove:hover { background: rgba(239,68,68,.06); border-color: #ef4444; }
        .wl-price-drop-badge { display: inline-block; margin-top: 2px; padding: 3px 9px; font-family: var(--font-sans); font-size: .68rem; font-weight: 600; color: #2e7d32; background: rgba(46,125,50,.1); border-radius: var(--radius-pill); width: fit-content; }
        .wl-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 6rem 2rem; gap: .625rem; }
        .wl-empty-icon { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); background: rgba(46,45,43,.05); border: 1px solid var(--line); color: var(--ink3); margin-bottom: 1rem; }
        .wl-empty h3 { font-family: var(--font-display); font-size: 1.35rem; font-weight: 400; color: var(--ink); letter-spacing: -.02em; }
        .wl-empty p { font-family: var(--font-sans); font-size: .875rem; color: var(--ink3); max-width: 300px; line-height: 1.65; }
        .wl-cta { margin-top: 1.25rem; display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--ink); color: var(--bone); font-family: var(--font-sans); font-size: .82rem; font-weight: 500; letter-spacing: .3px; text-decoration: none; border-radius: var(--radius-pill); border: 1px solid var(--ink); transition: all .25s; }
        .wl-cta:hover { background: #333; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(46,45,43,.25); }

        .wl-suggestions { margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--line); }
        .wl-suggestions-title { font-family: var(--font-display); font-size: clamp(1.3rem, 2.5vw, 1.75rem); font-weight: 400; color: var(--ink); letter-spacing: -.02em; margin-bottom: .35rem; }
        .wl-suggestions-sub { font-family: var(--font-sans); font-size: .82rem; color: var(--ink3); margin-bottom: 1.5rem; }
        .wl-suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .wl-sug-card { background: var(--bone); border: 1px solid var(--line); border-radius: var(--radius-sm); overflow: hidden; text-decoration: none; transition: box-shadow .3s, transform .3s; }
        .wl-sug-card:hover { box-shadow: 0 8px 30px rgba(46,45,43,.08); transform: translateY(-2px); }
        .wl-sug-img { aspect-ratio: 1; overflow: hidden; }
        .wl-sug-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
        .wl-sug-card:hover .wl-sug-img img { transform: scale(1.04); }
        .wl-sug-body { padding: .875rem 1rem 1rem; }
        .wl-sug-cat { font-family: var(--font-mono); font-size: .55rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ink3); margin-bottom: 4px; }
        .wl-sug-name { font-family: var(--font-display); font-size: .9rem; font-weight: 500; color: var(--ink); line-height: 1.3; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .wl-sug-price { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--ink); }
      `}</style>
    </div>
  );
};

export default Wishlist;
