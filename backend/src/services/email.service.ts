import { isE2ETestMode } from '../lib/e2e';

export interface SentEmail {
  to: string;
  subject: string;
  html: string;
  sentAt: string;
}

// Captura en memoria de los correos "enviados" durante E2E_TEST_MODE, para
// poder verificarlos desde los tests sin depender de un proveedor real.
const sentEmails: SentEmail[] = [];

export function getSentEmails(): SentEmail[] {
  return sentEmails;
}

export function clearSentEmails(): void {
  sentEmails.length = 0;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const message: SentEmail = { to, subject, html, sentAt: new Date().toISOString() };

  if (isE2ETestMode) {
    sentEmails.push(message);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'SafeTech <no-reply@safetech.test>';

  if (!apiKey) {
    console.log(`[Email] Sin proveedor configurado (falta RESEND_API_KEY) — Para: ${to} | Asunto: ${subject}`);
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      console.error('[Email] Error al enviar via Resend:', response.status, await response.text());
    }
  } catch (error) {
    console.error('[Email] Error al enviar via Resend:', error);
  }
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  failed: 'Fallido',
};

const WARRANTY_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  review: 'En revisión',
  resolved: 'Resuelto',
  rejected: 'Rechazado',
  refunded: 'Reembolsado',
};

export async function sendPurchaseConfirmationEmail(to: string, order: { _id: unknown; total_amount: number }): Promise<void> {
  await sendEmail(
    to,
    `Confirmamos tu compra en SafeTech (#${String(order._id).slice(-6)})`,
    `<p>Tu pago fue confirmado.</p><p>Orden: <strong>#${String(order._id).slice(-6)}</strong></p><p>Total: <strong>$${order.total_amount.toFixed(2)}</strong></p>`,
  );
}

export async function sendOrderStatusChangedEmail(
  to: string,
  order: { _id: unknown; status: string },
): Promise<void> {
  const label = ORDER_STATUS_LABEL[order.status] ?? order.status;
  await sendEmail(
    to,
    `Actualizacion de tu pedido SafeTech (#${String(order._id).slice(-6)})`,
    `<p>El estado de tu pedido <strong>#${String(order._id).slice(-6)}</strong> cambio a: <strong>${label}</strong>.</p>`,
  );
}

export async function sendWarrantyCreatedEmail(to: string, warranty: { _id: unknown }): Promise<void> {
  await sendEmail(
    to,
    `Recibimos tu reclamo de garantia (#${String(warranty._id).slice(-6)})`,
    `<p>Registramos tu reclamo de garantia <strong>#${String(warranty._id).slice(-6)}</strong>. Te avisaremos por correo ante cualquier actualizacion.</p>`,
  );
}

export async function sendWarrantyStatusChangedEmail(
  to: string,
  warranty: { _id: unknown; status: string },
): Promise<void> {
  const label = WARRANTY_STATUS_LABEL[warranty.status] ?? warranty.status;
  await sendEmail(
    to,
    `Actualizacion de tu garantia SafeTech (#${String(warranty._id).slice(-6)})`,
    `<p>El estado de tu garantia <strong>#${String(warranty._id).slice(-6)}</strong> cambio a: <strong>${label}</strong>.</p>`,
  );
}
