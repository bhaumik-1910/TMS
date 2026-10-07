"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv = require("dotenv");
const path = require("path");
const models_1 = require("./models");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function syncDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined in environment variables.');
        process.exit(1);
    }
    console.log('🔄 Initializing Sequelize connection...');
    const sequelize = new sequelize_typescript_1.Sequelize(dbUrl, {
        dialect: 'postgres',
        models: models_1.ALL_MODELS,
        logging: false,
    });
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL database successfully.');
        console.log('Synchronizing all tables (CREATE TABLE IF NOT EXISTS)...');
        await sequelize.sync();
        console.log('Database schema cleanly synchronized.');
        await sequelize.close();
        console.log('🔌 Connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Failed to synchronize database:', error);
        await sequelize.close();
        process.exit(1);
    }
}
syncDatabase();
//# sourceMappingURL=sync.js.map