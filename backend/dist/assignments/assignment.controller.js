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
exports.AssignmentController = void 0;
const common_1 = require("@nestjs/common");
const assignment_service_1 = require("./assignment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AssignmentController = class AssignmentController {
    constructor(assignmentService) {
        this.assignmentService = assignmentService;
    }
    async getAssignments(resourceType, resourceId) {
        return this.assignmentService.getAssignments(resourceType, resourceId);
    }
    async assign(resourceType, resourceId, body, req) {
        return this.assignmentService.assign(resourceType, resourceId, body.assignmentType, body.targetId, req.user, body.reason);
    }
};
exports.AssignmentController = AssignmentController;
__decorate([
    (0, common_1.Get)(':resourceType/:resourceId'),
    __param(0, (0, common_1.Param)('resourceType')),
    __param(1, (0, common_1.Param)('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "getAssignments", null);
__decorate([
    (0, common_1.Post)(':resourceType/:resourceId'),
    __param(0, (0, common_1.Param)('resourceType')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "assign", null);
exports.AssignmentController = AssignmentController = __decorate([
    (0, common_1.Controller)('api/v1/assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assignment_service_1.AssignmentService])
], AssignmentController);
//# sourceMappingURL=assignment.controller.js.map