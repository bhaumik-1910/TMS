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
exports.RoleModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("./user.model");
const user_role_model_1 = require("./user-role.model");
const permission_model_1 = require("./permission.model");
const role_permission_model_1 = require("./role-permission.model");
let RoleModel = class RoleModel extends sequelize_typescript_1.Model {
};
exports.RoleModel = RoleModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], RoleModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], RoleModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], RoleModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => user_model_1.UserModel, () => user_role_model_1.UserRoleModel),
    __metadata("design:type", Array)
], RoleModel.prototype, "users", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => permission_model_1.PermissionModel, () => role_permission_model_1.RolePermissionModel),
    __metadata("design:type", Array)
], RoleModel.prototype, "permissions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => role_permission_model_1.RolePermissionModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], RoleModel.prototype, "rolePermissions", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], RoleModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], RoleModel.prototype, "updatedAt", void 0);
exports.RoleModel = RoleModel = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'roles',
        timestamps: true,
    })
], RoleModel);
//# sourceMappingURL=role.model.js.map