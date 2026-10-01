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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDemoRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDemoRequestDto {
}
exports.CreateDemoRequestDto = CreateDemoRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Marcus' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Vance' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apex Logistics Corp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'marcus@apexlogistics.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1 (555) 234-5678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '50-250 employees', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "companySize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '25-100 trucks', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "fleetSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'United States', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Looking to optimize linehaul dispatch and live GPS tracking.', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDemoRequestDto.prototype, "message", void 0);
//# sourceMappingURL=create-demo-request.dto.js.map