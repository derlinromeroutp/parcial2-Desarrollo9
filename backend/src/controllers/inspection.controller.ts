import { Context } from 'hono';
import mongoose from 'mongoose';
import { InspectionReport } from '../models/InspectionReport';
import { Product } from '../models/Product';
import { Technician } from '../models/Technician';

export const getProductInspection = async (c: Context) => {
  try {
    const productId = c.req.param('id');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return c.json({ success: false, message: 'ID de producto invalido' }, 400);
    }

    // Sin ficha registrada: se responde 200 con data: null, no un error, para
    // que el frontend muestre un estado informativo (criterio de HU-46).
    const report = await InspectionReport.findOne({ product: productId });

    return c.json({ success: true, data: report });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const upsertProductInspection = async (c: Context) => {
  try {
    const productId = c.req.param('id');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return c.json({ success: false, message: 'ID de producto invalido' }, 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return c.json({ success: false, message: 'Producto no encontrado' }, 404);
    }

    const { checklist } = c.req.valid('json' as any) as {
      checklist: { aspect: string; result: string; passed: boolean }[];
    };

    const technicianDocId = c.get('technicianDocId');
    const technician = technicianDocId ? await Technician.findById(technicianDocId) : null;

    const report = await InspectionReport.findOneAndUpdate(
      { product: productId },
      {
        checklist,
        technicianId: technicianDocId,
        technicianName: technician?.name,
        inspectedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return c.json({ success: true, data: report });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};
