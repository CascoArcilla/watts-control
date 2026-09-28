const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const baseConfig = {
  username: process.env.EC_DB_USER,
  password: process.env.EC_DB_PASSWORD,
  database: process.env.EC_DB_NAME,
  host: process.env.EC_DB_HOST,
  port: process.env.EC_DB_PORT,
  dialect: process.env.EC_DB_DIALECT,
  timezone: '+00:00',
  schema: process.env.EC_DB_SCHEMA || 'backend_app',
  dialectOptions: {
    ssl: process.env.EC_DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
  },
};

const configs = {
  development: {
    ...baseConfig,
  },
  production: {
    ...baseConfig,
    logging: false,
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = configs[env];