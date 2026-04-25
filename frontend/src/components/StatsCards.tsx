import { useEffect, useRef, useState } from 'react';
import type { Order } from '../types/order';
import type { IWarranty } from '../types/warranty';

interface StatsCardsProps {
  orders: Order[] | undefined;
  warranties: IWarranty[] | undefined;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'ink' | 'accent' | 'muted';
  delay: number;
  trigger: boolean;
}> = ({ label, value, icon, color = 'ink', delay, trigger }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => setVisible(true), delay * 100);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  const cardColor = color === 'ink' ? 'var(--ink)' : color === 'accent' ? 'var(--line)' : 'var(--white)';
  const textColor = color === 'ink' ? 'var(--white)' : color === 'accent' ? 'var(--ink)' : 'var(--ink)';
  const labelColor = color === 'ink' ? 'rgba(255,255,255,0.5)' : 'var(--ink3)';
  const iconColor = color === 'ink' ? 'rgba(255,255,255,0.6)' : color === 'accent' ? 'var(--ink)' : 'var(--ink)';

  return (
    <div ref={ref} style={{ background: cardColor, border: `1px solid ${color === 'ink' ? 'var(--ink)' : 'var(--line)'}`, padding: '1.5rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}>
      <div style={{ color: iconColor, marginBottom: '0.75rem' }}>{icon}</div>
      <div>
        <p style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 300, color: textColor, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.375rem' }}>{value}</p>
        <p style={{ fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: labelColor, fontFamily: 'var(--font-sans)' }}>{label}</p>
      </div>
    </div>
  );
};

const OrdersDonut: React.FC<{ orders: Order[] | undefined; trigger: boolean }> = ({ orders, trigger }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!trigger) return; const t = setTimeout(() => setVisible(true), 600); return () => clearTimeout(t); }, [trigger]);

  const statusCounts = orders?.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>) || {};
  const total = orders?.length || 1;
  const statuses = [
    { label: 'Pagadas', key: 'paid', color: 'var(--ink)' },
    { label: 'Pendientes', key: 'pending', color: '#D97706' },
    { label: 'Canceladas', key: 'cancelled', color: '#DC2626' },
  ];

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', padding: '1.5rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>Estado de Órdenes</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            {statuses.map((s) => {
              const count = statusCounts[s.key] || 0;
              const percent = count / total;
              const dash = percent * circumference;
              const currentOffset = offset;
              offset += dash;
              return <circle key={s.key} cx="40" cy="40" r={radius} fill="none" stroke={s.color} strokeWidth="10" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-currentOffset} />;
            })}
            <circle cx="40" cy="40" r={radius - 8} fill="var(--white)" />
          </svg>
          <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{total}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {statuses.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 6, height: 6, background: s.color, borderRadius: '1px' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>{s.label}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--ink)', marginLeft: 'auto', fontFamily: 'var(--font-sans)' }}>{statusCounts[s.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WarrantyProgress: React.FC<{ warranties: IWarranty[] | undefined; trigger: boolean }> = ({ warranties, trigger }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!trigger) return; const t = setTimeout(() => setVisible(true), 700); return () => clearTimeout(t); }, [trigger]);

  const statusCounts = warranties?.reduce((acc, w) => { acc[w.status] = (acc[w.status] || 0) + 1; return acc; }, {} as Record<string, number>) || {};
  const total = warranties?.length || 1;
  const statuses = [
    { label: 'Pendientes', key: 'pending', color: '#D97706' },
    { label: 'En Revisión', key: 'review', color: '#2563EB' },
    { label: 'Resueltas', key: 'resolved', color: 'var(--ink)' },
    { label: 'Rechazadas', key: 'rejected', color: '#DC2626' },
  ];

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', padding: '1.5rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>Garantías</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {statuses.map(s => {
          const count = statusCounts[s.key] || 0;
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={s.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>{s.label}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: s.color, fontFamily: 'var(--font-sans)' }}>{count}</span>
              </div>
              <div style={{ height: 5, background: 'var(--cream)', borderRadius: '1px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', background: s.color, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; subtext?: string; color?: string; delay: number; trigger: boolean }> = ({ label, value, subtext, color = 'var(--ink)', delay, trigger }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!trigger) return; const t = setTimeout(() => setVisible(true), delay * 100); return () => clearTimeout(t); }, [trigger, delay]);

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', padding: '1.25rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
      <p style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: 300, color: color, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '0.125rem' }}>{value}</p>
      <p style={{ fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ink3)', fontFamily: 'var(--font-sans)' }}>{label}</p>
      {subtext && <p style={{ fontSize: '0.55rem', color: 'var(--gray)', marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>{subtext}</p>}
    </div>
  );
};

const RecentOrdersList: React.FC<{ orders: Order[] | undefined; trigger: boolean }> = ({ orders, trigger }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!trigger) return; const t = setTimeout(() => setVisible(true), 800); return () => clearTimeout(t); }, [trigger]);

  const recent = orders?.slice(0, 5) ?? [];

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', padding: '1.5rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)', marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>Últimas Órdenes</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {recent.map((o, i) => (
          <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.625rem', borderBottom: i < recent.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>{o.userId?.slice(0, 10)}...</p>
              <p style={{ fontSize: '0.55rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>{new Date(o.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>${o.total_amount?.toFixed(2)}</p>
          </div>
        ))}
        {recent.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--gray)', textAlign: 'center' }}>Sin órdenes</p>}
      </div>
    </div>
  );
};

export default function StatsCards({ orders, warranties }: StatsCardsProps) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTriggered(true); }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const totalOrders = orders?.length ?? 0;
  const paidOrders = orders?.filter((o) => o.status === 'paid').length ?? 0;
  const totalRevenue = orders?.reduce((s, o) => s + (o.total_amount || 0), 0) ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length ?? 0;
  const openTickets = warranties?.filter((w) => w.status === 'pending').length ?? 0;
  const totalWarranties = warranties?.length ?? 0;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <StatCard label="Total Órdenes" value={totalOrders} color="ink" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>} delay={0} trigger={triggered} />
        <StatCard label="Pagadas" value={paidOrders} color="muted" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} delay={1} trigger={triggered} />
        <StatCard label="Tickets Abiertos" value={openTickets} color="muted" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>} delay={2} trigger={triggered} />
        <StatCard label="Garantías" value={totalWarranties} color="muted" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>} delay={3} trigger={triggered} />
      </div>

      {/* Revenue & metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
        <MetricCard label="Ingresos Totales" value={`$${totalRevenue.toLocaleString()}`} subtext={`${pendingOrders} pendientes`} color="var(--ink)" delay={4} trigger={triggered} />
        <OrdersDonut orders={orders} trigger={triggered} />
        <WarrantyProgress warranties={warranties} trigger={triggered} />
      </div>

      {/* Recent orders */}
      <RecentOrdersList orders={orders} trigger={triggered} />
    </div>
  );
}