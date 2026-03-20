const { query } = require("./db");

async function checkDatPhongColumns() {
    try {
        const result = await query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'DatPhong'");
        console.log("DatPhong Columns:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkDatPhongColumns();
