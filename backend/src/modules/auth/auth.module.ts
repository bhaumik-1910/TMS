import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { appConfig, type AppConfig } from '../../config/app.config.js';
import { Role } from '../../framework/acl/role.model.js';
import { Branch } from '../branches/branch.model.js';
import { Company } from '../companies/company.model.js';
import { PlatformModule } from '../platform/platform.module.js';
import { UserBranch } from '../users/user-branch.model.js';
import { User } from '../users/user.model.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

/** Global so the framework's `JwtAuthGuard` finds the `JwtService`. */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtAccessTtl as never },
      }),
    }),
    SequelizeModule.forFeature([User, UserBranch, Company, Role, Branch]),
    PlatformModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
