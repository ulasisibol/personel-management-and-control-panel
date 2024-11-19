require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await new sql.ConnectionPool(config).connect();
            console.log('Veritabanına başarıyla bağlanıldı');
        }
        return pool;
    } catch (err) {
        console.error('Veritabanı bağlantı hatası:', err);
        throw err;
    }
};

const getConnection = async () => {
    if (!pool) {
        await connectDB();
    }
    return pool;
};

module.exports = {
    sql,
    connectDB,
    getConnection
};
