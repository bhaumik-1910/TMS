import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DriverAdvanceModel } from '../database/models';

@Injectable()
export class DriverAdvancesService implements OnModuleInit {
  constructor(
    @InjectModel(DriverAdvanceModel)
    private readonly driverAdvanceModel: typeof DriverAdvanceModel,
  ) {}

  async onModuleInit() {
    try {
      const sequelize = this.driverAdvanceModel.sequelize;
      if (!sequelize) return;

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS driver_advances (
          id VARCHAR(255) PRIMARY KEY,
          "entryId" VARCHAR(100) UNIQUE NOT NULL,
          "date" VARCHAR(100),
          "driver" VARCHAR(100) NOT NULL,
          "tripRef" VARCHAR(100),
          "entryType" VARCHAR(50) DEFAULT 'Advance',
          "expenseHead" VARCHAR(100) DEFAULT 'Driver Bhatta',
          "amount" DOUBLE PRECISION DEFAULT 0.0,
          "paymentMode" VARCHAR(100) DEFAULT 'Cash',
          "status" VARCHAR(50) DEFAULT 'Pending',
          "remarks" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      const [rows]: any = await sequelize.query(`SELECT count(*) as cnt FROM driver_advances;`);
      if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
        const seed = [
          {
            id: 'ADV/240056',
            entryId: 'ADV/240056',
            date: '2026-10-24',
            driver: 'Ramesh Alumar',
            tripRef: 'TR/240079',
            entryType: 'Advance',
            expenseHead: 'Driver Bhatta',
            amount: 1800,
            paymentMode: 'Cash',
            status: 'Pending',
            remarks: 'Trip allowance for Mumbai corridor',
          },
          {
            id: 'ADV/240055',
            entryId: 'ADV/240055',
            date: '2026-10-23',
            driver: 'Kishore Bhai',
            tripRef: 'TR/240077',
            entryType: 'Expense',
            expenseHead: 'Toll',
            amount: 2200,
            paymentMode: 'UPI',
            status: 'Approved',
            remarks: 'NH48 toll plaza Fastag recharge',
          },
          {
            id: 'ADV/240054',
            entryId: 'ADV/240054',
            date: '2026-10-22',
            driver: 'Suresh Patel',
            tripRef: 'TR/240076',
            entryType: 'Advance',
            expenseHead: 'Advance',
            amount: 5000,
            paymentMode: 'Cash',
            status: 'Settled',
            remarks: 'Loading advance at warehouse',
          },
          {
            id: 'ADV/240053',
            entryId: 'ADV/240053',
            date: '2026-10-21',
            driver: 'Devraj Patel',
            tripRef: 'TR/240078',
            entryType: 'Expense',
            expenseHead: 'Repairs',
            amount: 1200,
            paymentMode: 'Cash',
            status: 'Approved',
            remarks: 'En-route tyre valve replacement',
          },
          {
            id: 'ADV/240052',
            entryId: 'ADV/240052',
            date: '2026-10-20',
            driver: 'Ramesh Alumar',
            tripRef: 'TR/240075',
            entryType: 'Expense',
            expenseHead: 'Police / RTO',
            amount: 800,
            paymentMode: 'UPI',
            status: 'Rejected',
            remarks: 'Overweight chalan (disallowed)',
          },
        ];

        for (const s of seed) {
          await sequelize.query(
            `INSERT INTO driver_advances (id, "entryId", "date", "driver", "tripRef", "entryType", "expenseHead", "amount", "paymentMode", "status", "remarks", "createdAt", "updatedAt")
             VALUES (:id, :entryId, :date, :driver, :tripRef, :entryType, :expenseHead, :amount, :paymentMode, :status, :remarks, NOW(), NOW())
             ON CONFLICT ("entryId") DO NOTHING;`,
            { replacements: s },
          );
        }
      }
    } catch (e) {
      console.warn('DriverAdvancesService onModuleInit warning:', e);
    }
  }

  async findAll() {
    const list = await this.driverAdvanceModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return list.map((item) => {
      const p = item.get({ plain: true });
      return {
        id: p.entryId || p.id,
        dbId: p.id,
        entryId: p.entryId || p.id,
        date: p.date,
        driver: p.driver,
        tripRef: p.tripRef || '—',
        entryType: p.entryType || 'Advance',
        expenseHead: p.expenseHead || 'Advance',
        amount: p.amount || 0,
        paymentMode: p.paymentMode || 'Cash',
        status: p.status || 'Pending',
        remarks: p.remarks || '',
      };
    });
  }

  async create(data: any) {
    const entryId = data.entryId || data.id || `ADV/${240056 + Math.floor(Math.random() * 1000)}`;
    const amount = parseFloat(String(data.amount || '0').replace(/[^0-9.]/g, '')) || 0;

    const record = await this.driverAdvanceModel.create({
      id: data.id || entryId,
      entryId,
      date: data.date || new Date().toISOString().slice(0, 10),
      driver: data.driver && data.driver !== '— Select —' ? data.driver : 'Ramesh Alumar',
      tripRef: data.tripRef && data.tripRef !== '—' ? data.tripRef : '',
      entryType: data.entryType || 'Advance',
      expenseHead: data.expenseHead && data.expenseHead !== '— Select —' ? data.expenseHead : 'Advance',
      amount,
      paymentMode: data.paymentMode || 'Cash',
      status: data.status && data.status !== '— Select —' ? data.status : 'Pending',
      remarks: data.remarks || '',
    });
    return record;
  }

  async update(id: string, data: any) {
    const item = await this.driverAdvanceModel.findOne({
      where: {
        [Op.or]: [{ id }, { entryId: id }],
      },
    });
    if (!item) {
      throw new NotFoundException(`Advance entry ${id} not found`);
    }

    const amount = data.amount !== undefined ? parseFloat(String(data.amount).replace(/[^0-9.]/g, '')) : item.amount;

    await item.update({
      date: data.date || item.date,
      driver: (data.driver && data.driver !== '— Select —') ? data.driver : item.driver,
      tripRef: data.tripRef !== undefined ? data.tripRef : item.tripRef,
      entryType: data.entryType || item.entryType,
      expenseHead: (data.expenseHead && data.expenseHead !== '— Select —') ? data.expenseHead : item.expenseHead,
      amount,
      paymentMode: data.paymentMode || item.paymentMode,
      status: (data.status && data.status !== '— Select —') ? data.status : item.status,
      remarks: data.remarks !== undefined ? data.remarks : item.remarks,
    });
    return item;
  }

  async remove(id: string) {
    const item = await this.driverAdvanceModel.findOne({
      where: {
        [Op.or]: [{ id }, { entryId: id }],
      },
    });
    if (item) {
      await item.destroy();
    }
    return { success: true };
  }
}
