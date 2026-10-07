import { Controller, Get } from '@nestjs/common';
import { Public } from './framework/auth/decorators.js';

@Controller()
export class AppController {
  @Public()
  @Get(['health', 'api/health', 'api/v1/health'])
  health() {
    return { status: 'ok' };
  }
}
