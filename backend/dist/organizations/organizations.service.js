"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let OrganizationsService = class OrganizationsService extends base_service_1.BaseSequelizeService {
    constructor(orgModel) {
        super(orgModel);
        this.orgModel = orgModel;
    }
    async findAllOrgs() {
        const orgs = await this.orgModel.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: models_1.UserModel,
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
    async findAll(where = {}) {
        return this.findAllOrgs();
    }
    async findOneOrg(id) {
        const org = await this.orgModel.findByPk(id, {
            include: [{ model: models_1.UserModel, attributes: ['id'], required: false }],
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const plain = org.get({ plain: true });
        return {
            ...plain,
            _count: {
                users: plain.users ? plain.users.length : 0,
            },
        };
    }
    async findOne(optionsOrId) {
        if (typeof optionsOrId === 'string') {
            return this.findOneOrg(optionsOrId);
        }
        return super.findOne(optionsOrId);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.OrganizationModel)),
    __metadata("design:paramtypes", [Object])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map