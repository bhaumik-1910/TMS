import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { JobCardModel } from '../database/models';

@Injectable()
export class JobCardsService implements OnModuleInit {
  constructor(
    @InjectModel(JobCardModel)
    private readonly jobCardModel: typeof JobCardModel,
  ) {}

  async onModuleInit() {
    try {
      const sequelize = this.jobCardModel.sequelize;
      if (!sequelize) return;

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS job_cards (
          id VARCHAR(255) PRIMARY KEY,
          "jobCardId" VARCHAR(100) UNIQUE NOT NULL,
          "date" VARCHAR(100),
          "vehicle" VARCHAR(100) NOT NULL,
          "serviceCentre" VARCHAR(100) NOT NULL,
          "workType" VARCHAR(100) DEFAULT 'Engine Overhaul',
          "status" VARCHAR(100) DEFAULT 'Open',
          "complaint" TEXT NOT NULL,
          "partsUsed" VARCHAR(255),
          "labourCost" DOUBLE PRECISION DEFAULT 0.0,
          "totalCost" DOUBLE PRECISION DEFAULT 0.0,
          "expectedDowntime" VARCHAR(100),
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      const [rows]: any = await sequelize.query(`SELECT count(*) as cnt FROM job_cards;`);
      if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
        const seed = [
          {
            id: 'JC/240055',
            jobCardId: 'JC/240055',
            date: '2026-10-20',
            vehicle: 'GJ-01-AC-3444',
            serviceCentre: 'Shree Motors',
            workType: 'Engine Overhaul',
            status: 'In Progress',
            complaint: 'Engine overheating, white smoke',
            partsUsed: 'Gasket set, coolant',
            labourCost: 8000,
            totalCost: 45000,
            expectedDowntime: '5 days',
          },
          {
            id: 'JC/240054',
            jobCardId: 'JC/240054',
            date: '2026-10-18',
            vehicle: 'MH-14-DX-9000',
            serviceCentre: 'RK Auto',
            workType: 'Brake Service',
            status: 'Open',
            complaint: 'Front axle brake liner wear & air leak',
            partsUsed: 'Brake pads, air valves',
            labourCost: 4500,
            totalCost: 18500,
            expectedDowntime: '1 day',
          },
          {
            id: 'JC/240053',
            jobCardId: 'JC/240053',
            date: '2026-10-16',
            vehicle: 'GJ-05-BT-2211',
            serviceCentre: 'SB Workshop',
            workType: 'Tyre Replacement',
            status: 'Completed',
            complaint: 'Axle 2 dual tyre puncture & realignment',
            partsUsed: 'Tubeless valves',
            labourCost: 1200,
            totalCost: 3200,
            expectedDowntime: '4 hours',
          },
          {
            id: 'JC/240052',
            jobCardId: 'JC/240052',
            date: '2026-10-15',
            vehicle: 'RJ-13-TR-7788',
            serviceCentre: 'City Auto Care',
            workType: 'Oil Change',
            status: 'Completed',
            complaint: 'Periodic maintenance 40,000 KM & oil filter replacement',
            partsUsed: 'Engine oil 15W40, filters',
            labourCost: 2500,
            totalCost: 14200,
            expectedDowntime: '6 hours',
          },
        ];

        for (const jc of seed) {
          await sequelize.query(`
            INSERT INTO job_cards (id, "jobCardId", "date", "vehicle", "serviceCentre", "workType", "status", "complaint", "partsUsed", "labourCost", "totalCost", "expectedDowntime", "createdAt", "updatedAt")
            VALUES ('${jc.id}', '${jc.jobCardId}', '${jc.date}', '${jc.vehicle}', '${jc.serviceCentre}', '${jc.workType}', '${jc.status}', '${jc.complaint}', '${jc.partsUsed}', ${jc.labourCost}, ${jc.totalCost}, '${jc.expectedDowntime}', NOW(), NOW())
            ON CONFLICT ("jobCardId") DO NOTHING;
          `);
        }
      }
    } catch (err) {
      console.warn('Could not auto-initialize job_cards table:', err?.message || err);
    }
  }

  async findAll(query?: any) {
    const where: any = {};
    if (query?.search) {
      const s = `%${query.search}%`;
      where[Op.or] = [
        { jobCardId: { [Op.iLike]: s } },
        { vehicle: { [Op.iLike]: s } },
        { serviceCentre: { [Op.iLike]: s } },
        { workType: { [Op.iLike]: s } },
        { complaint: { [Op.iLike]: s } },
      ];
    }
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.workType && query.workType !== 'ALL') {
      where.workType = query.workType;
    }

    return this.jobCardModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string) {
    const item = await this.jobCardModel.findOne({
      where: {
        [Op.or]: [{ id }, { jobCardId: id }],
      },
    });
    if (!item) {
      throw new NotFoundException(`Job card ${id} not found`);
    }
    return item;
  }

  async create(dto: any) {
    const jobCardId = dto.jobCardId || dto.jobCard || dto.id || `JC/${240056 + Math.floor(Math.random() * 900)}`;
    const id = dto.id || jobCardId;

    const parseNum = (v: any) => {
      if (typeof v === 'number') return v;
      return parseFloat(String(v || '0').replace(/[^0-9.]/g, '')) || 0;
    };

    const payload = {
      id,
      jobCardId,
      date: dto.date || new Date().toISOString().slice(0, 10),
      vehicle: dto.vehicle || 'GJ-01-AB-1122',
      serviceCentre: dto.serviceCentre || 'Shree Motors',
      workType: dto.workType || 'Engine Overhaul',
      status: dto.status || 'Open',
      complaint: dto.complaint || 'General Service',
      partsUsed: dto.partsUsed || '',
      labourCost: parseNum(dto.labourCost),
      totalCost: parseNum(dto.totalCost || dto.cost),
      expectedDowntime: dto.expectedDowntime || dto.downtime || '1 day',
    };

    const [item, created] = await this.jobCardModel.findOrCreate({
      where: {
        [Op.or]: [{ id: payload.id }, { jobCardId: payload.jobCardId }],
      },
      defaults: payload,
    });

    if (!created) {
      await item.update(payload);
    }
    return item;
  }

  async update(id: string, dto: any) {
    const item = await this.findOne(id);

    const parseNum = (v: any) => {
      if (typeof v === 'number') return v;
      return parseFloat(String(v || '0').replace(/[^0-9.]/g, '')) || 0;
    };

    const updatedData: any = {};
    if (dto.jobCardId !== undefined) updatedData.jobCardId = dto.jobCardId;
    if (dto.date !== undefined) updatedData.date = dto.date;
    if (dto.vehicle !== undefined) updatedData.vehicle = dto.vehicle;
    if (dto.serviceCentre !== undefined) updatedData.serviceCentre = dto.serviceCentre;
    if (dto.workType !== undefined) updatedData.workType = dto.workType;
    if (dto.status !== undefined) updatedData.status = dto.status;
    if (dto.complaint !== undefined) updatedData.complaint = dto.complaint;
    if (dto.partsUsed !== undefined) updatedData.partsUsed = dto.partsUsed;
    if (dto.labourCost !== undefined) updatedData.labourCost = parseNum(dto.labourCost);
    if (dto.totalCost !== undefined || dto.cost !== undefined) updatedData.totalCost = parseNum(dto.totalCost || dto.cost);
    if (dto.expectedDowntime !== undefined || dto.downtime !== undefined) updatedData.expectedDowntime = dto.expectedDowntime || dto.downtime;

    await item.update(updatedData);
    return item;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await item.destroy();
    return { success: true, message: `Job card ${id} deleted successfully` };
  }
}
