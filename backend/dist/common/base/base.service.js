"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSequelizeService = void 0;
const common_1 = require("@nestjs/common");
class BaseSequelizeService {
    constructor(model) {
        this.model = model;
    }
    async findAll(...args) {
        const where = typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
        const include = Array.isArray(args[1]) ? args[1] : [];
        const order = args[2] || [['createdAt', 'DESC']];
        return this.model.findAll({
            where,
            include,
            order,
        });
    }
    async findPaginated(where = {}, pagination = {}, include = [], customOrder) {
        const page = Math.max(1, Number(pagination.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(pagination.limit) || 20));
        const offset = (page - 1) * limit;
        const order = customOrder || [
            [pagination.sortBy || 'createdAt', pagination.sortOrder || 'DESC'],
        ];
        const { rows, count } = await this.model.findAndCountAll({
            where,
            include,
            limit,
            offset,
            order,
            distinct: true,
        });
        return {
            data: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        };
    }
    async findById(id, include = []) {
        const record = await this.model.findByPk(id, { include });
        if (!record) {
            throw new common_1.NotFoundException(`${this.model.name.replace('Model', '')} with ID ${id} not found`);
        }
        return record;
    }
    async findOne(options) {
        const record = await this.model.findOne(options);
        return record;
    }
    async create(...args) {
        const [dto, options] = args;
        const record = await this.model.create(dto, options);
        return record;
    }
    async update(id, dto, options) {
        const record = await this.findById(id);
        await record.update(dto, options);
        return record;
    }
    async delete(id) {
        const record = await this.findById(id);
        await record.destroy();
    }
    async count(where = {}) {
        return this.model.count({ where });
    }
    async withTransaction(operation) {
        const sequelize = this.model.sequelize;
        if (!sequelize)
            throw new Error('Sequelize instance not found on model');
        return sequelize.transaction(operation);
    }
}
exports.BaseSequelizeService = BaseSequelizeService;
//# sourceMappingURL=base.service.js.map