import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { appConfig, type AppConfig } from '../config/app.config.js';
import { connectionOptions } from '../framework/tenancy/connection-registry.js';

const logger = new Logger('Sequelize');

/**
 * Postgres via sequelize-typescript. Models register themselves through `forFeature`. The pool
 * starts with an unusable `search_path`, so SQL that skips the tenant context fails loudly.
 */
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => ({
        ...connectionOptions(10),
        define: { underscored: false },
        uri: config.databaseUri,
        autoLoadModels: true,
        dialectOptions: {
          options: '-c search_path=public,platform',
        },
        // Tables are created per schema by the framework (`SchemaSync`), never by a blanket sync.
        synchronize: false,
        logging: config.dbLogging ? (sql: string) => logger.debug(sql) : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
