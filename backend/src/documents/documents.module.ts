import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentModel, DocumentTypeModel } from '../database/models';

@Module({
  imports: [SequelizeModule.forFeature([DocumentModel, DocumentTypeModel])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
