import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const WarrantySuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [drawn, setDrawn] = useState(false);

  const ticketId = searchParams.get('ticketId') || searchParams.get('id');

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'var(--white)',
        border: '0.5px solid var(--line)',
        borderRadius: 8,
        padding: '3.5rem 3rem',
        width: '100%',
        maxWidth: 440,
        textAlign: 'center',
        animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>

        {/* Check animado */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: `0.5px solid ${drawn ? 'var(--ink)' : 'var(--line)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.4s ease',
          }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(2rem, 5vw, 2.75rem)',
          color: 'var(--ink)',
          lineHeight: 1.05,
          marginBottom: '0.75rem',
        }}>
          Ticket creado
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.875rem',
          fontWeight: 400,
          color: 'var(--ink2)',
          lineHeight: 1.65,
          marginBottom: ticketId ? '1.75rem' : '2.5rem',
        }}>
          Tu reporte de garantía fue enviado con éxito.
          Revisaremos las evidencias y te contactaremos pronto.
        </p>

        {/* Ticket ID */}
        {ticketId && (
          <div style={{
            background: 'var(--cream)',
            border: '0.5px solid var(--line)',
            borderRadius: 6,
            padding: '1rem 1.5rem',
            marginBottom: '2.5rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.62rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--ink3)',
              marginBottom: '0.375rem',
            }}>
              Número de ticket
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '1.75rem',
              fontWeight: 400,
              color: 'var(--ink)',
              lineHeight: 1,
            }}>
              #{ticketId}
            </p>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--line)', marginBottom: '1.5rem' }} />

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '0.825rem' }}
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => navigate('/home')}
            className="btn-ghost"
            style={{ width: '100%', fontSize: '0.8rem' }}
          >
            Seguir comprando
          </button>
        </div>

      </div>
    </div>
  );
};

export default WarrantySuccess;
