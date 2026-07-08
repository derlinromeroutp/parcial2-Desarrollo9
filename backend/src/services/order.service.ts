import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { sendPurchaseConfirmationEmail } from './email.service';
import { recordInventoryMovement } from './inventory.service';

export interface FinalizeResult {
  lockedOrder: any;
  stockWarnings: Array<{ productId: string; reason: string }>;
  wasAlreadyPaid: boolean;
}

export const finalizePaidOrder = async (
  userId: string,
  orderId: string,
  paymentIntentId: string,
  withTransaction: boolean,
): Promise<FinalizeResult> => {
  const session = withTransaction ? await mongoose.startSession() : null;

  try {
    if (session) {
      session.startTransaction();
    }

    const lockedOrderQuery = Order.findOne({ _id: orderId, userId });
    const lockedOrder = session ? await lockedOrderQuery.session(session) : await lockedOrderQuery;

    if (!lockedOrder) {
      throw new Error('Order not found during confirmation');
    }

    if (lockedOrder.status === 'paid') {
      if (session) {
        await session.commitTransaction();
      }
      return { lockedOrder, stockWarnings: [], wasAlreadyPaid: true };
    }

    const orderItemsQuery = OrderItem.find({ order_id: lockedOrder._id });
    const orderItems = session ? await orderItemsQuery.session(session) : await orderItemsQuery;
    const stockWarnings: Array<{ productId: string; reason: string }> = [];

    for (const item of orderItems) {
      const updateQuery = Product.findOneAndUpdate(
        { _id: item.product_id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      const updatedProduct = session ? await updateQuery.session(session) : await updateQuery;

      if (!updatedProduct) {
        stockWarnings.push({
          productId: String(item.product_id),
          reason: 'insufficient_stock_or_missing_product',
        });
        continue;
      }

      await recordInventoryMovement({
        productId: item.product_id,
        type: 'sale',
        previousStock: updatedProduct.stock + item.quantity,
        newStock: updatedProduct.stock,
        reason: `Venta confirmada (orden #${String(lockedOrder._id).slice(-6)})`,
        performedBy: userId,
        session: session ?? undefined,
      });
    }

    lockedOrder.status = 'paid';
    lockedOrder.payment_intent_id = paymentIntentId;
    if (session) {
      await lockedOrder.save({ session });
      await session.commitTransaction();
    } else {
      await lockedOrder.save();
    }

    return { lockedOrder, stockWarnings, wasAlreadyPaid: false };
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // no-op
      }
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const notifyPurchaseConfirmed = async (userId: string, order: { _id: unknown; total_amount: number }) => {
  // Se llama despues de que la transaccion de pago ya se confirmo (fuera del
  // try/catch de finalizePaidOrder): un fallo aca no debe revertir un pago
  // ya procesado ni devolver 500 sobre una orden que en realidad quedo paga.
  try {
    const user = await User.findOne({ clerk_id: userId });
    if (user?.email) {
      await sendPurchaseConfirmationEmail(user.email, order);
    }
  } catch (error) {
    console.error('[Order] Error al enviar el correo de confirmacion de compra:', error);
  }
};
