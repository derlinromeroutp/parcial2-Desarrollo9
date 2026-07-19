import { PriceAlert } from '../models/PriceAlert';
import { User } from '../models/User';
import { isPriceAlertTriggered } from '../lib/priceAlerts';
import { sendPriceDropAlertEmail } from './email.service';

export const notifyPriceDrop = async (productId: unknown, productName: string, newPrice: number): Promise<void> => {
  const alerts = await PriceAlert.find({ product: productId, active: true, triggeredAt: null });

  for (const alert of alerts) {
    if (!isPriceAlertTriggered(alert.priceAtActivation, newPrice)) continue;

    alert.triggeredAt = new Date();
    await alert.save();

    const user = await User.findOne({ clerk_id: alert.userId });
    if (user?.email) {
      await sendPriceDropAlertEmail(user.email, {
        productName,
        oldPrice: alert.priceAtActivation,
        newPrice,
      });
    }
  }
};
