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
exports.RolePermissionModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const role_model_1 = require("./role.model");
const permission_model_1 = require("./permission.model");
let RolePermissionModel = class RolePermissionModel extends sequelize_typescript_1.Model {
};
exports.RolePermissionModel = RolePermissionModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], RolePermissionModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => role_model_1.RoleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], RolePermissionModel.prototype, "roleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => role_model_1.RoleModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", role_model_1.RoleModel)
], RolePermissionModel.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => permission_model_1.PermissionModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], RolePermissionModel.prototype, "permissionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => permission_model_1.PermissionModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", permission_model_1.PermissionModel)
], RolePermissionModel.prototype, "permission", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], RolePermissionModel.prototype, "createdAt", void 0);
exports.RolePermissionModel = RolePermissionModel = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'role_permissions',
        timestamps: true,
        updatedAt: false,
    })
], RolePermissionModel);
//# sourceMappingURL=role-permission.model.js.map