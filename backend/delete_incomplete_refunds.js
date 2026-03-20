const { query } = require("./db");

async function deleteIncompleteRefunds() {
    try {
        const result = await query(`
            DELETE FROM DatPhong 
            WHERE TrangThaiThanhToan = N'Chờ hoàn tiền (Chưa có STK)'
        `);
        console.log("Deleted incomplete refunds records.");
        process.exit(0);
    } catch (err) {
        console.error("Error deleting records:", err);
        process.exit(1);
    }
}

deleteIncompleteRefunds();
