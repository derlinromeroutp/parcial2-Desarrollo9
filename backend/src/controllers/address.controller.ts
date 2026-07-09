import { Context } from 'hono';
import { Address } from '../models/Address';

export const getMyAddresses = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    return c.json({ success: true, data: addresses });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const createAddress = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const data = c.req.valid('json' as any) as Record<string, unknown>;

    if (data.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({ ...data, userId });
    return c.json({ success: true, data: address }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const updateAddress = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const data = c.req.valid('json' as any) as Record<string, unknown>;

    const address = await Address.findOne({ _id: id, userId });
    if (!address) {
      return c.json({ success: false, message: 'Direccion no encontrada' }, 404);
    }

    if (data.isDefault) {
      await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, data);
    await address.save();

    return c.json({ success: true, data: address });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

export const deleteAddress = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');

    const deleted = await Address.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return c.json({ success: false, message: 'Direccion no encontrada' }, 404);
    }

    return c.json({ success: true, message: 'Direccion eliminada correctamente' });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};
