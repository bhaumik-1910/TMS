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
exports.PodController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pod_service_1 = require("./pod.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PodController = class PodController {
    constructor(podService) {
        this.podService = podService;
    }
    async getPOD(shipmentId) {
        return this.podService.getPOD(shipmentId);
    }
    async submitPOD(body) {
        return this.podService.submitPOD(body);
    }
};
exports.PodController = PodController;
__decorate([
    (0, common_1.Get)(':shipmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Proof of Delivery for shipment' }),
    __param(0, (0, common_1.Param)('shipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PodController.prototype, "getPOD", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit POD with digital signature, receiver name, photo and OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PodController.prototype, "submitPOD", null);
exports.PodController = PodController = __decorate([
    (0, swagger_1.ApiTags)('Proof of Delivery (POD)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/pod'),
    __metadata("design:paramtypes", [pod_service_1.PodService])
], PodController);
//# sourceMappingURL=pod.controller.js.map