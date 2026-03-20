const { query } = require("./db");

async function checkDatPhongData() {
    try {
        const result = await query("SELECT TOP 50 * FROM DatPhong");
        console.log("DatPhong data:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkDatPhongData();
