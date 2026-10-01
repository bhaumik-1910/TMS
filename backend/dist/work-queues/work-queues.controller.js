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
exports.WorkQueuesController = void 0;
const common_1 = require("@nestjs/common");
const work_queues_service_1 = require("./work-queues.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WorkQueuesController = class WorkQueuesController {
    constructor(workQueuesService) {
        this.workQueuesService = workQueuesService;
    }
    async getMyQueue(req) {
        return this.workQueuesService.getMyQueue(req.user);
    }
    async getPlanningQueue(req) {
        return this.workQueuesService.getPlanningQueue(req.user);
    }
    async getDispatchQueue(req) {
        return this.workQueuesService.getDispatchQueue(req.user);
    }
    async getFinanceQueue(req) {
        return this.workQueuesService.getFinanceQueue(req.user);
    }
    async getComplianceQueue(req) {
        return this.workQueuesService.getComplianceQueue(req.user);
    }
    async getSupportQueue(req) {
        return this.workQueuesService.getSupportQueue(req.user);
    }
};
exports.WorkQueuesController = WorkQueuesController;
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkQueuesController.prototype, "getMyQueue", null);
__decorate([
    (0, common_1.Get)('planning'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkQueuesController.prototype, "getPlanningQueue", null);
__decorate([
    (0, common_1.Get)('dispatch'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkQueuesController.prototype, "getDispatchQueue", null);
__decorate([
    (0, common_1.Get)('finance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkQueuesController.prototype, "getFinanceQueue", null);
__decorate([
    (0, common_1.Get)('compliance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkQueuesController.prototype, "getComplianceQueue", null);
__decorate([
    (0, common_1.Get)('support'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkQueuesController.prototype, "getSupportQueue", null);
exports.WorkQueuesController = WorkQueuesController = __decorate([
    (0, common_1.Controller)('api/v1/work-queues'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [work_queues_service_1.WorkQueuesService])
], WorkQueuesController);
//# sourceMappingURL=work-queues.controller.js.map