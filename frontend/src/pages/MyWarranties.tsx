import { useEffect, useState } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { warrantyService } from '../services/warranty.service';
import type { IWarranty } from '../types/warranty';
import { Skeleton } from '../components/ui/Skeleton';

const STATUS_MAP = {
  pending:  { label: 'Pendiente',    ink: '#92400e', bg: 'rgba(245,158,11,0.12)',  rim: 'rgba(245,158,11,0.35)',  glyph: '◐' },
  review:   { label: 'En revisión',  ink: '#1e40af', bg: 'rgba(59,130,246,0.12)',  rim: 'rgba(59,130,246,0.35)',  glyph: '↻' },
  resolved: { label: 'Resuelto',     ink: '#065f46', bg: 'rgba(16,185,129,0.12)',  rim: 'rgba(16,185,129,0.35)',  glyph: '✓' },
  rejected: { label: 'Rechazado',    ink: '#991b1b', bg: 'rgba(239,68,68,0.12)',   rim: 'rgba(239,68,68,0.35)',   glyph: '✕' },
  refunded: { label: 'Reembolsado',  ink: '#065f46', bg: 'rgba(16,185,129,0.12)',  rim: 'rgba(16,185,129,0.35)',  glyph: '$' },
} as const;

type StatusKey = keyof typeof STATUS_MAP;
const getST = (s: string) => STATUS_MAP[s as StatusKey] ?? STATUS_MAP.pending;

const relativeDate = (d?: string) => {
  if (!d) return '—';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TIMELINE = ['pending', 'review', 'resolved'] as const;
const TIMELINE_LABELS: Record<string, string> = {
  pending: 'Recibido',
  review: 'En revisión',
  resolved: 'Resuelto',
};

function StatusTimeline({ status }: { status: string }) {
  if (status === 'rejected' || status === 'refunded') return null;
  const current = TIMELINE.indexOf(status as any);
  return (
    <div className="wc-timeline">
      {TIMELINE.map((step, i) => (
        <div key={step} className="wc-tl-step">
          <div className={`wc-tl-dot ${i <= current ? 'wc-tl-dot--active' : ''}`} />
          <span className={`wc-tl-label ${i <= current ? 'wc-tl-label--active' : ''}`}>
            {TIMELINE_LABELS[step]}
          </span>
          {i < TIMELINE.length - 1 && (
            <div className={`wc-tl-line ${i < current ? 'wc-tl-line--active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function WarrantyCard({ warranty, idx }: { warranty: IWarranty; idx: number }) {
  const [open, setOpen] = useState(false);
  const st = getST(warranty.status);
  const orderId = typeof warranty.orderId === 'object' ? warranty.orderId?._id : warranty.orderId;
  const shortOrder = String(orderId).slice(-6).toUpperCase();

  return (
    <article className="wc-card" style={{ animationDelay: `${idx * 80}ms` }}>
      <div className="wc-face" onClick={() => setOpen(o => !o)}>
        <div className="wc-face-left">
          <span className="wc-ticket">#{String(idx + 1).padStart(3, '0')}</span>
          <span className="wc-status-badge" style={{ background: st.bg, color: st.ink, border: `1px solid ${st.rim}` }}>
            <span>{st.glyph}</span> {st.label}
          </span>
        </div>

        <div className="wc-face-body">
          <p className="wc-desc">{warranty.description}</p>
          <p className="wc-meta">Orden #{shortOrder} · {relativeDate(warranty.createdAt)}</p>
          {warranty.technicianName && (
            <p className="wc-technician">Técnico: {warranty.technicianName}</p>
          )}
        </div>

        <div className="wc-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="wc-drawer">
          <StatusTimeline status={warranty.status} />

          {warranty.repairNotes && (
            <div className="wc-notes">
              <p className="wc-notes-label">Notas del técnico</p>
              <p className="wc-notes-body">{warranty.repairNotes}</p>
            </div>
          )}

          {warranty.evidenceUrls && warranty.evidenceUrls.length > 0 && (
            <div className="wc-evidence">
              <p className="wc-notes-label">Evidencia adjunta</p>
              <div className="wc-evidence-grid">
                {warranty.evidenceUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="wc-evidence-thumb">
                    <img src={url} alt={`Evidencia ${i + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {!warranty.repairNotes && (!warranty.evidenceUrls || warranty.evidenceUrls.length === 0) && (
            <p className="wc-empty-detail">Sin notas adicionales por ahora.</p>
          )}
        </div>
      )}
    </article>
  );
}

export default function MyWarranties() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [warranties, setWarranties] = useState<IWarranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        const data = await warrantyService.getMyWarranties(token!);
        setWarranties(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn]);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="mw-root">
        <header className="mw-hero">
          <div className="page-container mw-hero-inner">
            <p className="mw-eyebrow">Mi cuenta · SafeTech</p>
            <h1 className="mw-title">Mis <em>garantías</em></h1>
          </div>
        </header>
        <main className="mw-body">
          <div className="page-container">
            <div className="mw-empty">
              <h3>Debes iniciar sesión</h3>
              <p>Accede para ver el estado de tus garantías.</p>
              <SignInButton mode="modal"><button className="mw-cta">Iniciar sesión</button></SignInButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mw-root">
      <header className="mw-hero">
        <div className="page-container mw-hero-inner">
          <div>
            <p className="mw-eyebrow">Mi cuenta · SafeTech</p>
            <h1 className="mw-title">Mis <em>garantías</em></h1>
          </div>
          {warranties.length > 0 && (
            <div className="mw-stat-box">
              <span className="mw-stat-n">{warranties.length}</span>
              <span className="mw-stat-l">reclamaciones</span>
            </div>
          )}
        </div>
      </header>

      <main className="mw-body">
        <div className="page-container">
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2].map(i => <Skeleton key={i} style={{ height: 100, borderRadius: 8 }} />)}
            </div>
          )}

          {error && (
            <div className="mw-empty">
              <h3>No pudimos cargar tus garantías</h3>
              <p>Verifica tu conexión e intenta de nuevo.</p>
            </div>
          )}

          {!loading && !error && warranties.length === 0 && (
            <div className="mw-empty">
              <h3>No tienes garantías registradas</h3>
              <p>Si tuviste un problema con un pedido, podés registrar una garantía desde la sección de pedidos.</p>
              <Link to="/orders" className="mw-cta">Ver mis pedidos</Link>
            </div>
          )}

          {!loading && !error && warranties.length > 0 && (
            <div className="mw-list">
              {warranties.map((w, i) => <WarrantyCard key={w._id} warranty={w} idx={i} />)}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .mw-root { min-height: 100vh; background: var(--st-bone); }

        .mw-hero {
          background: var(--st-clay);
          padding-bottom: 3.5rem;
        }
        .mw-hero-inner {
          padding-top: calc(var(--header-height) + 3.5rem);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .mw-eyebrow {
          font-family: var(--st-font-mono);
          font-size: .62rem;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(244,244,242,.45);
          margin-bottom: .875rem;
        }
        .mw-title {
          font-family: var(--st-font-display);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 300;
          color: var(--st-bone);
          line-height: 1.0;
          letter-spacing: -.035em;
        }
        .mw-title em { font-style: italic; font-weight: 400; color: var(--st-sand); }

        .mw-stat-box {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(244,244,242,.06);
          border: 1px solid rgba(244,244,242,.12);
          border-radius: var(--st-radius-md);
          padding: 1.25rem 2.5rem;
          gap: 4px;
        }
        .mw-stat-n {
          font-family: var(--st-font-display);
          font-size: 2.25rem; font-weight: 300;
          color: var(--st-bone); letter-spacing: -.04em; line-height: 1;
        }
        .mw-stat-l {
          font-family: var(--st-font-mono);
          font-size: .6rem; font-weight: 500;
          text-transform: uppercase; letter-spacing: 1.5px;
          color: rgba(244,244,242,.4);
        }

        .mw-body { padding: 3rem 0 6rem; }
        .mw-list { display: flex; flex-direction: column; gap: 1rem; }

        /* Card */
        .wc-card {
          background: var(--st-bone);
          border: 1px solid var(--st-line);
          border-radius: var(--st-radius-sm);
          overflow: hidden;
          animation: slideUpFade .35s var(--st-ease) both;
          transition: box-shadow .3s, border-color .3s, transform .3s;
        }
        .wc-card:hover {
          box-shadow: 0 16px 48px rgba(46,45,43,.1);
          border-color: transparent;
          transform: translateY(-2px);
        }
        .wc-face {
          display: flex; align-items: center; gap: 1.5rem;
          padding: 1.5rem 2rem;
          cursor: pointer; user-select: none;
        }
        .wc-face-left {
          display: flex; flex-direction: column; align-items: flex-start; gap: .5rem;
          flex-shrink: 0; min-width: 120px;
        }
        .wc-ticket {
          font-family: var(--st-font-mono);
          font-size: .62rem; font-weight: 500;
          letter-spacing: .1em; color: var(--st-earth);
          text-transform: uppercase;
        }
        .wc-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px;
          border-radius: var(--st-radius-pill);
          font-family: var(--st-font-mono);
          font-size: .62rem; font-weight: 500; letter-spacing: .04em;
          white-space: nowrap;
        }
        .wc-face-body { flex: 1; min-width: 0; }
        .wc-desc {
          font-family: var(--st-font-display);
          font-size: .95rem; font-weight: 400;
          color: var(--st-clay); letter-spacing: -.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: .3rem;
        }
        .wc-meta {
          font-family: var(--st-font-sans);
          font-size: .75rem; color: var(--st-earth);
        }
        .wc-technician {
          font-family: var(--st-font-sans);
          font-size: .75rem; color: var(--st-rust);
          margin-top: .2rem;
        }
        .wc-chevron {
          flex-shrink: 0; color: var(--st-earth);
          transition: transform .3s var(--st-ease);
        }

        /* Drawer */
        .wc-drawer {
          border-top: 1px solid var(--st-line);
          padding: 1.75rem 2rem;
          background: var(--st-cream, #f5f0e8);
          display: flex; flex-direction: column; gap: 1.5rem;
        }

        /* Timeline */
        .wc-timeline {
          display: flex; align-items: flex-start; gap: 0;
        }
        .wc-tl-step {
          display: flex; flex-direction: column; align-items: center;
          position: relative; flex: 1;
        }
        .wc-tl-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--st-line);
          border: 2px solid var(--st-line);
          z-index: 1;
          transition: background .3s;
        }
        .wc-tl-dot--active { background: var(--st-rust); border-color: var(--st-rust); }
        .wc-tl-label {
          font-family: var(--st-font-mono);
          font-size: .58rem; font-weight: 500;
          text-transform: uppercase; letter-spacing: .08em;
          color: var(--st-taupe);
          margin-top: .5rem; text-align: center;
        }
        .wc-tl-label--active { color: var(--st-clay); }
        .wc-tl-line {
          position: absolute;
          top: 6px; left: 50%; right: -50%;
          height: 2px; background: var(--st-line);
          z-index: 0;
        }
        .wc-tl-line--active { background: var(--st-rust); }

        /* Notes */
        .wc-notes-label {
          font-family: var(--st-font-mono);
          font-size: .6rem; font-weight: 500;
          text-transform: uppercase; letter-spacing: .1em;
          color: var(--st-earth); margin-bottom: .5rem;
        }
        .wc-notes-body {
          font-family: var(--st-font-sans);
          font-size: .875rem; color: var(--st-clay);
          line-height: 1.65;
        }
        .wc-empty-detail {
          font-family: var(--st-font-sans);
          font-size: .82rem; color: var(--st-taupe);
          font-style: italic;
        }

        /* Evidence */
        .wc-evidence-grid {
          display: flex; gap: .75rem; flex-wrap: wrap; margin-top: .5rem;
        }
        .wc-evidence-thumb {
          width: 80px; height: 80px;
          border-radius: var(--st-radius-xs);
          overflow: hidden;
          border: 1px solid var(--st-line);
        }
        .wc-evidence-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Empty */
        .mw-empty {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 6rem 2rem; gap: .625rem;
        }
        .mw-empty h3 {
          font-family: var(--st-font-display);
          font-size: 1.35rem; font-weight: 400;
          color: var(--st-clay); letter-spacing: -.02em;
        }
        .mw-empty p {
          font-family: var(--st-font-sans); font-size: .875rem;
          color: var(--st-earth); max-width: 320px; line-height: 1.65;
        }
        .mw-cta {
          margin-top: 1.25rem;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px;
          background: var(--st-clay); color: var(--st-bone);
          font-family: var(--st-font-sans); font-size: .82rem; font-weight: 500;
          text-decoration: none; border-radius: var(--st-radius-pill);
          border: 1px solid var(--st-clay);
          cursor: pointer;
          transition: all .25s var(--st-ease);
        }
        .mw-cta:hover { background: var(--st-ink); border-color: var(--st-ink); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(46,45,43,.25); }

        @media (max-width: 640px) {
          .wc-face { flex-wrap: wrap; }
          .wc-face-left { flex-direction: row; align-items: center; min-width: unset; width: 100%; }
          .wc-desc { font-size: .875rem; }
        }
      `}</style>
    </div>
  );
}
