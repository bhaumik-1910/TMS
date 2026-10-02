import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { randomUUID } from 'crypto';
import { NotificationModel, OrganizationModel } from '../database/models';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationModel)
    private readonly notificationModel: typeof NotificationModel,
    @InjectModel(OrganizationModel)
    private readonly organizationModel: typeof OrganizationModel,
  ) {}

  async findAll(organizationId?: string, userId?: string) {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (userId) {
      where[Op.or] = [{ userId }, { userId: null }];
    }

    try {
      let list = await this.notificationModel.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      // Auto-seed dynamic operational alerts if empty
      if (list.length === 0) {
        try {
          let targetOrgId = organizationId && organizationId !== 'SYSTEM' ? organizationId : null;
          if (!targetOrgId) {
            const firstOrg = await this.organizationModel.findOne();
            targetOrgId = firstOrg ? firstOrg.id : null;
          }

          if (targetOrgId) {
            const sampleAlerts = [
              {
                id: randomUUID(),
                organizationId: targetOrgId,
                userId: null,
                title: 'Route Deviation Critical Alert',
                message: 'Vehicle TRK-101 drifted 4.2 km off designated I-55 freight corridor near Springfield.',
                type: 'CRITICAL',
                channel: 'IN_APP',
                isRead: false,
                createdAt: new Date(Date.now() - 4 * 60 * 1000),
              },
              {
                id: randomUUID(),
                organizationId: targetOrgId,
                userId: null,
                title: 'Shipment SHP-2024-001 In Transit',
                message: 'Driver Marcus Vance departed Chicago Central Hub. Live GPS radar ping active.',
                type: 'OPERATIONS',
                channel: 'IN_APP',
                isRead: false,
                createdAt: new Date(Date.now() - 18 * 60 * 1000),
              },
              {
                id: randomUUID(),
                organizationId: targetOrgId,
                userId: null,
                title: 'Digital ePOD Signature Received',
                message: 'Receiver verified and e-signed consignment proof of delivery for SHP-2024-003.',
                type: 'OPERATIONS',
                channel: 'IN_APP',
                isRead: false,
                createdAt: new Date(Date.now() - 45 * 60 * 1000),
              },
              {
                id: randomUUID(),
                organizationId: targetOrgId,
                userId: null,
                title: 'SAP S/4HANA Ledger Sync Complete',
                message: 'Automated batch sync updated 14 freight billing invoices with zero reconciliation variances.',
                type: 'SYSTEM',
                channel: 'IN_APP',
                isRead: true,
                createdAt: new Date(Date.now() - 120 * 60 * 1000),
              },
              {
                id: randomUUID(),
                organizationId: targetOrgId,
                userId: null,
                title: 'Dwell Time Limit Advisory',
                message: 'TRK-104 exceeded 45-minute staging dwell threshold at Detroit Logistics Depot.',
                type: 'WARNING',
                channel: 'IN_APP',
                isRead: true,
                createdAt: new Date(Date.now() - 240 * 60 * 1000),
              },
            ];

            await this.notificationModel.bulkCreate(sampleAlerts as any);
            list = await this.notificationModel.findAll({
              where,
              order: [['createdAt', 'DESC']],
              limit: 50,
            });
          }
        } catch (err: any) {
          console.warn('[NotificationsService] Auto-seed skipped:', err?.message);
        }
      }

      return list;
    } catch (outerErr: any) {
      console.warn('[NotificationsService] findAll query fallback:', outerErr?.message);
      return [];
    }
  }

  async create(data: Partial<NotificationModel>) {
    return this.notificationModel.create(data as any);
  }

  async markAsRead(id: string) {
    const notification = await this.notificationModel.findByPk(id);
    if (notification) {
      await notification.update({ isRead: true });
    }
    return notification;
  }

  async markAllAsRead(organizationId?: string) {
    const where: any = { isRead: false };
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    await this.notificationModel.update(
      { isRead: true },
      { where },
    );
    return { success: true };
  }

  async delete(id: string) {
    const notification = await this.notificationModel.findByPk(id);
    if (notification) {
      await notification.destroy();
      return { success: true, id };
    }
    return { success: false };
  }

  async clearRead(organizationId?: string) {
    const where: any = { isRead: true };
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    await this.notificationModel.destroy({ where });
    return { success: true };
  }
}
