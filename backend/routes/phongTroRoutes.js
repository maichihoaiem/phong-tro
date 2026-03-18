// =============================================
// Routes: PhongTro
// =============================================
const express = require("express");
const router = express.Router();
const phongTroController = require("../controllers/phongTroController");
const auth = require("../middleware/auth");
const { query } = require("../db");
const fs = require('fs');
const path = require('path');

// API Cong khai (Khong can dang nhap)
router.get("/", phongTroController.getAll);

// ENDPOINT MOI SAU / CUA GET ALL: Phan phoi hinh anh tu duong dan cuc bo (D:\...) tren may chu
router.get("/image/:idPhong", async (req, res) => {
    try {
        const idPhong = req.params.idPhong;
        // Lay hinh anh dau tien cua phong (AnhDaiDien)
        const result = await query(`SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = ${idPhong}`);

        if (result.length > 0 && result[0].DuongDanAnh) {
            // Xoa bo dau ngoac kep thua neu co trong CSDL, vi du '"D:\HinhAnh.jpg"' -> 'D:\HinhAnh.jpg'
            let filePath = result[0].DuongDanAnh.replace(/^"|"$/g, '');

            // Kiem tra xem file co ton tai tren may khong
            if (fs.existsSync(filePath)) {
                return res.sendFile(path.resolve(filePath));
            }
        }

        // Neu khong co anh hoac loi lay file thi goi public placeholder hoac 404
        res.status(404).json({ success: false, message: "Khong tim thay anh" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API phu thuoc (Loai phong, Tien ich) - Dat TRUOC /:id de khong bi shadow
router.get("/danh-muc/loai-phong", phongTroController.getLoaiPhong);
router.get("/danh-muc/tien-ich", phongTroController.getTienIch);

router.get("/:id", phongTroController.getById);

// API Yeu cau dang nhap va quyen Chu Tro (ID_VaiTro = 2)
router.post("/", auth.requireLogin, auth.requireRole(2), phongTroController.create);
router.put("/:id", auth.requireLogin, auth.requireRole(2), phongTroController.update);
router.put("/:id/restore-status", auth.requireLogin, auth.requireRole(2), phongTroController.restoreStatus);
router.delete("/:id", auth.requireLogin, auth.requireRole(2), phongTroController.delete);
router.get("/chu-tro/danh-sach", auth.requireLogin, auth.requireRole(2), phongTroController.getMyRooms);



module.exports = router;
