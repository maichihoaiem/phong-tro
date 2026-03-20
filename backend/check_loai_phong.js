const { connectDB, query, sql } = require("./db");

async function checkLoaiPhong() {
    try {
        const result = await query("SELECT * FROM LoaiPhong");
        console.log("Current LoaiPhong:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkLoaiPhong();
