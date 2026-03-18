const { query } = require("../db");
const { sendEmail } = require("../utils/emailService");

const adminController = {
    // Thống kê doanh thu phí sàn (5%) theo tháng
    async getRevenueStats(req, res) {
        try {
            // Lấy dữ liệu 6 tháng gần nhất
            const sql = `
                SELECT 
                    FORMAT(NgayDat, 'MM/yyyy') as month,
                    SUM(CAST(SoTien * 0.05 AS DECIMAL(18,0))) as revenue,
                    COUNT(*) as totalBookings
                FROM DatPhong
                WHERE (TrangThai = N'Đã duyệt' OR TrangThai = N'Đã đặt')
                  AND (TrangThaiThanhToan = N'Đã thanh toán' OR TrangThaiThanhToan = N'Chờ hoàn tiền (Máy rút)')
                  AND NgayDat >= DATEADD(month, -6, GETDATE())
                GROUP BY FORMAT(NgayDat, 'MM/yyyy'), YEAR(NgayDat), MONTH(NgayDat)
                ORDER BY YEAR(NgayDat) ASC, MONTH(NgayDat) ASC
            `;
            
            const stats = await query(sql);
            
            // Tính toán KPI
            const totalRevenueResult = await query(`
                SELECT SUM(CAST(SoTien * 0.05 AS DECIMAL(18,0))) as total 
                FROM DatPhong 
                WHERE (TrangThai = N'Đã duyệt' OR TrangThai = N'Đã đặt')
                  AND (TrangThaiThanhToan = N'Đã thanh toán' OR TrangThaiThanhToan = N'Chờ hoàn tiền (Máy rút)')
            `);
            
            const totalRevenue = totalRevenueResult[0].total || 0;
            
            res.json({
                success: true,
                data: stats,
                totalRevenue
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Danh sach bai dang phong cua chu tro (Admin)
    async getRoomPosts(req, res) {
        try {
            const data = await query(`
                SELECT 
                    pt.ID_Phong,
                    pt.TieuDe,
                    pt.Gia,
                    pt.DienTich,
                    pt.TrangThai,
                    pt.NgayDang,
                    pt.DiaChiChiTiet,
                    tk.ID_TaiKhoan,
                    tk.HoTen AS TenChuTro,
                    tk.Email AS EmailChuTro,
                    lp.TenLoai AS TenLoaiPhong,
                    (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = pt.ID_Phong) AS AnhDaiDien
                FROM PhongTro pt
                LEFT JOIN TaiKhoan tk ON pt.ID_TaiKhoan = tk.ID_TaiKhoan
                LEFT JOIN LoaiPhong lp ON pt.ID_LoaiPhong = lp.ID_LoaiPhong
                ORDER BY pt.NgayDang DESC, pt.ID_Phong DESC
            `);

            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Duyet / Tu choi / An / Bo an / Go bai dang phong cua chu tro (Admin)
    async moderateRoomPost(req, res) {
        try {
            const idPhong = parseInt(req.params.id, 10);
            const { action } = req.body;

            if (!idPhong || Number.isNaN(idPhong)) {
                return res.status(400).json({ success: false, message: "ID phòng không hợp lệ!" });
            }

            const normalizedAction = String(action || "").trim().toLowerCase();
            let nextStatus = null;

            if (normalizedAction === 'duyet' || normalizedAction === 'duyệt' || normalizedAction === 'approve') {
                nextStatus = 'Còn trống';
            }
            if (normalizedAction === 'tu-choi' || normalizedAction === 'tuchoi' || normalizedAction === 'từ chối' || normalizedAction === 'reject') {
                nextStatus = 'Đã gỡ';
            }

            if (normalizedAction === 'an' || normalizedAction === 'ẩn' || normalizedAction === 'hide') {
                nextStatus = 'Đã ẩn';
            }
            if (normalizedAction === 'go' || normalizedAction === 'gỡ' || normalizedAction === 'remove') {
                nextStatus = 'Đã gỡ';
            }
            if (
                normalizedAction === 'bo-an' ||
                normalizedAction === 'boan' ||
                normalizedAction === 'bỏ ẩn' ||
                normalizedAction === 'unhide' ||
                normalizedAction === 'restore'
            ) {
                nextStatus = 'Còn trống';
            }

            if (!nextStatus) {
                return res.status(400).json({ success: false, message: "Action không hợp lệ. Hỗ trợ: duyệt, từ chối, ẩn, bỏ ẩn, gỡ." });
            }

            const found = await query(`
                SELECT TOP 1
                    pt.ID_Phong,
                    pt.TieuDe,
                    pt.TrangThai,
                    tk.HoTen AS TenChuTro,
                    tk.Email AS EmailChuTro
                FROM PhongTro pt
                LEFT JOIN TaiKhoan tk ON pt.ID_TaiKhoan = tk.ID_TaiKhoan
                WHERE pt.ID_Phong = ${idPhong}
            `);
            if (found.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy bài đăng phòng!" });
            }

            const post = found[0];
            const prevStatus = (post.TrangThai || '').trim();
            const isPendingPost = prevStatus === 'Chờ duyệt';
            const shouldNotifyByTransition = isPendingPost && (nextStatus === 'Còn trống' || nextStatus === 'Đã gỡ');

            await query(`UPDATE PhongTro SET TrangThai = N'${nextStatus}' WHERE ID_Phong = ${idPhong}`);

            if (shouldNotifyByTransition && post.EmailChuTro) {
                try {
                    const isApproved = nextStatus === 'Còn trống';
                    const subject = isApproved
                        ? 'Bài đăng phòng của bạn đã được duyệt'
                        : 'Bài đăng phòng của bạn không được duyệt';

                    const html = `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">
                            <h2 style="color: #2563EB; margin-bottom: 12px;">OZIC HOUSE - Thông báo duyệt bài đăng</h2>
                            <p>Xin chào <strong>${post.TenChuTro || 'Chủ trọ'}</strong>,</p>
                            <p>
                                Bài đăng <strong>#${post.ID_Phong} - ${post.TieuDe || 'Phòng trọ của bạn'}</strong>
                                đã được quản trị viên xử lý với kết quả:
                                <strong style="color: ${isApproved ? '#059669' : '#DC2626'};"> ${isApproved ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}</strong>.
                            </p>
                            ${isApproved
                                ? '<p>Bài đăng của bạn hiện đã có thể hiển thị trên hệ thống.</p>'
                                : '<p>Vui lòng kiểm tra và cập nhật lại nội dung bài đăng trước khi gửi duyệt lại.</p>'}
                            <p style="margin-top: 20px;">Trân trọng,<br/><strong>OZIC HOUSE</strong></p>
                        </div>
                    `;

                    await sendEmail(post.EmailChuTro, subject, html);
                } catch (mailErr) {
                    console.error('[Email] Failed to send room moderation email:', mailErr.message || mailErr);
                }
            }

            res.json({ success: true, message: `Đã cập nhật trạng thái bài đăng: ${nextStatus}` });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = adminController;
