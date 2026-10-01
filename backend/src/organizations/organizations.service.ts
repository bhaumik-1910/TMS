import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import { OrganizationModel, UserModel } from '../database/models';

@Injectable()
export class OrganizationsService extends BaseSequelizeService<OrganizationModel> {
  constructor(
    @InjectModel(OrganizationModel)
    private readonly orgModel: typeof OrganizationModel,
  ) {
    super(orgModel);
  }

  async findAllOrgs() {
    const orgs = await this.orgModel.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: UserModel,
          attributes: ['id'],
          required: false,
        },
      ],
    });

    return orgs.map((org) => {
      const plain = org.get({ plain: true });
      return {
        ...plain,
        _count: {
          users: plain.users ? plain.users.length : 0,
        },
      };
    });
  }

  override async findAll(where: any = {}): Promise<any> {
    return this.findAllOrgs();
  }

  async findOneOrg(id: string) {
    const org = await this.orgModel.findByPk(id, {
      include: [{ model: UserModel, attributes: ['id'], required: false }],
    });
    if (!org) throw new NotFoundException('Organization not found');
    const plain = org.get({ plain: true });
    return {
      ...plain,
      _count: {
        users: plain.users ? plain.users.length : 0,
      },
    };
  }

  override async findOne(optionsOrId: any): Promise<any> {
    if (typeof optionsOrId === 'string') {
      return this.findOneOrg(optionsOrId);
    }
    return super.findOne(optionsOrId);
  }
}
