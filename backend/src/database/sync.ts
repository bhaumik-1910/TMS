import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ALL_MODELS } from './models';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function syncDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined in environment variables.');
    process.exit(1);
  }

  console.log('🔄 Initializing Sequelize connection...');
  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    models: ALL_MODELS,
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL database successfully.');

    console.log('⚠️  Wiping and re-synchronizing all tables (force: true)...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema cleanly synchronized.');

    await sequelize.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to synchronize database:', error);
    await sequelize.close();
    process.exit(1);
  }
}

syncDatabase();
