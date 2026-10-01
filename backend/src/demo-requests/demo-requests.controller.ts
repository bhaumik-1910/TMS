import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';

@ApiTags('Demo Requests')
@Controller('api/v1/demo-requests')
export class DemoRequestsController {
  private readonly logger = new Logger(DemoRequestsController.name);

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit an enterprise TMS product demonstration request' })
  async createDemoRequest(@Body() dto: CreateDemoRequestDto) {
    this.logger.log(`Demo requested by ${dto.firstName} ${dto.lastName} (${dto.businessEmail}) for ${dto.company}`);

    return {
      success: true,
      data: {
        id: `demo_${Date.now()}`,
        status: 'RECEIVED',
        contact: `${dto.firstName} ${dto.lastName}`,
        company: dto.company,
        email: dto.businessEmail,
        createdAt: new Date().toISOString(),
      },
      message: 'Demo request successfully received. Our transportation solutions specialist will contact you within 24 hours.',
    };
  }
}
