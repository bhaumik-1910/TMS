import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { fieldErrors, flattenValidationErrors } from './framework/errors.js';
import { appConfig, type AppConfig } from './config/app.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);
  // Global prefix omitted: controllers explicitly declare api/v1 or multi-path prefixes
  app.enableCors({ origin: config.corsOrigins, credentials: false });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => fieldErrors(flattenValidationErrors(errors)),
    }),
  );
  app.enableShutdownHooks();
  await app.listen(config.port);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
