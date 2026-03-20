const { query } = require("./db");

async function findIncompleteWithdrawals() {
    try {
        const result = await query(`
            SELECT * FROM RutTien 
            WHERE TenNganHang IS NULL OR TenNganHang = '' 
               OR SoTaiKhoan IS NULL OR SoTaiKhoan = '' 
               OR ChuTaiKhoan IS NULL OR ChuTaiKhoan = ''
        `);
        console.log("Incomplete withdrawals:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

findIncompleteWithdrawals();
