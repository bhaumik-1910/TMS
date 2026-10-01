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
var DemoRequestsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const create_demo_request_dto_1 = require("./dto/create-demo-request.dto");
let DemoRequestsController = DemoRequestsController_1 = class DemoRequestsController {
    constructor() {
        this.logger = new common_1.Logger(DemoRequestsController_1.name);
    }
    async createDemoRequest(dto) {
        this.logger.log(`Demo requested by ${dto.firstName} ${dto.lastName} (${dto.businessEmail}) for ${dto.company}`);
        return {
            success: true,
            data: {
                id: `demo_${Date.now()}`,
                status: 'RECEIVED',
                contact: `${dto.firstName} ${dto.lastName}`,
                company: dto.company,
                email: dto.businessEmail,
                createdAt: new Date().toISOString(),
            },
            message: 'Demo request successfully received. Our transportation solutions specialist will contact you within 24 hours.',
        };
    }
};
exports.DemoRequestsController = DemoRequestsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an enterprise TMS product demonstration request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_demo_request_dto_1.CreateDemoRequestDto]),
    __metadata("design:returntype", Promise)
], DemoRequestsController.prototype, "createDemoRequest", null);
exports.DemoRequestsController = DemoRequestsController = DemoRequestsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Demo Requests'),
    (0, common_1.Controller)('api/v1/demo-requests')
], DemoRequestsController);
//# sourceMappingURL=demo-requests.controller.js.map