const { connectDB, query, sql } = require("./db");

async function addLoaiPhong() {
    try {
        // Check if exists first to be safe
        const existing = await query("SELECT * FROM LoaiPhong WHERE TenLoai = N'Nhà nguyên căn'");
        if (existing.length > 0) {
            console.log("LoaiPhong 'Nhà nguyên căn' already exists with ID:", existing[0].ID_LoaiPhong);
            process.exit(0);
        }

        const result = await query("INSERT INTO LoaiPhong (TenLoai) OUTPUT INSERTED.ID_LoaiPhong VALUES (N'Nhà nguyên căn')");
        console.log("Added 'Nhà nguyên căn' with ID:", result[0].ID_LoaiPhong);
        process.exit(0);
    } catch (err) {
        console.error("Error adding LoaiPhong:", err);
        process.exit(1);
    }
}

addLoaiPhong();
