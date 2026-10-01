import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Sequelize } from 'sequelize-typescript';

@ApiTags('Health & Observability')
@Controller('health')
export class HealthController {
  constructor(private readonly sequelize: Sequelize) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  async getHealth() {
    return {
      status: 'ok',
      service: 'enterprise-tms-backend',
      orm: 'Sequelize + sequelize-typescript',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe with database connectivity verification' })
  async getReadiness() {
    let dbStatus = 'down';
    try {
      await this.sequelize.query('SELECT 1');
      dbStatus = 'up';
    } catch (err: any) {
      dbStatus = `down: ${err.message}`;
    }

    const isReady = dbStatus === 'up';
    return {
      status: isReady ? 'ready' : 'unhealthy',
      database: dbStatus,
      orm: 'Sequelize PostgreSQL Pool',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
