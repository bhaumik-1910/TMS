import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import {
  UserModel,
  OrganizationModel,
  UserRoleModel,
  RoleModel,
  RolePermissionModel,
  PermissionModel,
  AuditLogModel,
} from '../database/models';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(RoleModel)
    private roleModel: typeof RoleModel,
    @InjectModel(PermissionModel)
    private permissionModel: typeof PermissionModel,
    @InjectModel(RolePermissionModel)
    private rolePermissionModel: typeof RolePermissionModel,
    @InjectModel(UserRoleModel)
    private userRoleModel: typeof UserRoleModel,
    @InjectModel(AuditLogModel)
    private auditLogModel: typeof AuditLogModel,
  ) {}

  async findAll(organizationId?: string) {
    const where: any = organizationId ? { organizationId } : {};
    return this.userModel.findAll({
      where,
      include: [
        { model: OrganizationModel },
        {
          model: UserRoleModel,
          include: [{ model: RoleModel }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id, {
      include: [
        { model: OrganizationModel },
        {
          model: UserRoleModel,
          include: [{ model: RoleModel }],
        },
      ],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any, currentOrgId: string) {
    const existing = await this.userModel.findOne({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(data.password || 'Tms@123456', 10);
    const orgId = data.organizationId || currentOrgId;

    const user = await this.userModel.create({
      organizationId: orgId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      status: data.status || 'ACTIVE',
    });

    if (data.roleId) {
      await this.userRoleModel.create({
        userId: user.id,
        roleId: data.roleId,
      });
    }

    return this.findOne(user.id);
  }

  async update(id: string, data: any) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      status: data.status,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    await user.update(updateData);

    if (data.roleId) {
      await this.userRoleModel.destroy({ where: { userId: id } });
      await this.userRoleModel.create({
        userId: id,
        roleId: data.roleId,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    await user.destroy();
    return { success: true };
  }

  async getRoles() {
    return this.roleModel.findAll({
      include: [
        {
          model: RolePermissionModel,
          include: [{ model: PermissionModel }],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  async getPermissions() {
    return this.permissionModel.findAll({
      order: [['key', 'ASC']],
    });
  }

  async createRole(data: { name: string; description?: string; permissionIds?: string[] }, currentUserId: string, orgId: string) {
    const existing = await this.roleModel.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException(`Role with name ${data.name} already exists`);

    const sequelize = this.roleModel.sequelize!;
    return sequelize.transaction(async (t) => {
      const role = await this.roleModel.create(
        {
          name: data.name.toUpperCase().replace(/\s+/g, '_'),
          description: data.description,
        },
        { transaction: t },
      );

      if (data.permissionIds && data.permissionIds.length > 0) {
        await this.rolePermissionModel.bulkCreate(
          data.permissionIds.map((pId) => ({
            roleId: role.id,
            permissionId: pId,
          })),
          { transaction: t },
        );
      }

      await this.auditLogModel.create(
        {
          organizationId: orgId,
          userId: currentUserId,
          action: 'ROLE_CREATED',
          module: 'rbac',
          entityType: 'Role',
          entityId: role.id,
          newValue: JSON.stringify({ name: role.name, permissionsCount: data.permissionIds?.length || 0 }),
        },
        { transaction: t },
      );

      return this.roleModel.findByPk(role.id, {
        include: [
          {
            model: RolePermissionModel,
            include: [{ model: PermissionModel }],
          },
        ],
        transaction: t,
      });
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissionIds?: string[] }, currentUserId: string, orgId: string) {
    const role = await this.roleModel.findByPk(id);
    if (!role) throw new NotFoundException('Role not found');

    const sequelize = this.roleModel.sequelize!;
    return sequelize.transaction(async (t) => {
      await role.update(
        {
          name: data.name ? data.name.toUpperCase().replace(/\s+/g, '_') : undefined,
          description: data.description,
        },
        { transaction: t },
      );

      if (data.permissionIds) {
        await this.rolePermissionModel.destroy({ where: { roleId: id }, transaction: t });
        if (data.permissionIds.length > 0) {
          await this.rolePermissionModel.bulkCreate(
            data.permissionIds.map((pId) => ({
              roleId: id,
              permissionId: pId,
            })),
            { transaction: t },
          );
        }
      }

      await this.auditLogModel.create(
        {
          organizationId: orgId,
          userId: currentUserId,
          action: 'ROLE_UPDATED',
          module: 'rbac',
          entityType: 'Role',
          entityId: id,
          oldValue: JSON.stringify({ name: role.name }),
          newValue: JSON.stringify({ name: role.name, permissionsCount: data.permissionIds?.length }),
        },
        { transaction: t },
      );

      return this.roleModel.findByPk(id, {
        include: [
          {
            model: RolePermissionModel,
            include: [{ model: PermissionModel }],
          },
        ],
        transaction: t,
      });
    });
  }

  async deleteRole(id: string, currentUserId: string, orgId: string) {
    const role = await this.roleModel.findByPk(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.name === 'SUPER_ADMIN') throw new ConflictException('SUPER_ADMIN role cannot be deleted');

    const assignedCount = await this.userRoleModel.count({ where: { roleId: id } });
    if (assignedCount > 0) throw new ConflictException(`Cannot delete role currently assigned to ${assignedCount} user(s)`);

    const sequelize = this.roleModel.sequelize!;
    return sequelize.transaction(async (t) => {
      await this.rolePermissionModel.destroy({ where: { roleId: id }, transaction: t });
      await role.destroy({ transaction: t });

      await this.auditLogModel.create(
        {
          organizationId: orgId,
          userId: currentUserId,
          action: 'ROLE_DELETED',
          module: 'rbac',
          entityType: 'Role',
          entityId: id,
          oldValue: JSON.stringify({ name: role.name }),
        },
        { transaction: t },
      );

      return { success: true };
    });
  }

  async assignUserRoles(targetUserId: string, roleIds: string[], currentUserId: string, orgId: string) {
    const user = await this.userModel.findByPk(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    const sequelize = this.userModel.sequelize!;
    return sequelize.transaction(async (t) => {
      await this.userRoleModel.destroy({ where: { userId: targetUserId }, transaction: t });

      if (roleIds && roleIds.length > 0) {
        await this.userRoleModel.bulkCreate(
          roleIds.map((rId) => ({
            userId: targetUserId,
            roleId: rId,
          })),
          { transaction: t },
        );
      }

      await this.auditLogModel.create(
        {
          organizationId: orgId,
          userId: currentUserId,
          action: 'USER_ROLES_ASSIGNED',
          module: 'rbac',
          entityType: 'User',
          entityId: targetUserId,
          newValue: JSON.stringify({ assignedRoleIds: roleIds }),
        },
        { transaction: t },
      );

      return this.findOne(targetUserId);
    });
  }
}
