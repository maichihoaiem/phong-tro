const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, 
        trustServerCertificate: true
    }
};

let poolPromise;

async function connectDB() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log("✅ Kết nối SQL Server trên mạng thành công!");
                return pool;
            })
            .catch(err => {
                console.error("❌ Lỗi kết nối SQL Server:", err.message);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
}

async function query(queryStr) {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(queryStr);
        return result.recordset;
    } catch (err) {
        console.error("❌ SQL Query Error:", err.message);
        throw err;
    }
}

async function getRequest() {
    const pool = await connectDB();
    return pool.request();
}

module.exports = { sql, connectDB, query, getRequest };
