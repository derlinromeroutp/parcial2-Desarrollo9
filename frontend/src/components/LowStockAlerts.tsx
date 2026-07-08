import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { productsService } from '../services/products.service';

const LOW_STOCK_THRESHOLD = 5;

export default function LowStockAlerts() {
  const { getToken, isLoaded } = useAuth();

  const { data } = useQuery({
    queryKey: ['admin-low-stock', LOW_STOCK_THRESHOLD],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return productsService.getLowStock(token, LOW_STOCK_THRESHOLD);
    },
    enabled: isLoaded,
  });

  const products = data?.data ?? [];
  if (products.length === 0) return null;

  return (
    <div
      role="alert"
      style={{
        background: '#FEF3C7',
        border: '1px solid #D97706',
        borderRadius: 'var(--radius-ui, 4px)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400E', fontFamily: 'var(--font-sans)' }}>
        ⚠ {products.length} producto{products.length !== 1 ? 's' : ''} con stock bajo (≤ {data?.threshold ?? LOW_STOCK_THRESHOLD} unidades)
      </p>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {products.map((p) => (
          <li
            key={p._id}
            style={{
              fontSize: '0.72rem',
              color: '#92400E',
              background: 'rgba(217,119,6,0.12)',
              borderRadius: '2px',
              padding: '3px 8px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {p.name} · {p.stock} en stock
          </li>
        ))}
      </ul>
    </div>
  );
}
