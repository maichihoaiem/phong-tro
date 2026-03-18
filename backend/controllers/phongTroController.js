// =============================================
// Controller: PhongTro
// =============================================
const PhongTroModel = require("../models/PhongTroModel");

const phongTroController = {
    // Lay danh sach phong (co bo loc + phan trang)
    async getAll(req, res) {
        try {
            const filters = {
                idTinhThanh: req.query.tinhThanh,
                idQuanHuyen: req.query.quanHuyen,
                idPhuongXa: req.query.phuongXa,
                idLoaiPhong: req.query.loaiPhong,
                giaMin: req.query.giaMin,
                giaMax: req.query.giaMax,
                dienTichMin: req.query.dienTichMin,
                dienTichMax: req.query.dienTichMax,
                keyword: req.query.keyword,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10
            };
            const result = await PhongTroModel.getAll(filters);
            console.log(`API Response: total=${result.total}, returning ${result.data.length} rooms`);
            res.json({ success: true, ...result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay chi tiet phong
    async getById(req, res) {
        try {
            const id = req.params.id;
            const phong = await PhongTroModel.getById(id);
            if (!phong) {
                return res.status(404).json({ success: false, message: "Khong tim thay phong!" });
            }

            const publicStatuses = ['', 'Còn trống', 'Đang trống'];
            const currentStatus = (phong.TrangThai || '').trim();
            if (!publicStatuses.includes(currentStatus)) {
                return res.status(404).json({ success: false, message: "Bài đăng chưa được duyệt hoặc không còn hiển thị." });
            }

            // Tang luot xem
            await PhongTroModel.increaseView(id);

            // Lay hinh anh va tien ich
            const hinhAnh = await PhongTroModel.getImages(id);
            const tienIch = await PhongTroModel.getAmenities(id);

            res.json({ success: true, data: { ...phong, hinhAnh, tienIch } });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Ham phu tro: Tim hoac tao moi ID_PhuongXa tu ten
    async resolveLocation(tenTinhThanh, tenQuanHuyen, tenPhuongXa) {
        if (!tenTinhThanh || !tenQuanHuyen || !tenPhuongXa) return 1;
        const { query } = require("../db");

        let ttResult = await query(`SELECT ID_TinhThanh FROM TinhThanh WHERE TenTinhThanh = N'${tenTinhThanh.replace(/'/g, "''")}'`);
        let idTt = ttResult.length === 0 ?
            (await query(`INSERT INTO TinhThanh (TenTinhThanh) OUTPUT INSERTED.ID_TinhThanh VALUES (N'${tenTinhThanh.replace(/'/g, "''")}')`))[0].ID_TinhThanh
            : ttResult[0].ID_TinhThanh;

        let qhResult = await query(`SELECT ID_QuanHuyen FROM QuanHuyen WHERE TenQuanHuyen = N'${tenQuanHuyen.replace(/'/g, "''")}' AND ID_TinhThanh = ${idTt}`);
        let idQh = qhResult.length === 0 ?
            (await query(`INSERT INTO QuanHuyen (TenQuanHuyen, ID_TinhThanh) OUTPUT INSERTED.ID_QuanHuyen VALUES (N'${tenQuanHuyen.replace(/'/g, "''")}', ${idTt})`))[0].ID_QuanHuyen
            : qhResult[0].ID_QuanHuyen;

        let pxResult = await query(`SELECT ID_PhuongXa FROM PhuongXa WHERE TenPhuongXa = N'${tenPhuongXa.replace(/'/g, "''")}' AND ID_QuanHuyen = ${idQh}`);
        let idPx = pxResult.length === 0 ?
            (await query(`INSERT INTO PhuongXa (TenPhuongXa, ID_QuanHuyen) OUTPUT INSERTED.ID_PhuongXa VALUES (N'${tenPhuongXa.replace(/'/g, "''")}', ${idQh})`))[0].ID_PhuongXa
            : pxResult[0].ID_PhuongXa;

        return idPx;
    },

    // Them phong (Chu tro)
    async create(req, res) {
        try {
            let idPhuongXa = req.body.idPhuongXa || 1;
            if (req.body.tenTinhThanh) {
                idPhuongXa = await phongTroController.resolveLocation(req.body.tenTinhThanh, req.body.tenQuanHuyen, req.body.tenPhuongXa);
            }

            const data = {
                tieuDe: req.body.tieuDe,
                moTa: req.body.moTa,
                gia: req.body.gia,
                dienTich: req.body.dienTich,
                diaChi: req.body.diaChiChiTiet || req.body.diaChi,
                idTaiKhoan: req.session.user.ID_TaiKhoan,
                idLoaiPhong: req.body.idLoaiPhong,
                idPhuongXa: idPhuongXa,
                giaDien: req.body.giaDien,
                giaNuoc: req.body.giaNuoc
            };

            const idPhong = await PhongTroModel.create(data);

            // Them tien ich
            if (req.body.tienIch && Array.isArray(req.body.tienIch)) {
                for (const idTienIch of req.body.tienIch) {
                    await PhongTroModel.addAmenity(idPhong, idTienIch);
                }
            }

            // Them hinh anh
            if (req.body.hinhAnh && Array.isArray(req.body.hinhAnh)) {
                for (const duongDan of req.body.hinhAnh) {
                    await PhongTroModel.addImage(idPhong, duongDan);
                }
            }

            res.json({ success: true, message: "Đăng phòng thành công! Bài đăng đang chờ admin duyệt.", idPhong });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Cap nhat phong (Chu tro)
    async update(req, res) {
        try {
            const id = req.params.id;
            let idPhuongXa = req.body.idPhuongXa || 1;
            if (req.body.tenTinhThanh) {
                idPhuongXa = await phongTroController.resolveLocation(req.body.tenTinhThanh, req.body.tenQuanHuyen, req.body.tenPhuongXa);
            }

            const data = {
                tieuDe: req.body.tieuDe,
                moTa: req.body.moTa,
                gia: req.body.gia,
                dienTich: req.body.dienTich,
                diaChi: req.body.diaChiChiTiet || req.body.diaChi,
                idLoaiPhong: req.body.idLoaiPhong,
                idPhuongXa: idPhuongXa,
                giaDien: req.body.giaDien,
                giaNuoc: req.body.giaNuoc
            };

            await PhongTroModel.update(id, data);

            // Cap nhat tien ich
            if (req.body.tienIch && Array.isArray(req.body.tienIch)) {
                await PhongTroModel.clearAmenities(id);
                for (const idTienIch of req.body.tienIch) {
                    await PhongTroModel.addAmenity(id, idTienIch);
                }
            }

            // Cap nhat hinh anh
            if (req.body.hinhAnh && Array.isArray(req.body.hinhAnh)) {
                await require("../db").query(`DELETE FROM HinhAnhPhong WHERE ID_Phong = ${id}`);
                for (const duongDan of req.body.hinhAnh) {
                    await PhongTroModel.addImage(id, duongDan);
                }
            }

            res.json({ success: true, message: "Cap nhat phong thanh cong!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Xoa phong (Chu tro)
    async delete(req, res) {
        try {
            await PhongTroModel.delete(req.params.id);
            res.json({ success: true, message: "Xoa phong thanh cong!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Khoi phuc trang thai phong ve Cong trong
    async restoreStatus(req, res) {
        try {
            const id = req.params.id;
            // Kiem tra thuoc ve tK dang dang nhap (Co the them layer check owner neu can)
            await PhongTroModel.updateStatus(id, 'Còn trống');
            res.json({ success: true, message: "Mo lai phong thanh cong!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay phong cua chu tro
    async getMyRooms(req, res) {
        try {
            const rooms = await PhongTroModel.getByOwner(req.session.user.ID_TaiKhoan);
            res.json({ success: true, data: rooms });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay loai phong
    async getLoaiPhong(req, res) {
        try {
            const data = await PhongTroModel.getLoaiPhong();
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay tien ich
    async getTienIch(req, res) {
        try {
            const data = await PhongTroModel.getTienIch();
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = phongTroController;
