import { Controller } from '@nestjs/common';
import { crudController } from '../../framework/crud/crud-controller.js';
import { BranchesService } from './branches.service.js';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

@Controller(['branches', 'api/branches', 'api/v1/branches'])
export class BranchesController extends crudController({
  resource: 'branch',
  service: BranchesService,
  create: CreateBranchDto,
  update: UpdateBranchDto,
}) {}
