import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import type { Product } from '../types/product';
import type { UpdateProductDTO } from '../services/products.service';
import { productsService } from '../services/products.service';
import ProductModal from './ProductModal';
import type { CreateProductDTO } from '../services/products.service';

const ProductStats: React.FC<{ products: Product[] | undefined }> = ({ products }) => {
  const total = products?.length ?? 0;
  const totalStock = products?.reduce((s, p) => s + p.stock, 0) ?? 0;
  const lowStock = products?.filter((p) => p.stock <= 5).length ?? 0;
  const outOfStock = products?.filter((p) => p.stock === 0).length ?? 0;

  const conditionCount = products?.reduce((acc, p) => {
    acc[p.condition] = (acc[p.condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const maxCondition = Math.max(...Object.values(conditionCount), 1);

  const stats = [
    { label: 'Total Productos', value: total, color: 'var(--ink)' },
    { label: 'Unidades en Stock', value: totalStock, color: 'var(--ink)' },
    { label: 'Stock Bajo', value: lowStock, color: '#D97706' },
    { label: 'Sin Stock', value: outOfStock, color: '#DC2626' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--line)',
              padding: '1.25rem',
            }}
          >
            <p style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              fontWeight: 300,
              color: stat.color,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
            }}>
              {stat.value}
            </p>
            <p style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--ink3)',
              fontFamily: 'var(--font-sans)',
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Condition chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
      }}>
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--line)',
          padding: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--ink3)',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-sans)',
          }}>
            Productos por Condición
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 100 }}>
            {[
              { label: 'A', key: 'A', color: 'var(--ink)' },
              { label: 'B', key: 'B', color: '#D97706' },
              { label: 'C', key: 'C', color: 'var(--ink3)' },
            ].map((cond) => {
              const v = conditionCount[cond.key] || 0;
              const h = maxCondition > 0 ? (v / maxCondition) * 100 : 0;
              return (
                <div key={cond.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${h}%`,
                      minHeight: 4,
                      background: cond.color,
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.6s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.55rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>Cond. {cond.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--line)',
          padding: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--ink3)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-sans)',
          }}>
            Estado del Inventario
          </p>
          {[
            { label: 'Con stock', value: total - outOfStock, color: 'var(--ink)', bg: 'var(--cream)' },
            { label: 'Sin stock', value: outOfStock, color: '#DC2626', bg: 'var(--error-light)' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', color: item.color, fontFamily: 'var(--font-sans)' }}>{item.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: item.color, fontFamily: 'var(--font-sans)' }}>{item.value}</span>
              </div>
              <div style={{ height: 6, background: item.bg, borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                    height: '100%',
                    background: item.color,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ProductTable() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const t = await getToken();
      if (!t) throw new Error('No token');
      return productsService.getAll(t);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      const t = await getToken();
      if (!t) throw new Error('No token');
      return productsService.create(data, t);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDTO }) => {
      const t = await getToken();
      if (!t) throw new Error('No token');
      return productsService.update(id, data, t);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const t = await getToken();
      if (!t) throw new Error('No token');
      return productsService.delete(id, t);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (data: CreateProductDTO | UpdateProductDTO) => {
    if (selectedProduct) {
      await updateMutation.mutateAsync({ id: selectedProduct._id, data });
    } else {
      await createMutation.mutateAsync(data as CreateProductDTO);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray)' }}>
        Cargando productos...
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <ProductStats products={products} />

      <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleOpenCreate}
          style={{
            padding: '10px 18px',
            background: 'var(--ink)',
            border: 'none',
            color: 'var(--white)',
            fontSize: '0.75rem',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Condición</th>
              <th className="actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((product) => (
              <tr key={product._id}>
                <td style={{ fontWeight: 500 }}>{product.name}</td>
                <td style={{ fontWeight: 500, fontFamily: 'var(--font-display)' }}>${product.price.toFixed(2)}</td>
                <td>
                  <span style={{ 
                    color: product.stock === 0 ? '#DC2626' : product.stock <= 5 ? '#D97706' : 'inherit', 
                    fontWeight: 500 
                  }}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    background: product.condition === 'A' ? 'var(--ink)' : product.condition === 'B' ? '#D97706' : 'var(--line)',
                    color: product.condition === 'C' ? 'var(--ink2)' : 'var(--white)',
                    borderRadius: '2px',
                  }}>
                    Cond. {product.condition}
                  </span>
                </td>
                <td className="actions">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleOpenEdit(product)}
                      title="Editar"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--ink2)',
                        padding: '4px',
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 20H5.25A2.25 2.25 0 0 1 3 17.75V8.75A2.25 2.25 0 0 1 5.25 6.5h9" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      title="Eliminar"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#DC2626',
                        padding: '4px',
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}