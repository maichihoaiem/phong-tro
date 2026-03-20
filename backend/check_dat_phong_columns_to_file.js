const { query } = require("./db");
const fs = require('fs');

async function checkDatPhongColumns() {
    try {
        const result = await query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'DatPhong'");
        fs.writeFileSync('dat_phong_columns.txt', JSON.stringify(result, null, 2));
        console.log("Saved to dat_phong_columns.txt");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkDatPhongColumns();
