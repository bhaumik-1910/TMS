import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI Transportation Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('query')
  @ApiOperation({ summary: 'Submit natural language operational prompt to AI Assistant' })
  async query(@CurrentUser('organizationId') orgId: string, @Body('query') query: string) {
    return this.aiService.processQuery(orgId, query);
  }
}
