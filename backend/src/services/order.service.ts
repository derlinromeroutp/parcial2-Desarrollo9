import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';

export interface FinalizeResult {
  lockedOrder: any;
  stockWarnings: Array<{ productId: string; reason: string }>;
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
      return { lockedOrder, stockWarnings: [] };
    }

    const orderItemsQuery = OrderItem.find({ order_id: lockedOrder._id });
    const orderItems = session ? await orderItemsQuery.session(session) : await orderItemsQuery;
    const stockWarnings: Array<{ productId: string; reason: string }> = [];

    for (const item of orderItems) {
      const updateQuery = Product.updateOne(
        { _id: item.product_id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );
      const result = session ? await updateQuery.session(session) : await updateQuery;

      if (result.modifiedCount === 0) {
        stockWarnings.push({
          productId: String(item.product_id),
          reason: 'insufficient_stock_or_missing_product',
        });
      }
    }

    lockedOrder.status = 'paid';
    lockedOrder.payment_intent_id = paymentIntentId;
    if (session) {
      await lockedOrder.save({ session });
      await session.commitTransaction();
    } else {
      await lockedOrder.save();
    }

    return { lockedOrder, stockWarnings };
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
