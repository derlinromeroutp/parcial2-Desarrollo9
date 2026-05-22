import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignInButton, useAuth } from '../lib/auth';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { checkoutService } from '../services/checkout.service';
import { ordersService } from '../services/orders.service';
import { useCartStore } from '../store/cart.store';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const isE2ETestMode = import.meta.env.VITE_E2E_TEST_MODE === 'true';

function extractPaymentIntentId(clientSecret: string): string | null {
  const match = clientSecret.match(/^(pi_[^_]+)_secret_/);
  return match?.[1] ?? null;
}

function CheckoutForm({ amount, clientSecret }: { amount: number; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    const { error: validationError } = await elements.submit();
    if (validationError) {
      setError(validationError.message || 'Revisa los datos de la tarjeta.');
      setIsSubmitting(false);
      return;
    }

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      const maybeRecoveredPiId = extractPaymentIntentId(clientSecret);
      if (
        maybeRecoveredPiId &&
        submitError.code === 'payment_intent_unexpected_state'
      ) {
        try {
          const token = await getToken();
          if (!token) throw new Error('No autenticado');
          await ordersService.confirmPayment(maybeRecoveredPiId, token);
          clearCart();
          navigate(`/success?payment_intent=${maybeRecoveredPiId}`);
          return;
        } catch (recoverError: any) {
          setError(
            recoverError?.response?.data?.error ||
            recoverError?.message ||
            'No pudimos recuperar el estado del pago.',
          );
          setIsSubmitting(false);
          return;
        }
      }

      const extraCode = submitError.code ? ` (${submitError.code})` : '';
      setError((submitError.message || 'No pudimos confirmar el pago.') + extraCode);
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent?.id) {
      setError('Stripe no retorno el identificador del pago.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      await ordersService.confirmPayment(paymentIntent.id, token);
      clearCart();
      navigate(`/success?payment_intent=${paymentIntent.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'El pago fue procesado, pero no pudimos confirmar el pedido.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PaymentElement />

      {error && <div className="alert alert-error">{error}</div>}

      <button
        className="btn-primary"
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
      >
        {isSubmitting ? 'Confirmando pago...' : `Pagar $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [serverAmount, setServerAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isConfirmingTestPayment, setIsConfirmingTestPayment] = useState(false);
  const createdSignatureRef = useRef<string | null>(null);

  const cartPayload = useMemo(
    () => items.map((item) => ({ productId: item._id, quantity: item.quantity })),
    [items],
  );

  const clientSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartSignature = cartPayload
    .map((item) => `${item.productId}:${item.quantity}`)
    .sort()
    .join('|');

  useEffect(() => {
    const createIntent = async () => {
      if (!isLoaded || !isSignedIn || cartPayload.length === 0 || !cartSignature) return;
      if (createdSignatureRef.current === cartSignature) return;

      createdSignatureRef.current = cartSignature;
      setIsCreatingIntent(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error('No autenticado');
        const response = await checkoutService.createPaymentIntent(cartPayload, token);
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId ?? null);
        setServerAmount(response.amount);
      } catch (err: any) {
        createdSignatureRef.current = null;
        setError(err.message || 'No pudimos preparar el pago.');
      } finally {
        setIsCreatingIntent(false);
      }
    };

    createIntent();
  }, [cartPayload, cartSignature, getToken, isLoaded, isSignedIn]);

  const handleTestPayment = async () => {
    if (!paymentIntentId) return;

    setIsConfirmingTestPayment(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      await ordersService.confirmPayment(paymentIntentId, token);
      clearCart();
      navigate(`/success?payment_intent=${paymentIntentId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No pudimos confirmar el pago de prueba.');
      setIsConfirmingTestPayment(false);
      return;
    }

    setIsConfirmingTestPayment(false);
  };

  if (!isE2ETestMode && (!stripePublishableKey || !stripePromise)) {
    return (
      <div className="op-root">
        <main className="op-body">
          <div className="page-container">
            <div className="op-empty">
              <h3>Stripe no esta configurado</h3>
              <p>Falta definir VITE_STRIPE_PUBLISHABLE_KEY en frontend/.env.local.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="op-root">
        <main className="op-body">
          <div className="page-container">
            <div className="op-empty">
              <h3>Preparando checkout</h3>
              <p>Validando tu sesion antes de mostrar el formulario de pago.</p>
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
              <h3>Debes iniciar sesion para pagar</h3>
              <p>Tu carrito se mantiene guardado mientras accedes a tu cuenta.</p>
              <SignInButton mode="modal">
                <button className="op-cta">Iniciar sesion</button>
              </SignInButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="op-root">
        <main className="op-body">
          <div className="page-container">
            <div className="op-empty">
              <h3>Tu carrito esta vacio</h3>
              <p>Agrega productos antes de iniciar un pago.</p>
              <Link to="/home" className="op-cta">Ir a la tienda</Link>
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
            <p className="op-eyebrow">Pago seguro dentro de SafeTech</p>
            <h1 className="op-title">
              Finalizar<br />
              <em>compra</em>
            </h1>
          </div>
        </div>
      </header>

      <main className="op-body">
        <div className="page-container checkout-grid">
          <section className="oc-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>
              Datos de pago
            </h2>

            {isCreatingIntent && <p style={{ color: 'var(--ink2)' }}>Preparando formulario de pago...</p>}
            {error && <div className="alert alert-error">{error}</div>}

            {isE2ETestMode && paymentIntentId && serverAmount !== null && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="alert alert-success">
                  Modo de prueba activo. El pago se confirma localmente sin usar Stripe.
                </div>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={handleTestPayment}
                  disabled={isConfirmingTestPayment}
                  data-testid="test-payment-button"
                  style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
                >
                  {isConfirmingTestPayment ? 'Confirmando pago...' : `Confirmar pago de prueba por $${serverAmount.toFixed(2)}`}
                </button>
              </div>
            )}

            {!isE2ETestMode && clientSecret && serverAmount !== null && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#171614',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <CheckoutForm amount={serverAmount} clientSecret={clientSecret} />
              </Elements>
            )}
          </section>

          <aside className="oc-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>
              Resumen
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--line)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total</strong>
              <strong>${(serverAmount ?? clientSubtotal).toFixed(2)}</strong>
            </div>
            <p style={{ marginTop: '0.75rem', color: 'var(--ink2)', fontSize: '0.78rem', lineHeight: 1.5 }}>
              El total final se recalcula en el servidor con precios y stock actuales.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
