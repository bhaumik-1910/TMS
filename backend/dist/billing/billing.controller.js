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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_1 = require("./billing.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async getBillingRecords(query) {
        return this.billingService.findAllBillingInvoices(query);
    }
    async createBillingRecord(body) {
        return this.billingService.createBillingInvoice(body);
    }
    async updateBillingRecord(id, body) {
        return this.billingService.updateBillingInvoice(id, body);
    }
    async deleteBillingRecord(id) {
        return this.billingService.deleteBillingInvoice(id);
    }
    async getPurchaseBills(query) {
        return this.billingService.findAllPurchaseBills(query);
    }
    async createPurchaseBill(body) {
        return this.billingService.createPurchaseBill(body);
    }
    async updatePurchaseBill(id, body) {
        return this.billingService.updatePurchaseBill(id, body);
    }
    async deletePurchaseBill(id) {
        return this.billingService.deletePurchaseBill(id);
    }
    async getSettlements(query) {
        return this.billingService.findAllSettlements(query);
    }
    async createSettlement(body) {
        return this.billingService.createSettlement(body);
    }
    async updateSettlement(id, body) {
        return this.billingService.updateSettlement(id, body);
    }
    async deleteSettlement(id) {
        return this.billingService.deleteSettlement(id);
    }
    async findAllInvoices(orgId, status) {
        return this.billingService.findAllInvoices(orgId, status);
    }
    async findInvoice(id) {
        return this.billingService.findInvoice(id);
    }
    async recordPayment(id, body) {
        return this.billingService.recordPayment(id, body);
    }
    async auditCarrierInvoice(body) {
        return this.billingService.auditCarrierInvoice(body);
    }
    async findAllClaims(orgId) {
        return this.billingService.findAllClaims(orgId);
    }
    async createClaim(body) {
        return this.billingService.createClaim(body);
    }
    async updateClaimStatus(id, status) {
        return this.billingService.updateClaimStatus(id, status);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('records'),
    (0, swagger_1.ApiOperation)({ summary: 'List all billing invoices from database' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getBillingRecords", null);
__decorate([
    (0, common_1.Post)('records'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new billing invoice in database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createBillingRecord", null);
__decorate([
    (0, common_1.Patch)('records/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update billing invoice in database' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateBillingRecord", null);
__decorate([
    (0, common_1.Delete)('records/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete billing invoice from database' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "deleteBillingRecord", null);
__decorate([
    (0, common_1.Get)('purchase-bills'),
    (0, swagger_1.ApiOperation)({ summary: 'List all purchase bills from database' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPurchaseBills", null);
__decorate([
    (0, common_1.Post)('purchase-bills'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new purchase bill in database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createPurchaseBill", null);
__decorate([
    (0, common_1.Patch)('purchase-bills/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase bill in database' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updatePurchaseBill", null);
__decorate([
    (0, common_1.Delete)('purchase-bills/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete purchase bill from database' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "deletePurchaseBill", null);
__decorate([
    (0, common_1.Get)('settlements'),
    (0, swagger_1.ApiOperation)({ summary: 'List all trip settlements from database' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSettlements", null);
__decorate([
    (0, common_1.Post)('settlements'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new trip settlement in database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createSettlement", null);
__decorate([
    (0, common_1.Patch)('settlements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update trip settlement in database' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateSettlement", null);
__decorate([
    (0, common_1.Delete)('settlements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete trip settlement from database' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "deleteSettlement", null);
__decorate([
    (0, common_1.Get)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'List customer freight invoices' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findAllInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice with items, payments, and delivery proof' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Record payment for invoice' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('freight-audit/compare'),
    (0, swagger_1.ApiOperation)({ summary: 'Audit carrier invoice vs contract rate and flag variances' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "auditCarrierInvoice", null);
__decorate([
    (0, common_1.Get)('claims'),
    (0, swagger_1.ApiOperation)({ summary: 'List damage/shortage claims' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findAllClaims", null);
__decorate([
    (0, common_1.Post)('claims'),
    (0, swagger_1.ApiOperation)({ summary: 'File freight claim' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createClaim", null);
__decorate([
    (0, common_1.Patch)('claims/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update claim status (APPROVED, REJECTED, SETTLED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateClaimStatus", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing, Freight Audit & Claims'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map