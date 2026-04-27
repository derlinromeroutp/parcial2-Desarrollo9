import React, { useEffect, useRef, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/ui/Skeleton';
import { SignInButton, useAuth } from '@clerk/clerk-react';

// ── Helpers ────────────────────────────────────────────────────────────────
const isWithin90Days = (d?: string) =>
  !!d && Date.now() - new Date(d).getTime() <= 90 * 24 * 60 * 60 * 1000;

const warrantyDaysLeft = (d?: string) =>
  !d ? 0 : Math.max(0, 90 - Math.floor((Date.now() - new Date(d).getTime()) / 86400000));

const relativeDate = (d?: string) => {
  if (!d) return '—';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7)  return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fullDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

const fmt = (n?: number) =>
  n !== undefined && n !== null
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

const pad = (n: number) => String(n).padStart(3, '0');

// ── Status map ─────────────────────────────────────────────────────────────
const ST = {
  paid:      { label: 'Pagado',    glyph: '●', ink: '#065f46', bg: 'rgba(16,185,129,0.12)', rim: 'rgba(16,185,129,0.35)', bar: '#10b981' },
  pending:   { label: 'Pendiente', glyph: '◐', ink: '#92400e', bg: 'rgba(245,158,11,0.12)', rim: 'rgba(245,158,11,0.35)', bar: '#f59e0b' },
  failed:    { label: 'Fallido',   glyph: '✕', ink: '#991b1b', bg: 'rgba(239,68,68,0.12)',  rim: 'rgba(239,68,68,0.35)',  bar: '#ef4444' },
  cancelled: { label: 'Cancelado', glyph: '○', ink: '#4b5563', bg: 'rgba(107,114,128,0.1)', rim: 'rgba(107,114,128,0.3)', bar: '#9ca3af' },
} as const;
type StatusKey = keyof typeof ST;
const getST = (s: string) => ST[(s as StatusKey)] ?? ST.cancelled;

// ── Counter hook ───────────────────────────────────────────────────────────
function useCount(target: number, active: boolean, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (target === 0) { setV(0); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(tick); else setV(target);
    };
    requestAnimationFrame(tick);
  }, [active, target, ms]);
  return v;
}

// ── Arc progress (SVG circle) ──────────────────────────────────────────────
function ArcProgress({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

// ── OrderType ──────────────────────────────────────────────────────────────
type Item = { quantity: number; price: number; product?: { name?: string; image_urls?: string[] } };
type OrderT = { _id: string; createdAt?: string; status: string; total_amount?: number; items: Item[] };

// ── Order Card ─────────────────────────────────────────────────────────────
const OrderCard: React.FC<{ order: OrderT; idx: number }> = ({ order, idx }) => {
  const [open, setOpen]   = useState(false);
  const [hover, setHover] = useState(false);
  const bodyRef           = useRef<HTMLDivElement>(null);
  const [h, setH]         = useState(0);

  const st         = getST(order.status);
  const canWarr    = order.status === 'paid' && isWithin90Days(order.createdAt);
  const daysLeft   = warrantyDaysLeft(order.createdAt);
  const warrantyPct= Math.round((daysLeft / 90) * 100);
  const warrantyColor = warrantyPct > 60 ? '#10b981' : warrantyPct > 25 ? '#f59e0b' : '#ef4444';
  const totalQty   = order.items.reduce((s, i) => s + i.quantity, 0);
  const hero       = order.items[0]?.product?.image_urls?.[0];
  const extras     = order.items.slice(1, 4);

  useEffect(() => {
    if (bodyRef.current) setH(bodyRef.current.scrollHeight);
  }, [open]);

  return (
    <article
      className="oc-card animate-slide-up"
      style={{ animationDelay: `${idx * 90}ms` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ── Collapsed face ─────────────────────────────────── */}
      <div className="oc-face" onClick={() => setOpen(o => !o)}>

        {/* LEFT — image panel */}
        <div className="oc-img-panel">
          {hero
            ? <img
                src={hero}
                alt=""
                className="oc-img-hero"
                style={{ transform: hover ? 'scale(1.06)' : 'scale(1)' }}
              />
            : <div className="oc-img-placeholder" />
          }

          {/* Gradient scrim */}
          <div className="oc-img-scrim" />

          {/* Watermark order number */}
          <span className="oc-watermark">#{pad(idx + 1)}</span>

          {/* Stacked extras */}
          {extras.length > 0 && (
            <div className="oc-extras">
              {extras.map((e, i) => (
                <div key={i} className="oc-extra-thumb"
                  style={{ marginLeft: i === 0 ? 0 : -10, zIndex: extras.length - i }}>
                  {e.product?.image_urls?.[0]
                    ? <img src={e.product.image_urls[0]} alt="" />
                    : <span />
                  }
                </div>
              ))}
              {order.items.length > 4 && (
                <span className="oc-extra-count">+{order.items.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — info */}
        <div className="oc-info">
          {/* Top row */}
          <div className="oc-info-top">
            <span className="oc-index">#{pad(idx + 1)}</span>
            <span className="oc-status-badge" style={{ background: st.bg, color: st.ink, border: `1px solid ${st.rim}` }}>
              <span className="oc-status-glyph">{st.glyph}</span>
              {st.label}
            </span>
          </div>

          {/* Product headline */}
          <h2 className="oc-product-name">
            {order.items[0]?.product?.name ?? 'Pedido SafeTech'}
          </h2>
          {totalQty > 1 && (
            <p className="oc-extra-label">+ {totalQty - 1} artículo{totalQty - 1 !== 1 ? 's' : ''} más</p>
          )}

          {/* Date */}
          <p className="oc-date" title={fullDate(order.createdAt)}>
            {relativeDate(order.createdAt)}
          </p>

          {/* Price */}
          <div className="oc-price-row">
            <span className="oc-price">{fmt(order.total_amount)}</span>
          </div>

          {/* Warranty arc */}
          {canWarr && (
            <div className="oc-warranty-row">
              <ArcProgress pct={warrantyPct} color={warrantyColor} />
              <div className="oc-warranty-text">
                <span className="oc-warranty-days">{daysLeft}</span>
                <span className="oc-warranty-label">días de garantía</span>
              </div>
            </div>
          )}
          {order.status === 'paid' && !canWarr && (
            <p className="oc-expired">Garantía expirada</p>
          )}

          {/* Chevron */}
          <div className="oc-chevron-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.32s ease' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span>{open ? 'Ocultar' : 'Ver detalle'}</span>
          </div>
        </div>
      </div>

      {/* ── Expanded drawer ─────────────────────────────────── */}
      <div className="oc-drawer" style={{ maxHeight: open ? h + 2 : 0 }}>
        <div ref={bodyRef} className="oc-drawer-inner">
          <div className="oc-drawer-header">
            <span>Artículos del pedido</span>
            {canWarr && (
              <Link to={`/warranties/new?orderId=${order._id}`}
                onClick={e => e.stopPropagation()}
                className="oc-warranty-link">
                Registrar garantía →
              </Link>
            )}
          </div>

          <div className="oc-items">
            {order.items.map((item, i) => (
              <div key={i} className="oc-item" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="oc-item-img">
                  {item.product?.image_urls?.[0]
                    ? <img src={item.product.image_urls[0]} alt={item.product?.name} />
                    : <span className="oc-item-img-empty" />
                  }
                </div>
                <div className="oc-item-body">
                  <p className="oc-item-name">{item.product?.name ?? 'Producto'}</p>
                  <p className="oc-item-meta">Cantidad: {item.quantity} · {fmt(item.price)} c/u</p>
                </div>
                <p className="oc-item-total">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="oc-drawer-foot">
            <span className="oc-foot-label">Total del pedido</span>
            <span className="oc-foot-amount">{fmt(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────
const OrdersSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {[280, 220, 260].map((imgH, i) => (
      <div key={i} className="oc-card" style={{ display: 'flex', minHeight: imgH, overflow: 'hidden' }}>
        <Skeleton style={{ width: '36%', minHeight: imgH, borderRadius: 0 }} />
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton style={{ width: 40, height: 14 }} />
            <Skeleton style={{ width: 72, height: 22, borderRadius: 20 }} />
          </div>
          <Skeleton style={{ width: '65%', height: 20 }} />
          <Skeleton style={{ width: '35%', height: 14 }} />
          <Skeleton style={{ width: '45%', height: 14 }} />
          <div style={{ marginTop: 'auto' }}>
            <Skeleton style={{ width: 100, height: 32 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PAGE_SIZE = 5;

// ── Main ───────────────────────────────────────────────────────────────────
const Orders: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: orders, isLoading, isError } = useOrders();
  const [page, setPage] = useState(1);

  const heroRef        = useRef<HTMLDivElement>(null);
  const listTopRef     = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setFired(true); }, { threshold: 0.2 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const totalSpent   = orders?.filter(o => o.status === 'paid').reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0;
  const activeWarr   = orders?.filter(o => o.status === 'paid' && isWithin90Days(o.createdAt)).length ?? 0;
  const cntOrders    = useCount(orders?.length ?? 0, fired);
  const cntSpent     = useCount(Math.round(totalSpent), fired, 1200);
  const cntWarr      = useCount(activeWarr, fired, 800);

  const totalPages   = Math.ceil((orders?.length ?? 0) / PAGE_SIZE);
  const paged        = orders?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  const goTo = (p: number) => {
    setPage(p);
    setTimeout(() => listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <div className="op-root">
        <header className="op-hero" ref={heroRef}>
          <div className="op-noise" />
          <div className="op-diag" />
          <div className="page-container op-hero-inner">
            <div className="op-hero-text">
              <p className="op-eyebrow">Mi cuenta · SafeTech</p>
              <h1 className="op-title">
                Historial de<br />
                <em>pedidos</em>
              </h1>
            </div>
          </div>
        </header>

        <main className="op-body">
          <div className="page-container">
            <div className="op-empty">
              <div className="op-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 11V7a4 4 0 00-8 0v4" />
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                </svg>
              </div>
              <h3>Debes iniciar sesión para ver tus pedidos</h3>
              <p>Accede a tu cuenta para consultar compras, estados y garantías.</p>
              <SignInButton mode="modal">
                <button className="op-cta">Iniciar sesión</button>
              </SignInButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="op-root">

      {/* ── HERO BAND ── */}
      <header className="op-hero" ref={heroRef}>
        {/* Noise texture */}
        <div className="op-noise" />
        {/* Diagonal lines */}
        <div className="op-diag" />

        <div className="page-container op-hero-inner">
          <div className="op-hero-text">
            <p className="op-eyebrow">Mi cuenta · SafeTech</p>
            <h1 className="op-title">
              Historial de<br />
              <em>pedidos</em>
            </h1>
            <Link to="/mis-garantias" className="op-warranties-link">
              Ver mis garantías →
            </Link>
          </div>

          {orders && orders.length > 0 && (
            <div className="op-stats">
              <div className="op-stat">
                <span className="op-stat-n">{cntOrders}</span>
                <span className="op-stat-l">pedidos</span>
              </div>
              <div className="op-stat-sep" />
              <div className="op-stat">
                <span className="op-stat-n">${cntSpent.toLocaleString()}</span>
                <span className="op-stat-l">invertidos</span>
              </div>
              <div className="op-stat-sep" />
              <div className="op-stat">
                <span className="op-stat-n">{cntWarr}</span>
                <span className="op-stat-l">garantías activas</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="op-body">
        <div className="page-container">

          {isLoading && <OrdersSkeleton />}

          {isError && (
            <div className="op-empty">
              <div className="op-empty-icon op-empty-icon--err">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3>No pudimos cargar tus pedidos</h3>
              <p>Verifica tu conexión e intenta de nuevo.</p>
            </div>
          )}

          {!isLoading && !isError && (!orders || orders.length === 0) && (
            <div className="op-empty">
              <div className="op-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3>Aún no tienes pedidos</h3>
              <p>Cuando hagas una compra, aparecerá aquí con todos sus detalles.</p>
              <Link to="/home" className="op-cta">
                Ir a la tienda
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}

          {!isLoading && !isError && orders && orders.length > 0 && (
            <>
              <div ref={listTopRef} style={{ scrollMarginTop: 'calc(var(--header-height) + 1.5rem)' }} />
              <div className="op-list">
                {paged.map((o, i) => (
                  <OrderCard key={o._id} order={o} idx={(page - 1) * PAGE_SIZE + i} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="op-pagination">
                  {/* Prev */}
                  <button
                    className="op-pg-btn"
                    onClick={() => goTo(page - 1)}
                    disabled={page === 1}
                    aria-label="Página anterior"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                    const isEllipsis =
                      totalPages > 7 && p !== 1 && p !== totalPages &&
                      Math.abs(p - page) > 2;
                    const isNeighbour =
                      totalPages > 7 && p !== 1 && p !== totalPages &&
                      Math.abs(p - page) === 3;
                    if (isNeighbour) return (
                      <span key={p} className="op-pg-ellipsis">…</span>
                    );
                    if (isEllipsis) return null;
                    return (
                      <button
                        key={p}
                        className={`op-pg-btn${p === page ? ' op-pg-btn--active' : ''}`}
                        onClick={() => goTo(p)}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    className="op-pg-btn"
                    onClick={() => goTo(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Página siguiente"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <span className="op-pg-info">{page} / {totalPages}</span>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* ── STYLES ── */}
      <style>{`

        /* ─ Root ─ */
        .op-root {
          min-height: 100vh;
          background: var(--st-bone);
        }

        /* ─ Hero band ─ */
        .op-hero {
          background: var(--st-clay);
          position: relative;
          overflow: hidden;
          padding-bottom: 3.5rem;
        }
        .op-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .op-diag {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(255,255,255,.015) 80px, rgba(255,255,255,.015) 81px);
        }
        .op-hero-inner {
          position: relative; z-index: 2;
          padding-top: calc(var(--header-height) + 3.5rem);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 3rem;
          flex-wrap: wrap;
        }
        .op-hero-text {}
        .op-eyebrow {
          font-family: var(--st-font-mono);
          font-size: .62rem;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(244,244,242,.45);
          margin-bottom: .875rem;
        }
        .op-title {
          font-family: var(--st-font-display);
          font-size: clamp(2.75rem, 6vw, 5rem);
          font-weight: 300;
          color: var(--st-bone);
          line-height: 1.0;
          letter-spacing: -.035em;
        }
        .op-title em { font-style: italic; font-weight: 400; color: var(--st-sand); }
        .op-warranties-link {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 1.25rem;
          font-family: var(--st-font-sans); font-size: .78rem; font-weight: 500;
          color: rgba(244,244,242,.55); text-decoration: none;
          border-bottom: 1px solid rgba(244,244,242,.2);
          padding-bottom: 2px;
          transition: color .2s, border-color .2s;
        }
        .op-warranties-link:hover { color: var(--st-bone); border-color: rgba(244,244,242,.5); }

        /* Stats row inside hero */
        .op-stats {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(244,244,242,.06);
          border: 1px solid rgba(244,244,242,.12);
          border-radius: var(--st-radius-md);
          overflow: hidden;
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }
        .op-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem 2rem;
          gap: 4px;
        }
        .op-stat-n {
          font-family: var(--st-font-display);
          font-size: clamp(1.6rem, 2.5vw, 2.25rem);
          font-weight: 300;
          color: var(--st-bone);
          letter-spacing: -.04em;
          line-height: 1;
        }
        .op-stat-l {
          font-family: var(--st-font-mono);
          font-size: .6rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(244,244,242,.4);
        }
        .op-stat-sep {
          width: 1px;
          height: 40px;
          background: rgba(244,244,242,.1);
        }

        /* ─ Body ─ */
        .op-body { padding: 3rem 0 6rem; }
        .op-list { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ─ Card ─ */
        .oc-card {
          background: var(--st-bone);
          border: 1px solid var(--st-line);
          border-radius: var(--st-radius-sm);
          overflow: hidden;
          transition: box-shadow .35s var(--st-ease), border-color .35s var(--st-ease), transform .35s var(--st-ease);
          cursor: default;
        }
        .oc-card:hover {
          box-shadow: 0 20px 60px rgba(46,45,43,.12);
          border-color: transparent;
          transform: translateY(-3px);
        }

        /* Face = the always-visible part */
        .oc-face {
          display: grid;
          grid-template-columns: 36% 1fr;
          min-height: 220px;
          cursor: pointer;
          user-select: none;
        }

        /* Left image panel */
        .oc-img-panel {
          position: relative;
          overflow: hidden;
          background: var(--st-clay);
        }
        .oc-img-hero {
          position: absolute;
          inset: 0; width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .6s var(--st-ease);
          will-change: transform;
        }
        .oc-img-placeholder {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(244,244,242,.04) 0%, transparent 100%);
        }
        .oc-img-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(46,45,43,.4) 0%, transparent 60%),
                      linear-gradient(to top, rgba(20,20,19,.5) 0%, transparent 50%);
        }
        .oc-watermark {
          position: absolute;
          bottom: -8px; left: -4px;
          font-family: var(--st-font-display);
          font-size: 5.5rem;
          font-weight: 800;
          color: rgba(244,244,242,.06);
          line-height: 1;
          letter-spacing: -.04em;
          pointer-events: none;
          user-select: none;
        }
        .oc-extras {
          position: absolute;
          bottom: 14px; right: 14px;
          display: flex;
          align-items: center;
        }
        .oc-extra-thumb {
          width: 32px; height: 32px;
          border-radius: var(--st-radius-xs);
          border: 2px solid rgba(244,244,242,.25);
          overflow: hidden;
          background: rgba(244,244,242,.1);
          position: relative;
        }
        .oc-extra-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .oc-extra-count {
          font-family: var(--st-font-mono);
          font-size: .62rem;
          font-weight: 500;
          color: rgba(244,244,242,.6);
          margin-left: 8px;
        }

        /* Right info panel */
        .oc-info {
          padding: 1.75rem 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .oc-info-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .oc-index {
          font-family: var(--st-font-mono);
          font-size: .62rem;
          font-weight: 500;
          letter-spacing: .1em;
          color: var(--st-earth);
          text-transform: uppercase;
        }
        .oc-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--st-radius-pill);
          font-family: var(--st-font-mono);
          font-size: .62rem;
          font-weight: 500;
          letter-spacing: .05em;
        }
        .oc-status-glyph { font-size: .65rem; }

        .oc-product-name {
          font-family: var(--st-font-display);
          font-size: clamp(1.05rem, 1.6vw, 1.35rem);
          font-weight: 400;
          color: var(--st-clay);
          letter-spacing: -.02em;
          line-height: 1.25;
          margin-bottom: .25rem;
        }
        .oc-extra-label {
          font-family: var(--st-font-sans);
          font-size: .75rem;
          color: var(--st-earth);
          margin-bottom: .75rem;
        }
        .oc-date {
          font-family: var(--st-font-sans);
          font-size: .78rem;
          color: var(--st-earth);
          margin-bottom: auto;
          padding-bottom: 1rem;
        }

        .oc-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: .75rem;
        }
        .oc-price {
          font-family: var(--st-font-display);
          font-size: clamp(1.6rem, 2.5vw, 2.1rem);
          font-weight: 300;
          color: var(--st-clay);
          letter-spacing: -.04em;
          line-height: 1;
        }

        /* Warranty arc */
        .oc-warranty-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: .5rem;
        }
        .oc-warranty-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .oc-warranty-days {
          font-family: var(--st-font-display);
          font-size: 1.3rem;
          font-weight: 400;
          color: var(--st-clay);
          letter-spacing: -.03em;
          line-height: 1;
        }
        .oc-warranty-label {
          font-family: var(--st-font-mono);
          font-size: .6rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--st-earth);
        }
        .oc-expired {
          font-family: var(--st-font-sans);
          font-size: .72rem;
          color: var(--st-taupe);
          margin-bottom: .5rem;
        }

        .oc-chevron-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--st-font-sans);
          font-size: .72rem;
          font-weight: 500;
          color: var(--st-earth);
          margin-top: .75rem;
          padding-top: .75rem;
          border-top: 1px solid var(--st-line);
          transition: color .2s;
        }
        .oc-card:hover .oc-chevron-wrap { color: var(--st-clay); }

        /* ─ Drawer ─ */
        .oc-drawer {
          overflow: hidden;
          transition: max-height .42s var(--st-ease);
          max-height: 0;
        }
        .oc-drawer-inner {
          background: var(--st-clay);
        }
        .oc-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem .75rem;
          border-bottom: 1px solid rgba(244,244,242,.08);
          font-family: var(--st-font-mono);
          font-size: .6rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: rgba(244,244,242,.4);
        }
        .oc-warranty-link {
          font-family: var(--st-font-sans);
          font-size: .72rem;
          font-weight: 500;
          letter-spacing: .3px;
          color: rgba(244,244,242,.7);
          text-decoration: none;
          padding: 5px 14px;
          border: 1px solid rgba(244,244,242,.2);
          border-radius: var(--st-radius-pill);
          transition: all .2s;
          text-transform: none;
        }
        .oc-warranty-link:hover {
          background: rgba(244,244,242,.08);
          color: var(--st-bone);
        }

        .oc-items {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .oc-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(244,244,242,.06);
          animation: slideUpFade .3s var(--st-ease) both;
          transition: background .2s;
        }
        .oc-item:last-child { border-bottom: none; }
        .oc-item:hover { background: rgba(244,244,242,.04); }

        .oc-item-img {
          width: 64px; height: 64px;
          border-radius: var(--st-radius-xs);
          overflow: hidden;
          background: rgba(244,244,242,.06);
          border: 1px solid rgba(244,244,242,.1);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .oc-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .oc-item-img-empty { width: 100%; height: 100%; }

        .oc-item-body { flex: 1; min-width: 0; }
        .oc-item-name {
          font-family: var(--st-font-display);
          font-size: .95rem;
          font-weight: 400;
          color: rgba(244,244,242,.9);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .oc-item-meta {
          font-family: var(--st-font-sans);
          font-size: .75rem;
          color: rgba(244,244,242,.38);
        }
        .oc-item-total {
          font-family: var(--st-font-display);
          font-size: 1rem;
          font-weight: 400;
          color: rgba(244,244,242,.85);
          flex-shrink: 0;
        }

        .oc-drawer-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-top: 1px solid rgba(244,244,242,.08);
          background: rgba(0,0,0,.15);
        }
        .oc-foot-label {
          font-family: var(--st-font-mono);
          font-size: .6rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: rgba(244,244,242,.38);
        }
        .oc-foot-amount {
          font-family: var(--st-font-display);
          font-size: 1.75rem;
          font-weight: 300;
          color: var(--st-bone);
          letter-spacing: -.04em;
          line-height: 1;
        }

        /* ─ Empty / error ─ */
        .op-empty {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 6rem 2rem; gap: .625rem;
        }
        .op-empty-icon {
          width: 60px; height: 60px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--st-radius-sm);
          background: rgba(46,45,43,.05);
          border: 1px solid var(--st-line);
          color: var(--st-earth);
          margin-bottom: 1rem;
        }
        .op-empty-icon--err { background: rgba(239,68,68,.06); border-color: rgba(239,68,68,.2); }
        .op-empty h3 {
          font-family: var(--st-font-display);
          font-size: 1.35rem; font-weight: 400;
          color: var(--st-clay); letter-spacing: -.02em;
        }
        .op-empty p {
          font-family: var(--st-font-sans); font-size: .875rem;
          color: var(--st-earth); max-width: 300px; line-height: 1.65;
        }
        .op-cta {
          margin-top: 1.25rem;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px;
          background: var(--st-clay); color: var(--st-bone);
          font-family: var(--st-font-sans); font-size: .82rem; font-weight: 500;
          letter-spacing: .3px; text-decoration: none; border-radius: var(--st-radius-pill);
          border: 1px solid var(--st-clay);
          transition: all .25s var(--st-ease);
        }
        .op-cta:hover { background: var(--st-ink); border-color: var(--st-ink); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(46,45,43,.25); }

        /* ─ Pagination ─ */
        .op-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--st-line);
        }
        .op-pg-btn {
          min-width: 36px; height: 36px;
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0 8px;
          background: var(--st-bone);
          border: 1px solid var(--st-line);
          border-radius: var(--st-radius-xs);
          font-family: var(--st-font-sans);
          font-size: .82rem;
          font-weight: 500;
          color: var(--st-clay);
          cursor: pointer;
          transition: all .18s var(--st-ease);
        }
        .op-pg-btn:hover:not(:disabled) {
          border-color: var(--st-clay);
          color: var(--st-clay);
          background: var(--st-cream);
        }
        .op-pg-btn:disabled {
          opacity: .3;
          cursor: not-allowed;
        }
        .op-pg-btn--active {
          background: var(--st-clay);
          border-color: var(--st-clay);
          color: var(--st-bone);
          font-weight: 600;
        }
        .op-pg-btn--active:hover {
          background: var(--st-clay);
          border-color: var(--st-clay);
          color: var(--st-bone);
        }
        .op-pg-ellipsis {
          min-width: 36px; height: 36px;
          display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--st-font-sans);
          font-size: .85rem;
          color: var(--st-earth);
          user-select: none;
        }
        .op-pg-info {
          font-family: var(--st-font-mono);
          font-size: .62rem;
          color: var(--st-earth);
          margin-left: 8px;
          letter-spacing: .05em;
        }

        /* ─ Responsive ─ */
        @media (max-width: 900px) {
          .op-hero-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .op-stats { width: 100%; justify-content: stretch; }
          .op-stat { flex: 1; }
          .oc-face { grid-template-columns: 40% 1fr; }
        }
        @media (max-width: 640px) {
          .oc-face { grid-template-columns: 1fr; grid-template-rows: 180px auto; }
          .oc-img-panel { min-height: 180px; }
          .oc-info { padding: 1.25rem 1.25rem 1rem; }
          .oc-drawer-header, .oc-item, .oc-drawer-foot { padding-left: 1.25rem; padding-right: 1.25rem; }
          .op-stats { flex-direction: column; }
          .op-stat-sep { width: 100%; height: 1px; }
        }
      `}</style>
    </div>
  );
};

export default Orders;
