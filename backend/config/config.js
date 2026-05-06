const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const configs = {
  development: {
    username: process.env.EC_DB_USER,
    password: process.env.EC_DB_PASSWORD,
    database: process.env.EC_DB_NAME,
    host: process.env.EC_DB_HOST,
    port: process.env.EC_DB_PORT,
    dialect: 'mysql',
    timezone: '+00:00'
  },
  production: {
    username: process.env.EC_DB_USER,
    password: process.env.EC_DB_PASSWORD,
    database: process.env.EC_DB_NAME,
    host: process.env.EC_DB_HOST,
    port: process.env.EC_DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+00:00'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = configs[env];