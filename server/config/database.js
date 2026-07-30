const { Sequelize } = require('sequelize');
require('dotenv').config()

console.log("SUPABASE_URI exists:", !!process.env.SUPABASE_URI);

const url = new URL(process.env.SUPABASE_URI);

const sequelize = process.env.SUPABASE_URI ? new Sequelize(process.env.SUPABASE_URI, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}) : new Sequelize({
    dialect: 'postgres',
    database: process.env.DB_NAME || 'mydb',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    logging: console.log,
})


module.exports = sequelize