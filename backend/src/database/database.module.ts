import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ALL_MODELS } from './models';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('DATABASE_URL');
        return {
          dialect: 'postgres',
          uri,
          models: ALL_MODELS,
          autoLoadModels: true,
          synchronize: false, // controlled via sync script or manual sync
          logging: false,
          pool: {
            max: 20,
            min: 2,
            acquire: 30000,
            idle: 10000,
          },
        };
      },
    }),
    SequelizeModule.forFeature(ALL_MODELS),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
