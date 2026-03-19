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
            console.log(`[getById] Fetching data for room ID: ${id}`);
            const phong = await PhongTroModel.getById(id);
            
            if (!phong) {
                console.log(`[getById] Room not found: ${id}`);
                return res.status(404).json({ success: false, message: "Khong tim thay phong!" });
            }

            // Kiểm tra phân quyền: Nếu là chủ phòng thì cho phép xem mọi trạng thái
            const isOwner = req.session.user && req.session.user.ID_TaiKhoan === phong.ID_TaiKhoan;
            const publicStatuses = ['', 'Còn trống', 'Đang trống'];
            const currentStatus = (phong.TrangThai || '').trim();

            if (!isOwner && !publicStatuses.includes(currentStatus)) {
                console.log(`[getById] Access denied for non-owner. Status: ${currentStatus}`);
                return res.status(404).json({ success: false, message: "Bài đăng chưa được duyệt hoặc không còn hiển thị." });
            }

            // Tang luot xem (chi tang neu khong phai chu phong xem)
            if (!isOwner) {
                await PhongTroModel.increaseView(id);
            }

            // Lay hinh anh va tien ich
            const hinhAnh = await PhongTroModel.getImages(id);
            const tienIch = await PhongTroModel.getAmenities(id);

            console.log(`[getById] Successfully fetched room ${id}. Images: ${hinhAnh.length}, Amenities: ${tienIch.length}`);
            res.json({ success: true, data: { ...phong, hinhAnh, tienIch } });
        } catch (err) {
            console.error(`[getById] Error fetching room ${id}:`, err);
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
            console.log('[Create] Session:', JSON.stringify(req.session?.user || 'NO SESSION'));
            console.log('[Create] Body:', JSON.stringify(req.body));

            if (!req.session || !req.session.user) {
                return res.status(401).json({ success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
            }

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

            console.log('[Create] Data to insert:', JSON.stringify(data));
            const idPhong = await PhongTroModel.create(data);
            console.log('[Create] Created room ID:', idPhong);

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
            console.error('[Create] Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Cap nhat phong (Chu tro)
    async update(req, res) {
        try {
            const id = req.params.id;
            console.log('[Update] Session:', JSON.stringify(req.session?.user || 'NO SESSION'));
            console.log('[Update] Room ID:', id, 'Body:', JSON.stringify(req.body));

            if (!req.session || !req.session.user) {
                return res.status(401).json({ success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
            }

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
            console.log('[Update] Room data updated successfully');

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

            console.log('[Update] Room updated completely');
            res.json({ success: true, message: "Cập nhật phòng thành công!" });
        } catch (err) {
            console.error('[Update] Error:', err);
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
