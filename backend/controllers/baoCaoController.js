const BaoCaoModel = require("../models/BaoCaoModel");
const TaiKhoanModel = require("../models/TaiKhoanModel");

const baoCaoController = {
    // User gửi báo cáo
    async sendReport(req, res) {
        try {
            const { idPhong, idChuTro, lyDo, moTa, hinhAnh } = req.body;
            const idNguoiBaoCao = req.session.user.ID_TaiKhoan;

            if (!idPhong || !lyDo) {
                return res.status(400).json({ success: false, message: "Thiếu thông tin báo cáo!" });
            }

            const exists = await BaoCaoModel.checkExists(idNguoiBaoCao, idPhong);
            if (exists) {
                return res.status(400).json({ success: false, message: "Bạn đã báo cáo phòng này rồi!" });
            }

            const idBaoCao = await BaoCaoModel.create({
                idNguoiBaoCao,
                idPhong,
                idChuTro,
                lyDo,
                moTa,
                hinhAnh
            });

            res.json({ success: true, message: "Báo cáo đã được gửi. Admin sẽ sớm xem xét.", idBaoCao });
        } catch (err) {
            console.error('[sendReport] Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Admin lấy danh sách báo cáo
    async getReports(req, res) {
        try {
            const reports = await BaoCaoModel.getAll();
            res.json({ success: true, data: reports });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Admin xử lý báo cáo
    async handleReport(req, res) {
        try {
            const { idBaoCao, action } = req.body; // action: 'approve' (phạt), 'reject' (bỏ qua)
            
            const report = await BaoCaoModel.getById(idBaoCao);
            if (!report) {
                return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo!" });
            }

            if (action === 'approve') {
                // Tăng số lần báo cáo cho chủ trọ và tự động khóa nếu >= 3
                const isLocked = await TaiKhoanModel.incrementReportCount(report.ID_ChuTro, report.LyDo);
                await BaoCaoModel.updateStatus(idBaoCao, 'Đã xử lý (Phạt)');
                
                res.json({ 
                    success: true, 
                    message: isLocked 
                        ? "Đã duyệt phạt. Tài khoản này đã đạt ngưỡng 3 vi phạm và bị khóa tự động." 
                        : "Đã duyệt phạt cho tài khoản này." 
                });
            } else {
                await BaoCaoModel.updateStatus(idBaoCao, 'Đã bỏ qua');
                res.json({ success: true, message: "Đã bỏ qua báo cáo này." });
            }
        } catch (err) {
            console.error('[handleReport] Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = baoCaoController;
