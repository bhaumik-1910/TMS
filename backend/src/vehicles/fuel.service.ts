import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FuelEntryModel } from '../database/models';

@Injectable()
export class FuelService implements OnModuleInit {
  constructor(
    @InjectModel(FuelEntryModel)
    private readonly fuelEntryModel: typeof FuelEntryModel,
  ) {}

  async onModuleInit() {
    try {
      const sequelize = this.fuelEntryModel.sequelize;
      if (!sequelize) return;

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS fuel_entries (
          id VARCHAR(255) PRIMARY KEY,
          "entryId" VARCHAR(100) UNIQUE NOT NULL,
          "dateTime" VARCHAR(100),
          "vehicle" VARCHAR(100) NOT NULL,
          "trip" VARCHAR(100),
          "station" VARCHAR(255) NOT NULL,
          "litres" DOUBLE PRECISION DEFAULT 0.0,
          "rate" DOUBLE PRECISION DEFAULT 0.0,
          "amount" DOUBLE PRECISION DEFAULT 0.0,
          "paymentMode" VARCHAR(100) DEFAULT 'Cash',
          "odometer" VARCHAR(100),
          "kml" DOUBLE PRECISION DEFAULT 0.0,
          "flagged" BOOLEAN DEFAULT false,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed default fuel entries if table is empty
      const [rows]: any = await sequelize.query(`SELECT count(*) as cnt FROM fuel_entries;`);
      if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
        const seed = [
          {
            id: 'FE/2400089',
            entryId: 'FE/2400089',
            dateTime: '2026-10-24',
            vehicle: 'GJ-01-AB-1122',
            trip: 'TR/240078',
            station: 'HPCL Adajan',
            litres: 320,
            rate: 93.0,
            amount: 29760,
            paymentMode: 'Credit',
            odometer: '48,230',
            kml: 5.8,
            flagged: false,
          },
          {
            id: 'FE/2400088',
            entryId: 'FE/2400088',
            dateTime: '2026-10-23',
            vehicle: 'MH-14-DX-9000',
            trip: 'TR/240076',
            station: 'IndianOil Ring Rd',
            litres: 450,
            rate: 93.0,
            amount: 41850,
            paymentMode: 'Cash',
            odometer: '62,100',
            kml: 5.6,
            flagged: false,
          },
          {
            id: 'FE/2400087',
            entryId: 'FE/2400087',
            dateTime: '2026-10-22',
            vehicle: 'RJ-13-TR-7788',
            trip: 'TR/240077',
            station: 'HPCL Adajan',
            litres: 280,
            rate: 93.0,
            amount: 26040,
            paymentMode: 'Fuel Card',
            odometer: '31,500',
            kml: 6.1,
            flagged: false,
          },
          {
            id: 'FE/2400086',
            entryId: 'FE/2400086',
            dateTime: '2026-10-21',
            vehicle: 'GJ-05-BT-2211',
            trip: '—',
            station: 'BPCL Naroda',
            litres: 360,
            rate: 93.0,
            amount: 33480,
            paymentMode: 'Cash',
            odometer: '19,400',
            kml: 4.2,
            flagged: true,
          },
        ];

        for (const s of seed) {
          await sequelize.query(
            `INSERT INTO fuel_entries (id, "entryId", "dateTime", "vehicle", "trip", "station", "litres", "rate", "amount", "paymentMode", "odometer", "kml", "flagged", "createdAt", "updatedAt")
             VALUES (:id, :entryId, :dateTime, :vehicle, :trip, :station, :litres, :rate, :amount, :paymentMode, :odometer, :kml, :flagged, NOW(), NOW())
             ON CONFLICT ("entryId") DO NOTHING;`,
            { replacements: s },
          );
        }
      }
    } catch (e) {
      console.warn('FuelService onModuleInit warning:', e);
    }
  }

  async findAll() {
    const list = await this.fuelEntryModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return list.map((item) => {
      const p = item.get({ plain: true });
      return {
        id: p.entryId || p.id,
        dbId: p.id,
        entryId: p.entryId || p.id,
        vehicle: p.vehicle,
        trip: p.trip || '',
        station: p.station,
        litres: p.litres,
        rate: p.rate,
        amount: p.amount,
        kml: p.kml,
        payMode: p.paymentMode,
        paymentMode: p.paymentMode,
        date: p.dateTime,
        dateTime: p.dateTime,
        odometer: p.odometer || '—',
        flagged: p.flagged || p.kml < 4.5,
      };
    });
  }

  async create(data: any) {
    const entryId = data.entryId || data.id || `FE/${2400090 + Math.floor(Math.random() * 1000)}`;
    const litres = parseFloat(String(data.litres || 0)) || 0;
    const rate = parseFloat(String(data.rate || 0)) || 0;
    const amount = parseFloat(String(data.amount || litres * rate)) || Math.round(litres * rate);
    const kml = parseFloat(String(data.kml || 0)) || 0;

    const record = await this.fuelEntryModel.create({
      id: data.id || entryId,
      entryId,
      dateTime: data.dateTime || data.date || new Date().toISOString().slice(0, 10),
      vehicle: data.vehicle,
      trip: data.trip || '',
      station: data.station,
      litres,
      rate,
      amount,
      paymentMode: data.paymentMode || data.payMode || 'Cash',
      odometer: data.odometer ? String(data.odometer) : '—',
      kml,
      flagged: kml < 4.5,
    });
    return record;
  }

  async update(id: string, data: any) {
    const item = await this.fuelEntryModel.findOne({
      where: {
        [Op.or]: [{ id }, { entryId: id }],
      },
    });
    if (!item) {
      throw new NotFoundException(`Fuel entry ${id} not found`);
    }

    const litres = data.litres !== undefined ? parseFloat(String(data.litres)) : item.litres;
    const rate = data.rate !== undefined ? parseFloat(String(data.rate)) : item.rate;
    const amount = data.amount !== undefined ? parseFloat(String(data.amount)) : (litres * rate);
    const kml = data.kml !== undefined ? parseFloat(String(data.kml)) : item.kml;

    await item.update({
      dateTime: data.dateTime || data.date || item.dateTime,
      vehicle: data.vehicle || item.vehicle,
      trip: data.trip !== undefined ? data.trip : item.trip,
      station: data.station || item.station,
      litres,
      rate,
      amount,
      paymentMode: data.paymentMode || data.payMode || item.paymentMode,
      odometer: data.odometer !== undefined ? String(data.odometer) : item.odometer,
      kml,
      flagged: kml < 4.5,
    });

    return item;
  }

  async remove(id: string) {
    const item = await this.fuelEntryModel.findOne({
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
