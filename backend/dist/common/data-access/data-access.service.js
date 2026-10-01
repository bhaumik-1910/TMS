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
exports.DataAccessService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../../database/models");
const data_scope_enum_1 = require("./data-scope.enum");
const data_access_matrix_1 = require("./data-access-matrix");
const resource_policies_1 = require("./resource-policies");
let DataAccessService = class DataAccessService {
    constructor(driverModel, customerModel, carrierModel) {
        this.driverModel = driverModel;
        this.customerModel = customerModel;
        this.carrierModel = carrierModel;
    }
    resolveScope(user, permissionKey = 'dashboard:view') {
        if (!user)
            return data_scope_enum_1.DataScope.SELF;
        if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) {
            return data_scope_enum_1.DataScope.SYSTEM;
        }
        const roles = user.roles || [];
        for (const r of roles) {
            const scopeMap = data_access_matrix_1.ROLE_DATA_SCOPE_MATRIX[r];
            if (scopeMap && scopeMap[permissionKey]) {
                return scopeMap[permissionKey];
            }
        }
        return data_scope_enum_1.DataScope.ORGANIZATION;
    }
    resolveOrganizationId(user, orgContextOverride) {
        if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) {
            if (orgContextOverride && orgContextOverride !== 'SYSTEM') {
                return orgContextOverride;
            }
            return undefined;
        }
        return user.organizationId;
    }
    async getShipmentWhere(user, options = {}) {
        const scope = this.resolveScope(user, 'shipment:view');
        const orgId = this.resolveOrganizationId(user, options.orgContext);
        const where = {};
        if (orgId) {
            where['$transportOrder.organizationId$'] = orgId;
        }
        if (options.status) {
            where.status = options.status;
        }
        if (scope === data_scope_enum_1.DataScope.DRIVER || user.roles?.includes('DRIVER')) {
            const driver = await this.driverModel.findOne({
                where: { email: user.email },
            });
            if (driver) {
                where.driverId = driver.id;
            }
            else {
                where.driverId = user.userId || user.id;
            }
        }
        else if (scope === data_scope_enum_1.DataScope.CUSTOMER || user.roles?.includes('CUSTOMER')) {
            const customer = await this.customerModel.findOne({
                where: { email: user.email },
            });
            if (customer) {
                where.customerId = customer.id;
            }
        }
        else if (scope === data_scope_enum_1.DataScope.CARRIER || user.roles?.includes('CARRIER')) {
            const carrier = await this.carrierModel.findOne({
                where: { email: user.email },
            });
            if (carrier) {
                where.carrierId = carrier.id;
            }
        }
        return where;
    }
    getVehicleWhere(user, orgContext) {
        const orgId = this.resolveOrganizationId(user, orgContext);
        const where = {};
        if (orgId) {
            where.organizationId = orgId;
        }
        return where;
    }
    getDriverWhere(user, orgContext) {
        const orgId = this.resolveOrganizationId(user, orgContext);
        const where = {};
        if (orgId) {
            where.organizationId = orgId;
        }
        if (user.roles?.includes('DRIVER')) {
            where.email = user.email;
        }
        return where;
    }
    async getInvoiceWhere(user, orgContext) {
        const orgId = this.resolveOrganizationId(user, orgContext);
        const where = {};
        if (orgId) {
            where.organizationId = orgId;
        }
        if (user.roles?.includes('CUSTOMER')) {
            const customer = await this.customerModel.findOne({
                where: { email: user.email },
            });
            if (customer) {
                where.customerId = customer.id;
            }
        }
        return where;
    }
    sanitizeShipment(shipment, user) {
        return resource_policies_1.ShipmentPolicy.sanitize(shipment, user);
    }
    sanitizeUser(userResponse) {
        return resource_policies_1.UserPolicy.sanitize(userResponse);
    }
};
exports.DataAccessService = DataAccessService;
exports.DataAccessService = DataAccessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.CustomerModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.CarrierModel)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DataAccessService);
//# sourceMappingURL=data-access.service.js.map