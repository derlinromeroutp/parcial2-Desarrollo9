import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { warrantyService } from '../services/warranty.service';
import type { IWarranty } from '../types/warranty';
import { Badge } from '../components/ui/Badge';

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  review:    'neutral',
  resolved:  'success',
  rejected:  'error',
  refunded:  'error',
};
const statusLabel: Record<string, string> = {
  review:    'En revisión',
  resolved:  'Resuelto',
  rejected:  'Rechazado',
  refunded:  'Reembolsado',
};

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

function TicketCard({ warranty }: { warranty: IWarranty }) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(warranty.repairNotes || '');
  const [status, setStatus] = useState(warranty.status);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return warrantyService.technicianUpdate(warranty._id, { status, repairNotes: notes }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-warranties'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const isDone = warranty.status === 'resolved' || warranty.status === 'rejected' || warranty.status === 'refunded';

  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-card)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gray)', fontFamily: 'var(--font-sans)', marginBottom: '0.25rem' }}>
            Ticket · {formatDate(warranty.createdAt)}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', fontFamily: 'var(--font-sans)' }}>
            Usuario: {warranty.userId}
          </p>
        </div>
        <Badge variant={statusVariant[warranty.status] ?? 'warning'}>
          {statusLabel[warranty.status] ?? warranty.status}
        </Badge>
      </div>

      {/* Descripción */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '4px',
        padding: '0.875rem 1rem',
        fontSize: '0.875rem',
        color: 'var(--ink)',
        lineHeight: 1.6,
        fontFamily: 'var(--font-sans)',
      }}>
        {warranty.description}
      </div>

      {/* Evidencias */}
      {warranty.evidenceUrls?.length > 0 && (
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: '0.5rem' }}>
            Evidencias
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {warranty.evidenceUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`Evidencia ${i + 1}`}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Controles del técnico */}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: 4 }}>
              Estado
            </label>
            <select
              className="admin-select"
              value={status}
              onChange={e => setStatus(e.target.value as IWarranty['status'])}
              style={{ width: '100%' }}
            >
              <option value="review">En revisión</option>
              <option value="resolved">Resuelto</option>
              <option value="refunded">Reembolsado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: 4 }}>
            Notas de diagnóstico
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe el diagnóstico, reparación realizada o motivo de rechazo…"
            rows={3}
            className="input"
            style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem', lineHeight: 1.5 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || isDone}
            className="btn-primary"
            style={{ padding: '0 1.5rem', height: 40, fontSize: '0.85rem' }}
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {saved && (
            <span style={{ fontSize: '0.8rem', color: '#2a7a4b', fontFamily: 'var(--font-sans)' }}>
              ✓ Guardado
            </span>
          )}
          {isDone && (
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>
              Ticket cerrado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TechnicianDashboard() {
  const { getToken, isLoaded } = useAuth();
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');

  const { data: warranties, isLoading } = useQuery<IWarranty[]>({
    queryKey: ['assigned-warranties'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return warrantyService.getAssignedWarranties(token);
    },
    enabled: isLoaded,
  });

  const filtered = (warranties ?? []).filter(w => {
    if (filter === 'open') return w.status === 'review';
    if (filter === 'closed') return ['resolved', 'rejected', 'refunded'].includes(w.status);
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--line)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--gray)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>
            Portal técnico
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.025em', color: 'var(--ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
            Mis tickets asignados
          </h1>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['open', 'closed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                border: '1.5px solid var(--line)',
                borderRadius: '2px',
                background: filter === f ? 'var(--ink)' : 'transparent',
                color: filter === f ? 'var(--white)' : 'var(--ink2)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {f === 'open' ? 'En revisión' : f === 'closed' ? 'Cerrados' : 'Todos'}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)', alignSelf: 'center' }}>
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista */}
        {isLoading ? (
          <p style={{ color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>Cargando tickets…</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontFamily: 'var(--font-sans)', background: 'var(--white)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-card)' }}>
            No hay tickets {filter === 'open' ? 'en revisión' : filter === 'closed' ? 'cerrados' : ''}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(w => <TicketCard key={w._id} warranty={w} />)}
          </div>
        )}
      </div>
    </div>
  );
}
