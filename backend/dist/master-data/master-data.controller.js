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
exports.MasterDataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const master_data_service_1 = require("./master-data.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let MasterDataController = class MasterDataController {
    constructor(masterDataService) {
        this.masterDataService = masterDataService;
    }
    async getLocations(orgId) {
        return this.masterDataService.getLocations(orgId);
    }
    async createLocation(orgId, body) {
        return this.masterDataService.createLocation(orgId, body);
    }
    async getLocationTypes() {
        return this.masterDataService.getLocationTypes();
    }
    async getVehicleTypes() {
        return this.masterDataService.getVehicleTypes();
    }
    async getCargoTypes() {
        return this.masterDataService.getCargoTypes();
    }
    async getPackageTypes() {
        return this.masterDataService.getPackageTypes();
    }
};
exports.MasterDataController = MasterDataController;
__decorate([
    (0, common_1.Get)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tenant locations (warehouses, hubs, depots)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new location with GPS coordinates' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Get)('location-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get location types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getLocationTypes", null);
__decorate([
    (0, common_1.Get)('vehicle-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getVehicleTypes", null);
__decorate([
    (0, common_1.Get)('cargo-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cargo types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getCargoTypes", null);
__decorate([
    (0, common_1.Get)('package-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get package types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getPackageTypes", null);
exports.MasterDataController = MasterDataController = __decorate([
    (0, swagger_1.ApiTags)('Master Data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/master-data'),
    __metadata("design:paramtypes", [master_data_service_1.MasterDataService])
], MasterDataController);
//# sourceMappingURL=master-data.controller.js.map