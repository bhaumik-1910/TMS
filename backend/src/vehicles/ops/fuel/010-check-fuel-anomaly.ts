import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { PeriodLockService } from '../../../foundation/period-locks/period-lock.service';
import { ExceptionModel } from '../../../database/models';

/**
 * Step 010 [check]: Verifies period lock and evaluates fuel mileage anomalies.
 * If KML < 4.0 or consumption is abnormal, raises fuel_anomaly exception.
 */
export const checkFuelAnomalyStep: OpStep = {
  file: 'fuel/010-check-fuel-anomaly.ts',
  number: 10,
  phase: 'check',
  async run(c: OpContext) {
    const periodLockService = c.get<PeriodLockService>(PeriodLockService);
    const dateStr = c.data.dateTime || c.data.date || new Date().toISOString().split('T')[0];
    const branchId = c.data.branchId || c.user.branchId || null;

    // 1. Period Lock check
    try {
      await periodLockService.checkAllowed(
        c.organizationId,
        branchId,
        dateStr,
        'Enter Fuel Slip',
      );
    } catch (err: any) {
      c.issues.block('PERIOD_LOCKED', err.message);
    }

    // 2. Anomaly evaluation
    const kml = parseFloat(String(c.data.kml || 0)) || 0;
    const litres = parseFloat(String(c.data.litres || 0)) || 0;

    if (litres > 500) {
      // Abnormally high fill exceeding standard single fuel tank capacity
      await ExceptionModel.create(
        {
          organizationId: c.organizationId,
          branchId,
          type: 'fuel_anomaly',
          severity: 'high',
          title: `Overfill detected: ${litres}L on Vehicle ${c.data.vehicle}`,
          detail: `Fuel fill of ${litres}L at station ${c.data.station} exceeds standard vehicle tank limits.`,
          refType: 'Vehicle',
          refId: 0,
          occurredOn: dateStr,
        },
        { transaction: c.t },
      );

      c.issues.warn(
        'FUEL_OVERFILL',
        `Fuel volume of ${litres}L is unusually large. Fuel anomaly exception logged to Control Tower.`,
      );
    } else if (kml > 0 && kml < 4.0) {
      // Abnormally low mileage
      await ExceptionModel.create(
        {
          organizationId: c.organizationId,
          branchId,
          type: 'fuel_anomaly',
          severity: 'medium',
          title: `Low fuel mileage: ${kml.toFixed(1)} km/L on ${c.data.vehicle}`,
          detail: `Odometer ${c.data.odometer || '—'}. Efficiency dropped below 4.0 km/L threshold.`,
          refType: 'Vehicle',
          refId: 0,
          occurredOn: dateStr,
        },
        { transaction: c.t },
      );

      c.issues.warn(
        'LOW_MILEAGE',
        `Mileage ${kml} km/L is below expected operating threshold (4.0 km/L).`,
      );
    }
  },
};
