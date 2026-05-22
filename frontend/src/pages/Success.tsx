import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useCartStore } from '../store/cart.store';
import { ordersService } from '../services/orders.service';
import { Skeleton } from '../components/ui/Skeleton';
import type { Order } from '../types/order';

interface OrderItem {
  product: { name: string; image_urls?: string[]; price: number };
  quantity: number;
  price: number;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

export default function Success() {
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const { getToken } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (paymentIntentId) clearCart();
  }, [paymentIntentId, clearCart]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!paymentIntentId) { setLoading(false); return; }
      try {
        const token = await getToken();
        if (!token) throw new Error('No autenticado');
        const data = await ordersService.confirmPayment(paymentIntentId, token);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del pedido.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [paymentIntentId, getToken]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setDrawn(true), 120);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
    }}>
      {/* Barra superior de acento */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 3,
        background: 'var(--ink)',
        zIndex: 10,
      }} />

      <div style={{ width: '100%', maxWidth: 540 }}>

        {/* Check animado */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: drawn ? 'var(--ink)' : 'transparent',
            border: `1.5px solid ${drawn ? 'var(--ink)' : 'var(--line)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            transition: 'background 0.4s ease, border-color 0.4s ease',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={drawn ? '#F5F4F2' : 'var(--ink)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: drawn ? 0 : 100,
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
                }}
              />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            color: 'var(--ink)',
            lineHeight: 1.05,
            textAlign: 'center',
            marginBottom: '0.625rem',
          }}>
            Pago confirmado
          </h1>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            color: 'var(--ink2)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            Tu pedido fue procesado correctamente.
            Recibirás un correo con los detalles.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ background: 'var(--white)', border: '0.5px solid var(--line)', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <Skeleton variant="text" style={{ width: '50%', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: '1rem', marginBottom: 16 }}>
              <Skeleton style={{ width: 60, height: 60, borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" style={{ width: '70%', marginBottom: 8 }} />
                <Skeleton variant="text" style={{ width: '40%' }} />
              </div>
            </div>
            <Skeleton variant="text" style={{ width: '30%' }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Order details */}
        {order && (
          <div style={{
            background: 'var(--white)',
            border: '0.5px solid var(--line)',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: '1.5rem',
            animation: 'slideUpFade 0.4s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            {/* Order meta */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              padding: '1.125rem 1.375rem',
              borderBottom: '0.5px solid var(--line)',
              background: 'rgba(176,174,168,0.04)',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink3)', marginBottom: 4 }}>
                  Pedido
                </p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', fontWeight: 400, color: 'var(--ink)' }}>
                  #{order._id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink3)', marginBottom: 4 }}>
                  Fecha
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.825rem', color: 'var(--ink2)' }}>
                  {formatDate(order.createdAt as unknown as string)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '1.125rem 1.375rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink3)', marginBottom: '0.875rem' }}>
                Productos
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {(order.items as unknown as OrderItem[]).map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '0.875rem',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: '0.5px solid var(--line)',
                    borderRadius: 6,
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                      border: '0.5px solid var(--line)',
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: 'var(--cream)',
                    }}>
                      {item.product?.image_urls?.[0] ? (
                        <img
                          src={item.product.image_urls[0]}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--ink3)' }}>—</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.825rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product?.name}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--ink3)' }}>
                        ×{item.quantity}
                      </p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', fontWeight: 400, color: 'var(--ink)', flexShrink: 0 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '1rem 1.375rem',
              borderTop: '0.5px solid var(--line)',
              background: 'rgba(176,174,168,0.03)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink3)' }}>
                Total pagado
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.75rem', fontWeight: 400, color: 'var(--ink)' }}>
                ${order.total_amount?.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* CTAs */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Link
              to="/orders"
              className="btn-primary"
              style={{ textDecoration: 'none', textAlign: 'center', padding: '13px', fontSize: '0.825rem' }}
            >
              Ver mis pedidos
            </Link>
            <Link
              to="/home"
              className="btn-ghost"
              style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem' }}
            >
              Seguir comprando
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
