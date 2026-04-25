import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { warrantyService } from '../services/warranty.service';
import { useAuth } from '@clerk/clerk-react';

const warrantySchema = z.object({
  reason: z.string().min(1, 'Selecciona un motivo'),
  description: z.string()
    .min(10, 'Mínimo 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});

type WarrantyFormData = z.infer<typeof warrantySchema>;

const REASONS = [
  'Falla de fábrica',
  'Producto dañado en tránsito',
  'Error de software',
  'Problema de batería',
  'Otro',
];

const STEPS = ['Motivo', 'Descripción', 'Evidencias'];

const NewWarranty: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [step, setStep] = useState(0);
  const [stepKey, setStepKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<WarrantyFormData>({
    resolver: zodResolver(warrantySchema),
    mode: 'onChange',
  });

  const goToStep = (next: number) => {
    setStepKey((k) => k + 1);
    setStep(next);
  };

  const handleNext = async () => {
    const field = step === 0 ? 'reason' : 'description';
    const valid = await trigger(field as keyof WarrantyFormData);
    if (valid) goToStep(step + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
      setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: WarrantyFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No autenticado');

      let evidenceUrls: string[] = [];
      if (files.length > 0) {
        const results = await Promise.all(files.map((f) => warrantyService.uploadEvidence(f, token)));
        evidenceUrls = results.map((r) => r.url);
      }

      await warrantyService.createWarranty(
        { orderId: orderId!, reason: data.reason, description: data.description, evidenceUrls },
        token
      );

      navigate('/warranties/success');
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) {
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
          padding: '2.5rem',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Orden no especificada
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink2)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Selecciona un pedido desde "Mis Pedidos" para reportar una garantía.
          </p>
          <button onClick={() => navigate('/orders')} className="btn-primary" style={{ width: '100%' }}>
            Ver mis pedidos
          </button>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.68rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--ink3)',
            }}>
              Paso {step + 1} de {STEPS.length}
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: 'var(--ink2)',
            }}>
              {STEPS[step]}
            </p>
          </div>

          {/* Track */}
          <div style={{
            height: '2px',
            background: 'var(--line)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'var(--ink)',
              borderRadius: 2,
              width: `${progress}%`,
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.625rem' }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : i === STEPS.length - 1 ? 'flex-end' : 'center', gap: '4px' }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i <= step ? 'var(--ink)' : 'var(--line)',
                  transition: 'background 0.3s ease',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)',
          border: '0.5px solid var(--line)',
          borderRadius: 8,
          padding: '2.5rem',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              color: 'var(--ink)',
              lineHeight: 1.05,
              marginBottom: '0.375rem',
            }}>
              Reportar garantía
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.825rem', color: 'var(--ink2)' }}>
              Orden #{orderId?.slice(-8).toUpperCase()}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Paso 0 — Motivo */}
            {step === 0 && (
              <div key={`step-0-${stepKey}`} style={{ animation: 'slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="input-group">
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--ink3)',
                    marginBottom: 6,
                  }}>
                    ¿Cuál es el motivo del reclamo?
                  </label>
                  <select {...register('reason')} className="input">
                    <option value="">Selecciona una opción</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.reason && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={handleNext} className="btn-primary" style={{ padding: '11px 28px' }}>
                    Continuar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Paso 1 — Descripción */}
            {step === 1 && (
              <div key={`step-1-${stepKey}`} style={{ animation: 'slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div style={{
                  background: 'var(--cream)',
                  border: '0.5px solid var(--line)',
                  borderRadius: 6,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--ink2)',
                  fontFamily: 'var(--font-display)',
                }}>
                  <span style={{ color: 'var(--ink3)', marginRight: 6 }}>Motivo:</span>
                  {getValues('reason')}
                </div>

                <div className="input-group">
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--ink3)',
                    marginBottom: 6,
                  }}>
                    Describe el problema
                  </label>
                  <textarea
                    {...register('description')}
                    rows={5}
                    placeholder="Describe detalladamente qué sucede con el producto..."
                    className="input"
                    style={{ resize: 'vertical' }}
                  />
                  {errors.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => goToStep(0)} className="btn-ghost" style={{ fontSize: '0.78rem' }}>
                    ← Atrás
                  </button>
                  <button type="button" onClick={handleNext} className="btn-primary" style={{ padding: '11px 28px' }}>
                    Continuar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2 — Evidencias */}
            {step === 2 && (
              <div key={`step-2-${stepKey}`} style={{ animation: 'slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--ink3)',
                  marginBottom: 12,
                }}>
                  Evidencias <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                </p>

                {/* Upload area */}
                <label
                  htmlFor="evidence-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '2rem',
                    border: '0.5px dashed var(--line)',
                    borderRadius: 6,
                    background: 'var(--cream)',
                    cursor: 'pointer',
                    transition: 'border-color 0.25s ease',
                    marginBottom: previews.length > 0 ? '1.25rem' : '1.5rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ink3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--ink3)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--ink2)' }}>
                    Seleccionar imágenes
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--ink3)' }}>
                    JPG, PNG, hasta 5 archivos
                  </span>
                  <input
                    id="evidence-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Previews */}
                {previews.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                  }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', border: '0.5px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                        <img src={src} alt={`Evidencia ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--ink)',
                            color: 'var(--white)',
                            border: '1px solid var(--white)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => goToStep(1)} className="btn-ghost" style={{ fontSize: '0.78rem' }}>
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ padding: '11px 28px' }}
                  >
                    {isSubmitting ? 'Enviando…' : 'Enviar ticket'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Cancel */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="btn-ghost"
            style={{ fontSize: '0.78rem', color: 'var(--ink3)' }}
          >
            Cancelar y volver a pedidos
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewWarranty;
