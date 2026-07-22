import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { warrantyService } from '../services/warranty.service';
import { ordersService } from '../services/orders.service';
import { technicianService } from '../services/technician.service';
import { couponService } from '../services/coupon.service';
import { supportTicketService } from '../services/supportTicket.service';
import { auditLogService } from '../services/auditLog.service';
import type { IWarranty } from '../types/warranty';
import type { Order } from '../types/order';
import type { Technician } from '../types/technician';
import type { Coupon } from '../types/coupon';
import type { SupportTicket } from '../types/supportTicket';
import type { AuditLog } from '../types/auditLog';
import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import StatsCards from '../components/StatsCards';
import LowStockAlerts from '../components/LowStockAlerts';
import ProductTable from '../components/ProductTable';
import { Badge } from '../components/ui/Badge';
import { SkeletonTableRow } from '../components/ui/Skeleton';

type SectionType = 'dashboard' | 'orders' | 'warranties' | 'products' | 'technicians' | 'coupons' | 'support' | 'audit';

const PAGE_SIZE = 10;

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  paid:       'success',
  pending:    'warning',
  review:     'neutral',
  resolved:   'success',
  rejected:   'error',
  refunded:   'error',
  processing: 'neutral',
  shipped:    'neutral',
  delivered:  'success',
  open:       'warning',
  in_review:  'neutral',
  closed:     'success',
};
const statusLabel: Record<string, string> = {
  paid:       'Pagado',
  pending:    'Pendiente',
  review:     'En revisión',
  resolved:   'Resuelto',
  rejected:   'Rechazado',
  refunded:   'Reembolsado',
  processing: 'En preparación',
  shipped:    'Enviado',
  delivered:  'Entregado',
  open:       'Abierto',
  in_review:  'En revisión',
  closed:     'Cerrado',
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
function TechnicianForm({ onSubmit, isPending }: { onSubmit: (d: { name: string; email: string; phone?: string; clerkId?: string }) => void; isPending: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clerkId, setClerkId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, clerkId: clerkId.trim() || undefined });
    setName(''); setEmail(''); setPhone(''); setClerkId('');
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
        {[
          { label: 'Nombre',   value: name,    onChange: setName,    ph: 'Juan Pérez',          type: 'text',  required: true  },
          { label: 'Email',    value: email,   onChange: setEmail,   ph: 'juan@safetech.com',   type: 'email', required: true  },
          { label: 'Teléfono', value: phone,   onChange: setPhone,   ph: '+507 0000-0000',      type: 'text',  required: false },
          { label: 'Clerk ID', value: clerkId, onChange: setClerkId, ph: 'user_2abc…',          type: 'text',  required: false },
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

/* ── Coupon form ── */
function CouponForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (d: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: string;
    validUntil: string;
    minPurchase?: number;
    maxUses?: number;
  }) => void;
  isPending: boolean;
}) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !discountValue || !validFrom || !validUntil) {
      setFormError('Código, valor de descuento y vigencia son obligatorios.');
      return;
    }

    onSubmit({
      code: code.trim(),
      discountType,
      discountValue: Number(discountValue),
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
    });

    setCode(''); setDiscountValue(''); setValidFrom(''); setValidUntil(''); setMinPurchase(''); setMaxUses('');
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
        Crear cupón
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Código
          </label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="VERANO10" className="input" required style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Tipo
          </label>
          <select value={discountType} onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')} className="input" style={{ fontSize: '0.875rem' }}>
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Valor
          </label>
          <input value={discountValue} onChange={e => setDiscountValue(e.target.value)} type="number" min="0" placeholder={discountType === 'percentage' ? '10' : '15.00'} className="input" required style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Compra mínima
          </label>
          <input value={minPurchase} onChange={e => setMinPurchase(e.target.value)} type="number" min="0" placeholder="Opcional" className="input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Válido desde
          </label>
          <input value={validFrom} onChange={e => setValidFrom(e.target.value)} type="date" className="input" required style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Válido hasta
          </label>
          <input value={validUntil} onChange={e => setValidUntil(e.target.value)} type="date" className="input" required style={{ fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink3)', marginBottom: 5 }}>
            Usos máximos
          </label>
          <input value={maxUses} onChange={e => setMaxUses(e.target.value)} type="number" min="1" placeholder="Ilimitado" className="input" style={{ fontSize: '0.875rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button type="submit" disabled={isPending} className="btn-primary" style={{ height: 42, padding: '0 22px', fontSize: '0.85rem', width: '100%' }}>
            {isPending ? 'Creando…' : 'Crear cupón'}
          </button>
        </div>
      </div>
      {formError && <div className="alert alert-error">{formError}</div>}
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
  const [couponsPage, setCouponsPage] = useState(1);
  const [supportPage, setSupportPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
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

  const assignTechMutation = useMutation({
    mutationFn: async ({ id, technicianId }: { id: string; technicianId: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return warrantyService.assignTechnician(id, technicianId, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-warranties'] }),
  });

  const technicianMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; clerkId?: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return technicianService.createTechnician(data, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['technicians'] }),
  });

  const deactivateTechnicianMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return technicianService.deleteTechnician(id, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['technicians'] }),
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return couponService.getCoupons(token);
    },
    enabled: isLoaded,
  });

  const couponMutation = useMutation({
    mutationFn: async (data: {
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      validFrom: string;
      validUntil: string;
      minPurchase?: number;
      maxUses?: number;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return couponService.createCoupon(data, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const deactivateCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return couponService.deactivateCoupon(id, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const { data: supportTickets, isLoading: supportTicketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return supportTicketService.getAllTickets(token);
    },
    enabled: isLoaded,
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'open' | 'in_review' | 'closed' }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return supportTicketService.updateTicketStatus(id, status, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] }),
  });

  const { data: auditLogs, isLoading: auditLogsLoading } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return auditLogService.getAll(token);
    },
    enabled: isLoaded,
  });

  const updateShippingMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: { status?: 'processing' | 'shipped' | 'delivered'; carrier?: string; trackingNumber?: string } }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return ordersService.updateShipping(orderId, data, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const refundOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return ordersService.refundOrder(orderId, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const [managingOrderId, setManagingOrderId] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState<{ status: '' | 'processing' | 'shipped' | 'delivered'; carrier: string; trackingNumber: string }>({ status: '', carrier: '', trackingNumber: '' });

  const handleSectionChange = (section: string) => {
    setActiveSection(section as SectionType);
    setOrdersPage(1);
    setWarrantiesPage(1);
    setTechniciansPage(1);
    setCouponsPage(1);
    setSupportPage(1);
    setAuditPage(1);
    setSidebarOpen(false);
  };

  const pagedOrders         = (orders         ?? []).slice((ordersPage - 1)         * PAGE_SIZE, ordersPage         * PAGE_SIZE);
  const pagedWarranties     = (warranties     ?? []).slice((warrantiesPage - 1)     * PAGE_SIZE, warrantiesPage     * PAGE_SIZE);
  const pagedTechnicians    = (technicians    ?? []).slice((techniciansPage - 1)    * PAGE_SIZE, techniciansPage    * PAGE_SIZE);
  const pagedCoupons        = (coupons        ?? []).slice((couponsPage - 1)        * PAGE_SIZE, couponsPage        * PAGE_SIZE);
  const pagedSupportTickets = (supportTickets ?? []).slice((supportPage - 1)        * PAGE_SIZE, supportPage        * PAGE_SIZE);
  const pagedAuditLogs      = (auditLogs      ?? []).slice((auditPage - 1)          * PAGE_SIZE, auditPage          * PAGE_SIZE);

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
              <LowStockAlerts />
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
                      <th>Envío</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                      : pagedOrders.length === 0
                        ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay órdenes registradas.
                            </td>
                          </tr>
                        )
                        : pagedOrders.map((order) => (
                          <React.Fragment key={order._id}>
                          <tr>
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
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {order.status !== 'refunded' && (
                                  <button
                                    type="button"
                                    className="btn-outline"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    onClick={() => {
                                      if (managingOrderId === order._id) {
                                        setManagingOrderId(null);
                                        return;
                                      }
                                      setManagingOrderId(order._id);
                                      setShippingForm({
                                        status: (['processing', 'shipped', 'delivered'].includes(order.status) ? order.status : '') as '' | 'processing' | 'shipped' | 'delivered',
                                        carrier: order.carrier ?? '',
                                        trackingNumber: order.trackingNumber ?? '',
                                      });
                                    }}
                                  >
                                    {order.carrier || order.trackingNumber ? 'Editar envío' : 'Gestionar envío'}
                                  </button>
                                )}
                                {['paid', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                                  <button
                                    type="button"
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '0.75rem',
                                      border: '1px solid var(--line)',
                                      borderRadius: 'var(--radius-ui)',
                                      background: 'var(--white)',
                                      color: '#b3261e',
                                      cursor: refundOrderMutation.isPending ? 'not-allowed' : 'pointer',
                                      opacity: refundOrderMutation.isPending ? 0.6 : 1,
                                    }}
                                    disabled={refundOrderMutation.isPending}
                                    onClick={() => {
                                      const confirmed = window.confirm(`¿Reembolsar la orden por $${order.total_amount?.toFixed(2)}? Esta acción no se puede deshacer.`);
                                      if (!confirmed) return;
                                      refundOrderMutation.mutate(order._id, {
                                        onSuccess: () => setManagingOrderId((current) => (current === order._id ? null : current)),
                                      });
                                    }}
                                  >
                                    {refundOrderMutation.isPending ? 'Reembolsando…' : 'Reembolsar'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {managingOrderId === order._id && (
                            <tr>
                              <td colSpan={6} style={{ background: 'var(--gray-light)', padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <select
                                    className="input"
                                    value={shippingForm.status}
                                    onChange={(e) => setShippingForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}
                                  >
                                    <option value="">Sin cambio de estado</option>
                                    <option value="processing">En preparación</option>
                                    <option value="shipped">Enviado</option>
                                    <option value="delivered">Entregado</option>
                                  </select>
                                  <input
                                    className="input"
                                    placeholder="Transportista"
                                    value={shippingForm.carrier}
                                    onChange={(e) => setShippingForm((f) => ({ ...f, carrier: e.target.value }))}
                                  />
                                  <input
                                    className="input"
                                    placeholder="Numero de seguimiento"
                                    value={shippingForm.trackingNumber}
                                    onChange={(e) => setShippingForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                                  />
                                  <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={updateShippingMutation.isPending}
                                    onClick={() => {
                                      const data: { status?: 'processing' | 'shipped' | 'delivered'; carrier?: string; trackingNumber?: string } = {};
                                      if (shippingForm.status) data.status = shippingForm.status;
                                      if (shippingForm.carrier.trim()) data.carrier = shippingForm.carrier.trim();
                                      if (shippingForm.trackingNumber.trim()) data.trackingNumber = shippingForm.trackingNumber.trim();
                                      updateShippingMutation.mutate(
                                        { orderId: order._id, data },
                                        { onSuccess: () => setManagingOrderId(null) },
                                      );
                                    }}
                                  >
                                    {updateShippingMutation.isPending ? 'Guardando...' : 'Guardar'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
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
                              <select
                                className="admin-select"
                                value={w.technicianId || ''}
                                onChange={(e) => {
                                  const tech = technicians?.find((t) => t._id === e.target.value);
                                  if (tech) assignTechMutation.mutate({ id: w._id, technicianId: tech._id });
                                }}
                                disabled={assignTechMutation.isPending || w.status !== 'pending'}
                                style={{ minWidth: 140 }}
                              >
                                <option value="">Asignar técnico…</option>
                                {(technicians || []).map((t) => (
                                  <option key={t._id} value={t._id}>{t.name}</option>
                                ))}
                              </select>
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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techniciansLoading
                      ? Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                      : pagedTechnicians.length === 0
                        ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
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
                            <td className="actions">
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed = window.confirm(`¿Desactivar a ${tech.name}?`);
                                  if (!confirmed) return;
                                  deactivateTechnicianMutation.mutate(tech._id);
                                }}
                                disabled={deactivateTechnicianMutation.isPending}
                                style={{
                                  padding: '7px 12px',
                                  border: '1px solid var(--line)',
                                  borderRadius: 'var(--radius-ui)',
                                  background: 'var(--white)',
                                  color: 'var(--ink)',
                                  fontSize: '0.78rem',
                                  fontWeight: 500,
                                  fontFamily: 'var(--font-sans)',
                                  cursor: deactivateTechnicianMutation.isPending ? 'not-allowed' : 'pointer',
                                  opacity: deactivateTechnicianMutation.isPending ? 0.6 : 1,
                                }}
                                title={`Desactivar a ${tech.name}`}
                              >
                                {deactivateTechnicianMutation.isPending ? 'Desactivando…' : 'Desactivar'}
                              </button>
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

          {/* ══ CUPONES ══ */}
          {activeSection === 'coupons' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Cupones" count={coupons?.length} />
              <CouponForm
                onSubmit={(d) => couponMutation.mutate(d)}
                isPending={couponMutation.isPending}
              />
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descuento</th>
                      <th>Vigencia</th>
                      <th>Usos</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsLoading
                      ? Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                      : pagedCoupons.length === 0
                        ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay cupones registrados.
                            </td>
                          </tr>
                        )
                        : pagedCoupons.map((coupon) => (
                          <tr key={coupon._id}>
                            <td style={{ fontWeight: 600 }}>{coupon.code}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>
                              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toFixed(2)}`}
                            </td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.8rem' }}>
                              {formatDate(coupon.validFrom)} – {formatDate(coupon.validUntil)}
                            </td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>
                              {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                            </td>
                            <td>
                              <Badge variant={coupon.active ? 'success' : 'neutral'}>
                                {coupon.active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="actions">
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed = window.confirm(`¿Desactivar el cupón ${coupon.code}?`);
                                  if (!confirmed) return;
                                  deactivateCouponMutation.mutate(coupon._id);
                                }}
                                disabled={!coupon.active || deactivateCouponMutation.isPending}
                                style={{
                                  padding: '7px 12px',
                                  border: '1px solid var(--line)',
                                  borderRadius: 'var(--radius-ui)',
                                  background: 'var(--white)',
                                  color: 'var(--ink)',
                                  fontSize: '0.78rem',
                                  fontWeight: 500,
                                  fontFamily: 'var(--font-sans)',
                                  cursor: (!coupon.active || deactivateCouponMutation.isPending) ? 'not-allowed' : 'pointer',
                                  opacity: (!coupon.active || deactivateCouponMutation.isPending) ? 0.6 : 1,
                                }}
                                title={`Desactivar ${coupon.code}`}
                              >
                                {deactivateCouponMutation.isPending ? 'Desactivando…' : 'Desactivar'}
                              </button>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination total={coupons?.length ?? 0} page={couponsPage} onPage={setCouponsPage} />
              </div>
            </div>
          )}

          {/* ══ SOPORTE ══ */}
          {activeSection === 'support' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Tickets de soporte" count={supportTickets?.length} />
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Contacto</th>
                      <th>Estado</th>
                      <th className="actions">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTicketsLoading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)
                      : pagedSupportTickets.length === 0
                        ? (
                          <tr>
                            <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay tickets de soporte registrados.
                            </td>
                          </tr>
                        )
                        : pagedSupportTickets.map((ticket) => (
                          <tr key={ticket._id}>
                            <td style={{ fontWeight: 500 }}>{formatDate(ticket.createdAt)}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>{ticket.userId}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>{ticket.category}</td>
                            <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ticket.description}>
                              {ticket.description}
                            </td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>{ticket.contactChannel}</td>
                            <td>
                              <Badge variant={statusVariant[ticket.status] ?? 'neutral'}>
                                {statusLabel[ticket.status] ?? ticket.status}
                              </Badge>
                            </td>
                            <td className="actions">
                              <select
                                className="admin-select"
                                value={ticket.status}
                                onChange={(e) => updateTicketStatusMutation.mutate({ id: ticket._id, status: e.target.value as 'open' | 'in_review' | 'closed' })}
                                disabled={updateTicketStatusMutation.isPending}
                                style={{ minWidth: 140 }}
                              >
                                <option value="open">Abierto</option>
                                <option value="in_review">En revisión</option>
                                <option value="closed">Cerrado</option>
                              </select>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination total={supportTickets?.length ?? 0} page={supportPage} onPage={setSupportPage} />
              </div>
            </div>
          )}

          {/* ══ AUDITORÍA ══ */}
          {activeSection === 'audit' && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <SectionHeader title="Auditoría de acciones administrativas" count={auditLogs?.length} />
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Acción</th>
                      <th>Recurso</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogsLoading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                      : pagedAuditLogs.length === 0
                        ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.9rem' }}>
                              No hay acciones auditadas todavía.
                            </td>
                          </tr>
                        )
                        : pagedAuditLogs.map((log) => (
                          <tr key={log._id}>
                            <td style={{ fontWeight: 500 }}>{formatDate(log.createdAt)}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>{log.userId}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>{log.action}</td>
                            <td style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>{log.resourceType} · {log.resourceId}</td>
                            <td
                              style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink3)', fontSize: '0.8rem' }}
                              title={log.metadata ? JSON.stringify(log.metadata) : undefined}
                            >
                              {log.metadata ? JSON.stringify(log.metadata) : '—'}
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
                <Pagination total={auditLogs?.length ?? 0} page={auditPage} onPage={setAuditPage} />
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
