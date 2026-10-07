import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExceptionRecord } from './exception.model.js';
import { ExceptionsController } from './exceptions.controller.js';
import { ExceptionsService } from './exceptions.service.js';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([ExceptionRecord])],
  controllers: [ExceptionsController],
  providers: [ExceptionsService],
  exports: [ExceptionsService],
})
export class ExceptionsModule {}
