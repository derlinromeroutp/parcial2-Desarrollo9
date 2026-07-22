import { Context } from 'hono';
import { WarrantyReport } from '../models/WarrantyReport';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Technician } from '../models/Technician';
import { sendWarrantyCreatedEmail, sendWarrantyStatusChangedEmail } from '../services/email.service';
import { recordAuditLog } from '../services/audit.service';

export const createWarrantyReport = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { orderId, reason, description, evidenceUrls } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'Unauthorized: User ID not found in context' }, 401);
    }

    if (!orderId || !reason || !description) {
      return c.json({ error: 'Missing required fields: orderId, reason, description' }, 400);
    }

    // 1. Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    // 2. Validar propiedad de la orden (Preventivo de Fraude)
    if (order.userId !== userId) {
      return c.json({ error: 'No autorizado: La orden no pertenece a este usuario' }, 403);
    }

    // 3. Verificar que no exista ya una garantía para esta orden
    const existing = await WarrantyReport.findOne({ orderId, userId });
    if (existing) {
      return c.json({ error: 'Ya registraste una garantía para esta orden' }, 409);
    }

    // 4. Validar plazo legal de 90 días
    const createdAt = (order as any).createdAt;
    const diffInMs = Date.now() - createdAt.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays > 90) {
      return c.json({ error: 'Garantía Expirada. Plazo Legal agotado' }, 400);
    }

    // 5. Crear el reporte con reason como parte de description
    const fullDescription = `[${reason}] ${description}`;
    const report = new WarrantyReport({
      orderId,
      userId,
      description: fullDescription,
      evidenceUrls: evidenceUrls || [],
      status: 'pending'
    });

    await report.save();

    const reporter = await User.findOne({ clerk_id: userId });
    if (reporter?.email) {
      await sendWarrantyCreatedEmail(reporter.email, report);
    }

    return c.json({
      ticketId: report._id,
      status: report.status
    }, 201);
  } catch (error: any) {
    console.error('[Warranty Error]:', error);
    return c.json({ error: error.message }, 400);
  }
};

export const getMyWarranties = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const reports = await WarrantyReport.find({ userId }).populate('orderId');
    return c.json(reports);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getAllWarranties = async (c: Context) => {
  try {
    // Busca todos y populea userDoc (virtual field del clerk_id) y orderId
    const reports = await WarrantyReport.find({})
      .populate('userDoc', 'email role')
      .populate('orderId')
      .exec();
    return c.json(reports);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateWarrantyStatus = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const adminUserId = c.get('userId');

    const report = await WarrantyReport.findById(id);

    if (!report) return c.json({ error: 'Report not found' }, 404);

    let statusChanged = false;
    if (body.status) {
      const previousStatus = report.status;
      report.status = body.status;
      statusChanged = previousStatus !== body.status;
      if (body.status === 'resolved' && (previousStatus !== 'resolved' || !report.resolvedAt)) {
        report.resolvedAt = new Date();
      } else if (body.status !== 'resolved') {
        report.resolvedAt = undefined;
      }
    }

    if (body.repairNotes !== undefined) {
      report.repairNotes = body.repairNotes;
    }

    await report.save();

    if (statusChanged) {
      const owner = await User.findOne({ clerk_id: report.userId });
      if (owner?.email) {
        await sendWarrantyStatusChangedEmail(owner.email, report);
      }
    }

    await recordAuditLog({
      userId: adminUserId ?? 'system',
      action: 'warranty.status_change',
      resourceType: 'WarrantyReport',
      resourceId: id,
      metadata: { status: report.status, repairNotes: body.repairNotes },
    });

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const assignTechnician = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { technicianId, technicianName } = await c.req.json();

    if (!technicianId) {
      return c.json({ error: 'Missing technicianId' }, 400);
    }

    const technician = await Technician.findById(technicianId);

    if (!technician) {
      return c.json({ error: 'Technician not found' }, 404);
    }

    if (technician.active !== true) {
      return c.json({ error: 'Technician is inactive' }, 409);
    }

    const resolvedTechnicianName = technician.name || technicianName;

    const previous = await WarrantyReport.findById(id);
    if (!previous) return c.json({ error: 'Report not found' }, 404);
    const statusChanged = previous.status !== 'review';

    const report = await WarrantyReport.findByIdAndUpdate(
      id,
      {
        technicianId,
        technicianName: resolvedTechnicianName,
        status: 'review',
        resolvedAt: undefined
      },
      { new: true }
    );

    if (!report) return c.json({ error: 'Report not found' }, 404);

    if (statusChanged) {
      const owner = await User.findOne({ clerk_id: report.userId });
      if (owner?.email) {
        await sendWarrantyStatusChangedEmail(owner.email, report);
      }
    }

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const getAssignedWarranties = async (c: Context) => {
  try {
    const technicianDocId = c.get('technicianDocId');
    const reports = await WarrantyReport.find({ technicianId: technicianDocId })
      .populate('orderId')
      .exec();
    return c.json(reports);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const technicianUpdateWarranty = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const technicianDocId = c.get('technicianDocId');
    const body = await c.req.json();

    const report = await WarrantyReport.findById(id);
    if (!report) return c.json({ error: 'Report not found' }, 404);
    if (report.technicianId !== technicianDocId) {
      return c.json({ error: 'Forbidden: This ticket is not assigned to you' }, 403);
    }

    const allowedStatuses = ['review', 'resolved', 'rejected', 'refunded'];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    let statusChanged = false;
    if (body.status) {
      const previousStatus = report.status;
      report.status = body.status;
      statusChanged = previousStatus !== body.status;
      if (body.status === 'resolved' && (previousStatus !== 'resolved' || !report.resolvedAt)) {
        report.resolvedAt = new Date();
      } else if (body.status !== 'resolved') {
        report.resolvedAt = undefined;
      }
    }
    if (body.repairNotes !== undefined) report.repairNotes = body.repairNotes;
    await report.save();

    if (statusChanged) {
      const owner = await User.findOne({ clerk_id: report.userId });
      if (owner?.email) {
        await sendWarrantyStatusChangedEmail(owner.email, report);
      }
    }

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
