const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.SUPABASE_URI
  ? new Sequelize(process.env.SUPABASE_URI, {
      dialect: "postgres",

      logging: false,

      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },

      },

      pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000,
        evict: 1000,
      },

      retry: {
        max: 3,
      },
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",

      logging: false,

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },

      retry: {
        max: 3,
      },
    });

module.exports = sequelize;
