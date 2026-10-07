import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import {
  VehicleModel,
  VehicleDocumentModel,
  DriverModel,
  DriverDocumentModel,
  ExceptionModel,
} from '../../../database/models';

/**
 * Step 010 [check]: Performs statutory compliance verification on Vehicle & Driver
 * prior to dispatching a trip. If expired, raises an Exception in the control tower.
 */
export const checkDispatchComplianceStep: OpStep = {
  file: 'dispatch/010-check-dispatch-compliance.ts',
  number: 10,
  phase: 'check',
  async run(c: OpContext) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Vehicle Compliance Check
    if (c.data.vehicleId) {
      const vehicleDocs = await VehicleDocumentModel.findAll({
        where: { vehicleId: c.data.vehicleId },
        transaction: c.t,
      });

      for (const doc of vehicleDocs) {
        if (doc.expiryDate && new Date(doc.expiryDate) < today) {
          await ExceptionModel.create(
            {
              organizationId: c.organizationId,
              branchId: c.data.branchId || c.user.branchId || null,
              type: 'compliance',
              severity: 'high',
              title: `Expired ${doc.documentType} on Vehicle #${c.data.vehicleId}`,
              detail: `Document ${doc.documentNumber} expired on ${new Date(doc.expiryDate).toISOString().split('T')[0]}`,
              refType: 'Vehicle',
              refId: 0,
              occurredOn: todayStr,
            },
            { transaction: c.t },
          );

          c.issues.warn(
            'VEHICLE_DOCUMENT_EXPIRED',
            `Vehicle ${doc.documentType} expired on ${new Date(doc.expiryDate).toISOString().split('T')[0]}. Compliance exception logged.`,
          );
        }
      }
    }

    // 2. Driver License Check
    if (c.data.driverId) {
      const driverDocs = await DriverDocumentModel.findAll({
        where: { driverId: c.data.driverId },
        transaction: c.t,
      });

      for (const doc of driverDocs) {
        if (doc.expiryDate && new Date(doc.expiryDate) < today) {
          await ExceptionModel.create(
            {
              organizationId: c.organizationId,
              branchId: c.data.branchId || c.user.branchId || null,
              type: 'compliance',
              severity: 'high',
              title: `Driver license/document expired on Driver #${c.data.driverId}`,
              detail: `${doc.documentType} expired on ${new Date(doc.expiryDate).toISOString().split('T')[0]}`,
              refType: 'Driver',
              refId: 0,
              occurredOn: todayStr,
            },
            { transaction: c.t },
          );

          c.issues.warn(
            'DRIVER_DOCUMENT_EXPIRED',
            `Driver ${doc.documentType} expired. Compliance exception logged.`,
          );
        }
      }
    }
  },
};
