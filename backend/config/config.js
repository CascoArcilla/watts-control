const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const isPooler = process.env.EC_DB_POOLER === 'true';
const isSSL = process.env.EC_DB_SSL === 'true' || isPooler;

const baseConfig = {
  username: process.env.EC_DB_USER,
  password: process.env.EC_DB_PASSWORD,
  database: process.env.EC_DB_NAME,
  host: process.env.EC_DB_HOST,
  port: isPooler ? 6543 : (process.env.EC_DB_PORT || 5432),
  dialect: process.env.EC_DB_DIALECT || 'postgres',
  timezone: '+00:00',
  schema: process.env.EC_DB_SCHEMA || 'backend_app',
  dialectOptions: {
    ssl: isSSL ? { require: true, rejectUnauthorized: false } : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

if (isPooler) {
  baseConfig.dialectOptions.connectionTimeout = 60000;
  baseConfig.dialectOptions.keepAlive = true;
}

const configs = {
  development: {
    ...baseConfig,
    logging: process.env.EC_DB_LOGGING === 'true' ? console.log : false,
  },
  production: {
    ...baseConfig,
    logging: false,
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = configs[env];