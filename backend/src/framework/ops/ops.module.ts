import { Module, Global } from '@nestjs/common';
import { OpsRunnerService } from './ops-runner.service';
import { FoundationModule } from '../../foundation/foundation.module';

@Global()
@Module({
  imports: [FoundationModule],
  providers: [OpsRunnerService],
  exports: [OpsRunnerService],
})
export class OpsModule {}
