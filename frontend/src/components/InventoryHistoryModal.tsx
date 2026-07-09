import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { productsService } from '../services/products.service';

interface InventoryHistoryModalProps {
  productId: string | null;
  productName?: string;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  restock: 'Alta / reposición',
  manual_adjustment: 'Ajuste manual',
  sale: 'Venta',
};

export default function InventoryHistoryModal({ productId, productName, onClose }: InventoryHistoryModalProps) {
  const { getToken } = useAuth();

  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements', productId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return productsService.getInventoryMovements(productId as string, token);
    },
    enabled: Boolean(productId),
  });

  if (!productId) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--white)', width: 'min(560px, 92vw)', maxHeight: '80vh', overflowY: 'auto', borderRadius: 'var(--radius-md, 8px)', padding: '1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 500 }}>
            Historial de inventario{productName ? ` — ${productName}` : ''}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }} aria-label="Cerrar">
            ×
          </button>
        </div>

        {isLoading && <p style={{ color: 'var(--gray)' }}>Cargando movimientos...</p>}

        {!isLoading && (movements?.length ?? 0) === 0 && (
          <p style={{ color: 'var(--gray)' }}>Sin movimientos registrados para este producto.</p>
        )}

        {!isLoading && movements && movements.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {movements.map((m) => (
              <div key={m._id} style={{ border: '1px solid var(--line)', borderRadius: '4px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>{TYPE_LABEL[m.type] ?? m.type}</span>
                  <span style={{ color: m.quantityChange >= 0 ? '#059669' : '#DC2626' }}>
                    {m.quantityChange >= 0 ? '+' : ''}{m.quantityChange}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink2)', margin: '0.25rem 0' }}>{m.reason}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--gray)' }}>
                  {m.previousStock} → {m.newStock} unidades · {m.performedBy} · {new Date(m.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
