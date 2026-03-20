const { query } = require("./db");

async function checkTrangThaiValues() {
    try {
        const result = await query("SELECT DISTINCT TrangThai FROM DatPhong");
        console.log("Distinct TrangThai:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkTrangThaiValues();
