import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { CompanySettingModel } from '../../database/models/foundation/company-setting.model';

@Injectable()
export class CompanySettingsService {
  constructor(
    @InjectModel(CompanySettingModel)
    private readonly settingModel: typeof CompanySettingModel,
  ) {}

  /**
   * Gets a specific setting or returns defaultValue
   */
  async get<T = any>(organizationId: string | number, key: string, defaultValue?: T): Promise<T> {
    const row = await this.settingModel.findOne({
      where: { organizationId: String(organizationId), key },
    });
    return row ? (row.value as T) : (defaultValue as T);
  }

  /**
   * Sets or updates a setting
   */
  async set(organizationId: string | number, key: string, value: any, tx?: Transaction): Promise<CompanySettingModel> {
    const [row, created] = await this.settingModel.findOrCreate({
      where: { organizationId: String(organizationId), key },
      defaults: {
        organizationId: String(organizationId),
        key,
        value,
      },
      transaction: tx,
    });

    if (!created) {
      await row.update({ value }, { transaction: tx });
    }

    return row;
  }

  /**
   * Lists all settings for the organization as a key-value dictionary
   */
  async getAll(organizationId: string | number): Promise<Record<string, any>> {
    const rows = await this.settingModel.findAll({
      where: { organizationId: String(organizationId) },
    });
    const map: Record<string, any> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  }
}
