import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TyreEventModel, TyreInventoryModel } from '../database/models';

@Injectable()
export class TyreEventsService implements OnModuleInit {
  constructor(
    @InjectModel(TyreEventModel)
    private readonly tyreEventModel: typeof TyreEventModel,
    @InjectModel(TyreInventoryModel)
    private readonly tyreInventoryModel: typeof TyreInventoryModel,
  ) {}

  async onModuleInit() {
    try {
      const sequelize = this.tyreEventModel.sequelize;
      if (!sequelize) return;

      // 1. Initialize tyre_inventory table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS tyre_inventory (
          id VARCHAR(255) PRIMARY KEY,
          "serialNo" VARCHAR(100) UNIQUE NOT NULL,
          "brand" VARCHAR(100) NOT NULL,
          "size" VARCHAR(100) DEFAULT '295/80R22.5',
          "type" VARCHAR(100) DEFAULT 'New',
          "supplier" VARCHAR(255) DEFAULT 'Tata Rubber Ltd',
          "cost" DOUBLE PRECISION DEFAULT 0.0,
          "vehicle" VARCHAR(100),
          "position" VARCHAR(100),
          "fitDate" VARCHAR(100),
          "fitOdom" VARCHAR(100) DEFAULT '0',
          "status" VARCHAR(100) DEFAULT 'FITTED',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed tyre_inventory if empty
      const [invRows]: any = await sequelize.query(`SELECT count(*) as cnt FROM tyre_inventory;`);
      if (invRows && invRows[0] && parseInt(invRows[0].cnt, 10) === 0) {
        const seedTyres = [
          {
            id: 'TYR-GJ01-001',
            serialNo: 'TYR-GJ01-001',
            brand: 'MRF',
            size: '295/80R22.5',
            type: 'New',
            supplier: 'Tata Rubber Ltd',
            cost: 28000,
            vehicle: 'GJ-01-AB-1122',
            position: 'FR',
            fitDate: '2026-01-15',
            fitOdom: '40,000',
            status: 'FITTED',
          },
          {
            id: 'TYR-GJ01-002',
            serialNo: 'TYR-GJ01-002',
            brand: 'Apollo',
            size: '295/80R22.5',
            type: 'New',
            supplier: 'Tata Rubber Ltd',
            cost: 26500,
            vehicle: 'GJ-01-AB-1122',
            position: 'FL',
            fitDate: '2026-01-15',
            fitOdom: '40,000',
            status: 'FITTED',
          },
          {
            id: 'TYR-MH14-001',
            serialNo: 'TYR-MH14-001',
            brand: 'CEAT',
            size: '315/80R22.5',
            type: 'New',
            supplier: 'Tata Rubber Ltd',
            cost: 31000,
            vehicle: 'MH-14-DX-9000',
            position: 'FR',
            fitDate: '2025-06-20',
            fitOdom: '55,000',
            status: 'FITTED',
          },
          {
            id: 'TYR-SCRAP-001',
            serialNo: 'TYR-SCRAP-001',
            brand: 'MRF',
            size: '295/80R22.5',
            type: 'Retread',
            supplier: 'Tata Rubber Ltd',
            cost: 26000,
            vehicle: '—',
            position: '—',
            fitDate: '2024-04-01',
            fitOdom: '12,000',
            status: 'Scrapped',
          },
        ];

        for (const t of seedTyres) {
          await sequelize.query(`
            INSERT INTO tyre_inventory (id, "serialNo", "brand", "size", "type", "supplier", "cost", "vehicle", "position", "fitDate", "fitOdom", "status", "createdAt", "updatedAt")
            VALUES ('${t.id}', '${t.serialNo}', '${t.brand}', '${t.size}', '${t.type}', '${t.supplier}', ${t.cost}, '${t.vehicle}', '${t.position}', '${t.fitDate}', '${t.fitOdom}', '${t.status}', NOW(), NOW())
            ON CONFLICT ("serialNo") DO NOTHING;
          `);
        }
      }

      // 2. Initialize tyre_events table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS tyre_events (
          id VARCHAR(255) PRIMARY KEY,
          "eventId" VARCHAR(100) UNIQUE NOT NULL,
          "date" VARCHAR(100),
          "tyreSerial" VARCHAR(100) NOT NULL,
          "vehicle" VARCHAR(100) NOT NULL,
          "eventType" VARCHAR(100) DEFAULT 'Fit',
          "position" VARCHAR(100) DEFAULT 'FR',
          "odometer" VARCHAR(100) DEFAULT '0',
          "remarks" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      const [rows]: any = await sequelize.query(`SELECT count(*) as cnt FROM tyre_events;`);
      if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
        const seedEvents = [
          {
            id: 'TE/240012',
            eventId: 'TE/240012',
            date: '2026-01-15',
            tyreSerial: 'TYR-GJ01-001',
            vehicle: 'GJ-01-AB-1122',
            eventType: 'Fit',
            position: 'FR',
            odometer: '40,000',
            remarks: 'New tyre fitted front right',
          },
          {
            id: 'TE/240011',
            eventId: 'TE/240011',
            date: '2026-05-10',
            tyreSerial: 'TYR-MH14-001',
            vehicle: 'MH-14-DX-9000',
            eventType: 'Rotate',
            position: 'RR->FR',
            odometer: '58,500',
            remarks: 'Rotation as per schedule',
          },
          {
            id: 'TE/240010',
            eventId: 'TE/240010',
            date: '2026-03-01',
            tyreSerial: 'TYR-SCRAP-001',
            vehicle: 'RJ-13-TR-7788',
            eventType: 'Scrap',
            position: 'RL',
            odometer: '52,000',
            remarks: 'Sidewall damage, unrepairable',
          },
        ];

        for (const ev of seedEvents) {
          await sequelize.query(`
            INSERT INTO tyre_events (id, "eventId", "date", "tyreSerial", "vehicle", "eventType", "position", "odometer", "remarks", "createdAt", "updatedAt")
            VALUES ('${ev.id}', '${ev.eventId}', '${ev.date}', '${ev.tyreSerial}', '${ev.vehicle}', '${ev.eventType}', '${ev.position}', '${ev.odometer}', '${ev.remarks}', NOW(), NOW())
            ON CONFLICT ("eventId") DO NOTHING;
          `);
        }
      }
    } catch (err) {
      console.warn('Could not auto-initialize tyre tables:', err?.message || err);
    }
  }

  // --- TYRE INVENTORY METHODS ---
  async findAllTyres(query?: any) {
    const where: any = {};
    if (query?.search) {
      const s = `%${query.search}%`;
      where[Op.or] = [
        { serialNo: { [Op.iLike]: s } },
        { brand: { [Op.iLike]: s } },
        { vehicle: { [Op.iLike]: s } },
        { status: { [Op.iLike]: s } },
      ];
    }
    return this.tyreInventoryModel.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });
  }

  async createTyre(dto: any) {
    const serialNo = dto.serialNo || dto.serial || `TYR-NEW-${Math.floor(100 + Math.random() * 900)}`;
    const id = dto.id || serialNo;
    const payload = {
      id,
      serialNo,
      brand: dto.brand || 'MRF',
      size: dto.size || '295/80R22.5',
      type: dto.type || 'New',
      supplier: dto.supplier || 'Tata Rubber Ltd',
      cost: typeof dto.cost === 'number' ? dto.cost : parseFloat(String(dto.cost || '0').replace(/[^0-9.]/g, '')) || 0,
      vehicle: dto.vehicle || '—',
      position: dto.position || '—',
      fitDate: dto.fitDate || new Date().toISOString().slice(0, 10),
      fitOdom: dto.fitOdom !== undefined ? String(dto.fitOdom) : '0',
      status: dto.status || 'FITTED',
    };

    const [tyre, created] = await this.tyreInventoryModel.findOrCreate({
      where: {
        [Op.or]: [{ id: payload.id }, { serialNo: payload.serialNo }],
      },
      defaults: payload,
    });
    if (!created) {
      await tyre.update(payload);
    }
    return tyre;
  }

  async updateTyre(id: string, dto: any) {
    const item = await this.tyreInventoryModel.findOne({
      where: {
        [Op.or]: [{ id }, { serialNo: id }],
      },
    });
    if (!item) throw new NotFoundException(`Tyre ${id} not found`);
    await item.update(dto);
    return item;
  }

  async removeTyre(id: string) {
    const item = await this.tyreInventoryModel.findOne({
      where: {
        [Op.or]: [{ id }, { serialNo: id }],
      },
    });
    if (!item) throw new NotFoundException(`Tyre ${id} not found`);
    await item.destroy();
    return { success: true, message: `Tyre ${id} deleted` };
  }

  // --- TYRE EVENTS METHODS ---
  async findAll(query?: any) {
    const where: any = {};
    if (query?.search) {
      const s = `%${query.search}%`;
      where[Op.or] = [
        { eventId: { [Op.iLike]: s } },
        { tyreSerial: { [Op.iLike]: s } },
        { vehicle: { [Op.iLike]: s } },
        { eventType: { [Op.iLike]: s } },
        { remarks: { [Op.iLike]: s } },
      ];
    }
    return this.tyreEventModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string) {
    const item = await this.tyreEventModel.findOne({
      where: {
        [Op.or]: [{ id }, { eventId: id }],
      },
    });
    if (!item) {
      throw new NotFoundException(`Tyre event ${id} not found`);
    }
    return item;
  }

  async create(dto: any) {
    const eventId = dto.eventId || dto.id || `TE/${240013 + Math.floor(Math.random() * 900)}`;
    const id = dto.id || eventId;

    const payload = {
      id,
      eventId,
      date: dto.date || new Date().toISOString().slice(0, 10),
      tyreSerial: dto.tyreSerial || dto.serial || 'TYR-GJ01-001',
      vehicle: dto.vehicle || 'GJ-01-AB-1122',
      eventType: dto.eventType || 'Fit',
      position: dto.position || 'FR',
      odometer: dto.odometer !== undefined ? String(dto.odometer) : '0',
      remarks: dto.remarks || '',
    };

    const [event, created] = await this.tyreEventModel.findOrCreate({
      where: {
        [Op.or]: [{ id: payload.id }, { eventId: payload.eventId }],
      },
      defaults: payload,
    });

    if (!created) {
      await event.update(payload);
    }
    return event;
  }

  async update(id: string, dto: any) {
    const item = await this.findOne(id);
    await item.update(dto);
    return item;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await item.destroy();
    return { success: true, message: `Tyre event ${id} deleted successfully` };
  }
}
