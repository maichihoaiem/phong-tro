const { query } = require("./db");

async function findIncompleteRefunds() {
    try {
        const result = await query(`
            SELECT ID_DatPhong, TrangThaiHoanTien, NganHang_NguoiThue, STK_NguoiThue, ChuTK_NguoiThue 
            FROM DatPhong 
            WHERE TrangThaiHoanTien IS NOT NULL
              AND (NganHang_NguoiThue IS NULL OR NganHang_NguoiThue = '' 
               OR STK_NguoiThue IS NULL OR STK_NguoiThue = '' 
               OR ChuTK_NguoiThue IS NULL OR ChuTK_NguoiThue = '')
        `);
        console.log("Incomplete refunds in DatPhong:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

findIncompleteRefunds();
