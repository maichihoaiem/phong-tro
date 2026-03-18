// Model: PhongTro
// Cot: ID_Phong, TieuDe, Gia, DienTich, MoTa, DiaChiChiTiet, ID_LoaiPhong, ID_PhuongXa, ID_TaiKhoan, TrangThai, LuotXem, NgayDang
const { query } = require("../db");

const PhongTroModel = {
    // Lay danh sach phong tro voi bo loc + phan trang
    async getAll(filters = {}) {
        // Mặc định chỉ hiện các phòng "Còn trống" hoặc chưa có trạng thái
        let where = "WHERE (pt.TrangThai IS NULL OR pt.TrangThai = N'Còn trống' OR pt.TrangThai = N'Đang trống' OR pt.TrangThai = '')";

        if (filters.idTinhThanh) {
            const raw = String(filters.idTinhThanh).split(',').map(s => s.trim());
            const numericIds = raw.map(id => parseInt(id)).filter(id => !isNaN(id));
            const names = raw.filter(s => isNaN(parseInt(s)));

            let conditions = [];
            if (numericIds.length > 0) conditions.push(`tt.ID_TinhThanh IN (${numericIds.join(',')})`);
            if (names.length > 0) {
                const nameConds = names.map(n => {
                    const cleanName = n.replace(/Thành phố |Tỉnh |TP. |Trung ương /g, '').trim();
                    return `tt.TenTinhThanh LIKE N'%${cleanName}%'`;
                });
                conditions.push(`(${nameConds.join(' OR ')})`);
            }

            if (conditions.length > 0) where += ` AND (${conditions.join(' OR ')})`;
        }
        if (filters.idQuanHuyen) {
            const raw = String(filters.idQuanHuyen).split(',').map(s => s.trim());
            const numericIds = raw.map(id => parseInt(id)).filter(id => !isNaN(id));
            const names = raw.filter(s => isNaN(parseInt(s)));

            let conditions = [];
            if (numericIds.length > 0) conditions.push(`qh.ID_QuanHuyen IN (${numericIds.join(',')})`);
            if (names.length > 0) {
                const nameConds = names.map(n => {
                    const cleanName = n.replace(/Quận |Huyện |Thị xã |Thành phố /g, '').trim();
                    return `qh.TenQuanHuyen LIKE N'%${cleanName}%'`;
                });
                conditions.push(`(${nameConds.join(' OR ')})`);
            }

            if (conditions.length > 0) where += ` AND (${conditions.join(' OR ')})`;
        }
        if (filters.idPhuongXa) {
            const raw = String(filters.idPhuongXa).split(',').map(s => s.trim());
            const numericIds = raw.map(id => parseInt(id)).filter(id => !isNaN(id));
            const names = raw.filter(s => isNaN(parseInt(s)));

            let conditions = [];
            if (numericIds.length > 0) conditions.push(`px.ID_PhuongXa IN (${numericIds.join(',')})`);
            if (names.length > 0) {
                const nameConds = names.map(n => {
                    const cleanName = n.replace(/Phường |Xã |Thị trấn /g, '').trim();
                    return `px.TenPhuongXa LIKE N'%${cleanName}%'`;
                });
                conditions.push(`(${nameConds.join(' OR ')})`);
            }

            if (conditions.length > 0) where += ` AND (${conditions.join(' OR ')})`;
        }
        if (filters.idLoaiPhong) {
            const ids = String(filters.idLoaiPhong).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (ids.length > 0) where += ` AND pt.ID_LoaiPhong IN (${ids.join(',')})`;
        }
        if (filters.giaMin) where += ` AND pt.Gia >= ${filters.giaMin}`;
        if (filters.giaMax) where += ` AND pt.Gia <= ${filters.giaMax}`;
        if (filters.dienTichMin) where += ` AND pt.DienTich >= ${filters.dienTichMin}`;
        if (filters.dienTichMax) where += ` AND pt.DienTich <= ${filters.dienTichMax}`;
        if (filters.keyword) where += ` AND pt.TieuDe LIKE N'%${filters.keyword}%'`;

        // Đảm bảo Where sạch sẽ và an toàn
        const cleanWhere = (where && where.trim().startsWith('WHERE')) ? where : `WHERE 1=1 ${where}`;

        // Dem tong - Chỉ JOIN những bảng cần thiết cho Filter (địa chỉ)
        const countSql = `
            SELECT COUNT(DISTINCT pt.ID_Phong) AS total
            FROM PhongTro pt
            LEFT JOIN PhuongXa px ON pt.ID_PhuongXa = px.ID_PhuongXa
            LEFT JOIN QuanHuyen qh ON px.ID_QuanHuyen = qh.ID_QuanHuyen
            LEFT JOIN TinhThanh tt ON qh.ID_TinhThanh = tt.ID_TinhThanh
            ${cleanWhere}`;
        
        const countResult = await query(countSql);
        const total = countResult[0].total;

        // Phan trang
        const pageNum = parseInt(filters.page) || 1;
        const limitNum = parseInt(filters.limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const dataSql = `
            SELECT pt.*, lp.TenLoai AS TenLoaiPhong, px.TenPhuongXa, qh.TenQuanHuyen, tt.TenTinhThanh,
                   tk.HoTen AS TenChuTro, tk.SoDienThoai AS SDTChuTro,
                   (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = pt.ID_Phong) AS AnhDaiDien
            FROM PhongTro pt
            LEFT JOIN LoaiPhong lp ON pt.ID_LoaiPhong = lp.ID_LoaiPhong
            LEFT JOIN PhuongXa px ON pt.ID_PhuongXa = px.ID_PhuongXa
            LEFT JOIN QuanHuyen qh ON px.ID_QuanHuyen = qh.ID_QuanHuyen
            LEFT JOIN TinhThanh tt ON qh.ID_TinhThanh = tt.ID_TinhThanh
            LEFT JOIN TaiKhoan tk ON pt.ID_TaiKhoan = tk.ID_TaiKhoan
            ${cleanWhere}
            ORDER BY pt.NgayDang DESC, pt.ID_Phong DESC
            OFFSET ${offset} ROWS FETCH NEXT ${limitNum} ROWS ONLY`;
        
        const data = await query(dataSql);
        return { data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
    },

    // Lay chi tiet phong theo ID
    async getById(id) {
        const result = await query(`
            SELECT pt.*, lp.TenLoai AS TenLoaiPhong, px.TenPhuongXa, qh.TenQuanHuyen, qh.ID_QuanHuyen, tt.TenTinhThanh, tt.ID_TinhThanh,
                   tk.HoTen AS TenChuTro, tk.SoDienThoai AS SDTChuTro, tk.Email AS EmailChuTro, tk.AnhDaiDien AS AnhChuTro
            FROM PhongTro pt
            JOIN LoaiPhong lp ON pt.ID_LoaiPhong = lp.ID_LoaiPhong
            JOIN PhuongXa px ON pt.ID_PhuongXa = px.ID_PhuongXa
            JOIN QuanHuyen qh ON px.ID_QuanHuyen = qh.ID_QuanHuyen
            JOIN TinhThanh tt ON qh.ID_TinhThanh = tt.ID_TinhThanh
            JOIN TaiKhoan tk ON pt.ID_TaiKhoan = tk.ID_TaiKhoan
            WHERE pt.ID_Phong = ${id}
        `);
        return result.length > 0 ? result[0] : null;
    },

    // Lay hinh anh cua phong
    async getImages(idPhong) {
        return await query(`SELECT * FROM HinhAnhPhong WHERE ID_Phong = ${idPhong}`);
    },

    // Lay tien ich cua phong
    async getAmenities(idPhong) {
        return await query(`
            SELECT ti.* FROM TienIch ti
            JOIN PhongTro_TienIch pti ON ti.ID_TienIch = pti.ID_TienIch
            WHERE pti.ID_Phong = ${idPhong}
        `);
    },

    // Tang luot xem
    async increaseView(id) {
        await query(`UPDATE PhongTro SET LuotXem = ISNULL(LuotXem, 0) + 1 WHERE ID_Phong = ${id}`);
    },

    // Them phong tro (Chu tro)
    async create(data) {
        const result = await query(`
            INSERT INTO PhongTro (TieuDe, MoTa, Gia, DienTich, DiaChiChiTiet, ID_TaiKhoan, ID_LoaiPhong, ID_PhuongXa, TrangThai, GiaDien, GiaNuoc)
            OUTPUT INSERTED.ID_Phong
            VALUES (N'${data.tieuDe}', N'${data.moTa}', ${data.gia}, ${data.dienTich}, N'${data.diaChi}', ${data.idTaiKhoan}, ${data.idLoaiPhong}, ${data.idPhuongXa}, N'Chờ duyệt', ${data.giaDien !== null && data.giaDien !== undefined ? `N'${String(data.giaDien).replace(/'/g, "''")}'` : 'NULL'}, ${data.giaNuoc !== null && data.giaNuoc !== undefined ? `N'${String(data.giaNuoc).replace(/'/g, "''")}'` : 'NULL'})
        `);
        return result[0].ID_Phong;
    },

    // Cap nhat phong tro
    async update(id, data) {
        await query(`
            UPDATE PhongTro SET 
                TieuDe = N'${data.tieuDe}', MoTa = N'${data.moTa}', Gia = ${data.gia}, 
                DienTich = ${data.dienTich}, DiaChiChiTiet = N'${data.diaChi}', 
                ID_LoaiPhong = ${data.idLoaiPhong}, ID_PhuongXa = ${data.idPhuongXa},
                GiaDien = ${data.giaDien !== null && data.giaDien !== undefined ? `N'${String(data.giaDien).replace(/'/g, "''")}'` : 'NULL'}, 
                GiaNuoc = ${data.giaNuoc !== null && data.giaNuoc !== undefined ? `N'${String(data.giaNuoc).replace(/'/g, "''")}'` : 'NULL'}
            WHERE ID_Phong = ${id}
        `);
    },

    // Xoa phong tro
    async delete(id) {
        await query(`DELETE FROM PhongTro_TienIch WHERE ID_Phong = ${id}`);
        await query(`DELETE FROM HinhAnhPhong WHERE ID_Phong = ${id}`);
        await query(`DELETE FROM YeuThich WHERE ID_Phong = ${id}`);
        await query(`DELETE FROM DatPhong WHERE ID_Phong = ${id}`);
        await query(`DELETE FROM PhongTro WHERE ID_Phong = ${id}`);
    },

    // Cap nhat trang thai phong (Vi du: 'Đã cho thuê')
    async updateStatus(id, trangThai) {
        await query(`UPDATE PhongTro SET TrangThai = N'${trangThai}' WHERE ID_Phong = ${id}`);
    },

    // Them hinh anh
    async addImage(idPhong, duongDanAnh) {
        await query(`INSERT INTO HinhAnhPhong (DuongDanAnh, ID_Phong) VALUES (N'${duongDanAnh}', ${idPhong})`);
    },

    // Them tien ich cho phong
    async addAmenity(idPhong, idTienIch) {
        await query(`INSERT INTO PhongTro_TienIch (ID_Phong, ID_TienIch) VALUES (${idPhong}, ${idTienIch})`);
    },

    // Xoa tat ca tien ich cua phong
    async clearAmenities(idPhong) {
        await query(`DELETE FROM PhongTro_TienIch WHERE ID_Phong = ${idPhong}`);
    },

    // Lay phong tro cua chu tro
    async getByOwner(idTaiKhoan) {
        return await query(`
            SELECT pt.*, lp.TenLoai AS TenLoaiPhong,
                   (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = pt.ID_Phong) AS AnhDaiDien
            FROM PhongTro pt
            JOIN LoaiPhong lp ON pt.ID_LoaiPhong = lp.ID_LoaiPhong
            WHERE pt.ID_TaiKhoan = ${idTaiKhoan}
            ORDER BY pt.NgayDang DESC
        `);
    },

    // Lay tat ca loai phong
    async getLoaiPhong() {
        return await query(`SELECT * FROM LoaiPhong`);
    },

    // Lay tat ca tien ich
    async getTienIch() {
        return await query(`SELECT * FROM TienIch`);
    }
};

module.exports = PhongTroModel;
