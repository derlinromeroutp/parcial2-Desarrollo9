import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SignInButton, useAuth } from '../lib/auth';
import { supportTicketService } from '../services/supportTicket.service';
import type { SupportTicket } from '../types/supportTicket';
import { Badge } from '../components/ui/Badge';

const statusVariant: Record<SupportTicket['status'], 'success' | 'warning' | 'neutral'> = {
  open: 'warning',
  in_review: 'neutral',
  closed: 'success',
};
const statusLabel: Record<SupportTicket['status'], string> = {
  open: 'Abierto',
  in_review: 'En revisión',
  closed: 'Cerrado',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Support() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);

  const { data: tickets, isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ['my-support-tickets'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      return supportTicketService.getMyTickets(token);
    },
    enabled: isLoaded && isSignedIn,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { category: string; description: string; contactChannel: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      return supportTicketService.createTicket(data, token);
    },
    onSuccess: (result) => {
      setLastTicketId(result.ticketId);
      setCategory('');
      setDescription('');
      setContactChannel('');
      queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] });
    },
    onError: (err: unknown) => {
      const axiosMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      const message = err instanceof Error ? err.message : undefined;
      setFormError(axiosMessage || message || 'No pudimos crear el ticket.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLastTicketId(null);

    if (!category.trim() || !description.trim() || !contactChannel.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (description.trim().length < 10) {
      setFormError('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    createTicketMutation.mutate({
      category: category.trim(),
      description: description.trim(),
      contactChannel: contactChannel.trim(),
    });
  };

  if (!isLoaded) {
    return (
      <div className="op-root">
        <main className="op-body">
          <div className="page-container">
            <div className="op-empty">
              <h3>Preparando soporte</h3>
              <p>Validando tu sesión.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="op-root">
        <main className="op-body">
          <div className="page-container">
            <div className="op-empty">
              <h3>Debes iniciar sesión para contactar a soporte</h3>
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
      <header className="op-hero">
        <div className="op-noise" />
        <div className="op-diag" />
        <div className="page-container op-hero-inner">
          <div className="op-hero-text">
            <p className="op-eyebrow">Ayuda de SafeTech</p>
            <h1 className="op-title">
              Centro de<br />
              <em>soporte</em>
            </h1>
          </div>
        </div>
      </header>

      <main className="op-body">
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720 }}>
          <section className="oc-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>
              Abrir un ticket
            </h2>
            <p style={{ color: 'var(--ink2)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Para problemas que no encajen en una garantía o un pedido puntual.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
              <input
                className="input"
                placeholder="Categoría (ej: pagos, cuenta, envíos)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <textarea
                className="input"
                placeholder="Describe el problema (mínimo 10 caracteres)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <input
                className="input"
                placeholder="Canal de contacto preferido (email, teléfono, etc.)"
                value={contactChannel}
                onChange={(e) => setContactChannel(e.target.value)}
              />

              {formError && <div className="alert alert-error">{formError}</div>}
              {lastTicketId && (
                <div className="alert alert-success">
                  Ticket creado: #{lastTicketId.slice(-6)}. Te avisaremos por correo ante cualquier actualización.
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={createTicketMutation.isPending}
                style={{ justifySelf: 'start', padding: '10px 22px' }}
              >
                {createTicketMutation.isPending ? 'Enviando…' : 'Enviar ticket'}
              </button>
            </form>
          </section>

          <section className="oc-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>
              Mis tickets
            </h2>

            {ticketsLoading && <p style={{ color: 'var(--ink2)' }}>Cargando tickets...</p>}

            {!ticketsLoading && (!tickets || tickets.length === 0) && (
              <p style={{ color: 'var(--ink3)' }}>Todavía no abriste ningún ticket de soporte.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(tickets ?? []).map((ticket) => (
                <div
                  key={ticket._id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-ui)',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>
                      #{ticket._id.slice(-6)} · {ticket.category}
                    </strong>
                    <Badge variant={statusVariant[ticket.status]}>{statusLabel[ticket.status]}</Badge>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', margin: 0 }}>{ticket.description}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>
                    Abierto el {formatDate(ticket.createdAt)} · Contacto: {ticket.contactChannel}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
