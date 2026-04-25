import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { warrantyService } from '../services/warranty.service';
import { ordersService } from '../services/orders.service';
import { technicianService } from '../services/technician.service';
import type { IWarranty } from '../types/warranty';
import type { Order } from '../types/order';
import type { Technician } from '../types/technician';
import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import StatsCards from '../components/StatsCards';
import ProductTable from '../components/ProductTable';
import { Badge } from '../components/ui/Badge';
import { SkeletonTableRow } from '../components/ui/Skeleton';

type SectionType = 'dashboard' | 'orders' | 'warranties' | 'products' | 'technicians';

const PAGE_SIZE = 10;

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  paid:      'success',
  pending:   'warning',
  review:    'neutral',
  resolved:  'success',
  rejected:  'error',
  refunded:  'error',
  shipped:   'neutral',
};
const statusLabel: Record<string, string> = {
  paid:      'Pagado',
  pending:   'Pendiente',
  review:    'En revisión',
  resolved:  'Resuelto',
  rejected:  'Rechazado',
  refunded:  'Reembolsado',
  shipped:   'Enviado',
};

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

/* ── Pagination ── */
function Pagination({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--line)',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>
        {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} de {total}
      </span>
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button 
          onClick={() => onPage(page - 1)} 
          disabled={page === 1} 
          style={{
            width: 28, 
            height: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: page === 1 ? 'var(--line)' : 'var(--ink)',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          ‹
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            style={{
              width: 28, 
              height: 28,
              border: 'none',
              borderRadius: '2px',
              background: p === page ? 'var(--ink)' : 'transparent',
              color: p === page ? 'var(--white)' : 'var(--ink2)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              fontWeight: p === page ? 500 : 400,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
        <button 
          onClick={() => onPage(page + 1)} 
          disabled={page === pages}
          style={{
            width: 28, 
            height: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: page === pages ? 'var(--line)' : 'var(--ink)',
            cursor: page === pages ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: '1rem',
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid var(--line)',
    }}>
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
        fontWeight: 300, 
        letterSpacing: '-0.025em',
        fontFamily: 'var(--font-display)',
        color: 'var(--ink)',
      }}>
        {title}
      </h2>
      {count !== undefined && (
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--gray)',
          background: 'var(--cream)',
          padding: '4px 12px',
          borderRadius: '2px',
          fontFamily: 'var(--font-sans)',
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

/* ── Technician form ── */
function TechnicianForm({ onSubmit, isPending }: { onSubmit: (d: { name: string; email: string; phone?: string }) => void; isPending: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined });
    setName(''); setEmail(''); setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--white)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-card)',
      padding: '1.75rem',
      marginBottom: '1.75rem',
    }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: '1.25rem' }}>
        Agregar técnico
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
        {[
          { label: 'Nombre',   value: name,  onChange: setName,  ph: 'Juan Pérez', type: 'text', required: true  },
          { label: 'Email',    value: email, onChange: setEmail, ph: 'juan@safetech.com', type: 'email', required: true  },
          { label: 'Teléfono', value: phone, onChange: setPhone, ph: '+507 0000-0000', type: 'text', required: false },
        ].map(({ label, value, onChange, ph, type, required }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
              {label}
            </label>
            <input
              value={value}
              onChange={e => onChange(e.target.value)}
              type={type}
              placeholder={ph}
              className="input"
              required={required}
              style={{ fontSize: '0.875rem' }}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{ height: 42, padding: '0 22px', fontSize: '0.85rem' }}
        >
          {isPending ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════ Main Dashboard ══════════════════ */
export default function AdminDashboard() {
  const { getToken, isLoaded } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [warrantiesPage, setWarrantiesPage] = useState(1);
  const [techniciansPage, setTechniciansPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return ordersService.getAllOrders(token);
    },
    enabled: isLoaded,
  });

  const { data: warranties, isLoading: warrantiesLoading } = useQuery<IWarranty[]>({
    queryKey: ['admin-warranties'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return warrantyService.getAllWarranties(token);
    },
    enabled: isLoaded,
  });

  const { data: technicians, isLoading: techniciansLoading } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return technicianService.getTechnicians(token);
    },
    enabled: isLoaded,
  });

  const warrantyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return warrantyService.updateWarrantyStatus(id, status, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-warranties'] }),
  });

  const assignTechMutation = useMutation({
    mutationFn: async ({ id, technicianId, technicianName }: { id: string; technicianId: string; technicianName: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return warrantyService.assignTechnician(id, technicianId, technicianName, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-warranties'] }),
  });

  const technicianMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return technicianService.createTechnician(data, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['technicians'] }),
  });

  const handleSectionChange = (section: string) => {
    setActiveSection(section as SectionType);
    setOrdersPage(1);
    setWarrantiesPage(1);
    setTechniciansPage(1);
    setSidebarOpen(false);
  };

  const pagedOrders      = (orders      ?? []).slice((ordersPage - 1)      * PAGE_SIZE, ordersPage      * PAGE_SIZE);
  const pagedWarranties  = (warranties  ?? []).slice((warrantiesPage - 1)  * PAGE_SIZE, warrantiesPage  * PAGE_SIZE);
  const pagedTechnicians = (technicians ?? []).slice((techniciansPage - 1) * PAGE_SIZE, techniciansPage * PAGE_SIZE);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      <AdminSidebar
        activeSection={activeSection}
        onNavigate={handleSectionChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(17,16,16,0.45)', zIndex: 199, backdropFilter: 'blur(2px)' }}
        />
      )}

      <main style={{ flex: 1, minWidth: 0, background: 'var(--cream)' }}>
        {/* Mobile toggle */}
        <div style={{ display: 'none', padding: '1rem 1.5rem', borderBottom: '1px solid var(--line)', background: 'var(--white)' }} className="mobile-topbar">
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <div className="admin-page">

          {/* ══ DASHBOARD — solo métricas ══ */}
          {activeSection === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 500, 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  color: 'var(--gray)', 
                  marginBottom: '0.75rem',
                  fontFamily: 'var(--font-sans)' 
                }}>
                  Panel de control
                </p>
                <h1 style={{ 
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', 
                  fontWeight: 300, 
                  letterSpacing: '-0.025em',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.1,
                }}>
                  Resumen general
                </h1>
              </div>
              <StatsCards orders={orders} warranties={warranties} />
            </div>
          )}

          {/* ══ ÓRDENES ══ */}
          {activeSection === 'orders' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Órdenes" count={orders?.length} />
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                      : pagedOrders.length === 0
                        ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay órdenes registradas.
                            </td>
                          </tr>
                        )
                        : pagedOrders.map((order) => (
                          <tr key={order._id}>
                            <td style={{ fontWeight: 500 }}>{formatDate(order.createdAt)}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>
                              {(order as any).userDoc?.email || order.userId || '—'}
                            </td>
                            <td>
                              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                                ${order.total_amount?.toFixed(2)}
                              </span>
                            </td>
                            <td style={{ color: 'var(--ink2)', fontWeight: 500 }}>
                              {order.items.reduce((s, i) => s + i.quantity, 0)}
                            </td>
                            <td>
                              <Badge variant={statusVariant[order.status] ?? 'neutral'}>
                                {statusLabel[order.status] ?? order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination total={orders?.length ?? 0} page={ordersPage} onPage={setOrdersPage} />
              </div>
            </div>
          )}

          {/* ══ GARANTÍAS ══ */}
          {activeSection === 'warranties' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Garantías" count={warranties?.length} />
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Descripción</th>
                      <th>Técnico</th>
                      <th>Estado</th>
                      <th className="actions">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warrantiesLoading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                      : pagedWarranties.length === 0
                        ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay garantías registradas.
                            </td>
                          </tr>
                        )
                        : pagedWarranties.map((w: IWarranty) => (
                          <tr key={w._id}>
                            <td style={{ fontWeight: 500 }}>{formatDate(w.createdAt)}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>
                              {w.userDoc?.email || w.userId}
                            </td>
                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.description}>
                              {w.description}
                            </td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>
                              {w.technicianName || <span style={{ color: 'var(--ink3)' }}>Sin asignar</span>}
                            </td>
                            <td>
                              <Badge variant={statusVariant[w.status] ?? 'neutral'}>
                                {statusLabel[w.status] ?? w.status}
                              </Badge>
                            </td>
                            <td className="actions">
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <select
                                  className="admin-select"
                                  value={w.technicianId || ''}
                                  onChange={(e) => {
                                    const tech = technicians?.find((t) => t._id === e.target.value);
                                    if (tech) assignTechMutation.mutate({ id: w._id, technicianId: tech._id, technicianName: tech.name });
                                  }}
                                  disabled={assignTechMutation.isPending}
                                  style={{ minWidth: 120 }}
                                >
                                  <option value="">Técnico…</option>
                                  {(technicians || []).map((t) => (
                                    <option key={t._id} value={t._id}>{t.name}</option>
                                  ))}
                                </select>
                                <select
                                  className="admin-select"
                                  value={w.status}
                                  onChange={(e) => warrantyMutation.mutate({ id: w._id, status: e.target.value })}
                                  disabled={warrantyMutation.isPending}
                                  style={{ minWidth: 120 }}
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="review">En revisión</option>
                                  <option value="resolved">Resuelto</option>
                                  <option value="refunded">Reembolsado</option>
                                  <option value="rejected">Rechazado</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination total={warranties?.length ?? 0} page={warrantiesPage} onPage={setWarrantiesPage} />
              </div>
            </div>
          )}

          {/* ══ PRODUCTOS ══ */}
          {activeSection === 'products' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Productos" />
              <ProductTable />
            </div>
          )}

          {/* ══ TÉCNICOS ══ */}
          {activeSection === 'technicians' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Técnicos" count={technicians?.length} />
              <TechnicianForm
                onSubmit={(d) => technicianMutation.mutate(d)}
                isPending={technicianMutation.isPending}
              />
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techniciansLoading
                      ? Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                      : pagedTechnicians.length === 0
                        ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay técnicos registrados.
                            </td>
                          </tr>
                        )
                        : pagedTechnicians.map((tech) => (
                          <tr key={tech._id}>
                            <td style={{ fontWeight: 600 }}>{tech.name}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>{tech.email}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>{tech.phone || '—'}</td>
                            <td>
                              <Badge variant={tech.active ? 'success' : 'neutral'}>
                                {tech.active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination total={technicians?.length ?? 0} page={techniciansPage} onPage={setTechniciansPage} />
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .mobile-topbar { display: flex !important; align-items: center; }
        }
      `}</style>
    </div>
  );
}
