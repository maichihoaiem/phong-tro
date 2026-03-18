// =============================================
// Model: Location (TinhThanh, QuanHuyen, PhuongXa)
// =============================================
const { query } = require("../db");

const LocationModel = {
    // Lay tat ca tinh thanh
    async getTinhThanh() {
        return await query(`SELECT * FROM TinhThanh ORDER BY TenTinhThanh`);
    },

    // Lay quan huyen theo tinh thanh
    async getQuanHuyen(idTinhThanh) {
        return await query(`SELECT * FROM QuanHuyen WHERE ID_TinhThanh = ${idTinhThanh} ORDER BY TenQuanHuyen`);
    },

    // Lay phuong xa theo quan huyen
    async getPhuongXa(idQuanHuyen) {
        return await query(`SELECT * FROM PhuongXa WHERE ID_QuanHuyen = ${idQuanHuyen} ORDER BY TenPhuongXa`);
    }
};

module.exports = LocationModel;
