
const DatPhongModel = require("../models/DatPhongModel");
const PhongTroModel = require("../models/PhongTroModel");
const TaiKhoanModel = require("../models/TaiKhoanModel");
const LichSuViModel = require("../models/LichSuViModel");
const { sendEmail } = require("../utils/emailService");

// Hàm hỗ trợ gửi email thông báo cho chủ trọ
const notifyLandlordNewBooking = async (bookingId) => {
    try {
        const booking = await DatPhongModel.getById(bookingId);
        const tenant = await TaiKhoanModel.getById(booking.ID_TaiKhoan);
        const phong = await PhongTroModel.getById(booking.ID_Phong);
        const landlord = await TaiKhoanModel.getById(phong.ID_TaiKhoan);

        if (landlord && landlord.Email) {
            const subject = `🔔 THÔNG BÁO: Bạn có đơn đặt cọc mới cho phòng "${phong.TieuDe}"`;
            const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background: #059669; padding: 20px; text-align: center; color: white;">
                        <h2 style="margin: 0;">NHẬN ĐƯỢC TIỀN CỌC MỚI!</h2>
                    </div>
                    <div style="padding: 24px; color: #374151; line-height: 1.6;">
                        <p>Chào <b>${landlord.HoTen}</b>,</p>
                        <p>Hệ thống Ozic House vừa ghi nhận một giao dịch đặt cọc mới cho phòng của bạn.</p>
                        
                        <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #DCFCE7;">
                            <p style="margin: 5px 0;">🏠 <b>Phòng:</b> ${phong.TieuDe}</p>
                            <p style="margin: 5px 0;">👤 <b>Khách thuê:</b> ${tenant.HoTen}</p>
                            <p style="margin: 5px 0;">📞 <b>SĐT khách:</b> ${tenant.SoDienThoai}</p>
                            <p style="margin: 5px 0;">💰 <b>Số tiền:</b> ${new Intl.NumberFormat('vi-VN').format(booking.SoTien)}đ</p>
                            <p style="margin: 5px 0;">🕒 <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}</p>
                        </div>

                        <p>Vui lòng truy cập trang quản lý để kiểm tra và <b>Xác nhận</b> hoặc <b>Từ chối</b> yêu cầu này sớm nhất có thể.</p>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/quan-ly-dat-phong" style="background: #059669; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">XEM DANH SÁCH YÊU CẦU</a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Trân trọng, Đội ngũ Ozic House</p>
                    </div>
                </div>
            `;
            await sendEmail(landlord.Email, subject, htmlContent);
            console.log(`[Email] Notification sent to landlord ${landlord.Email} for booking ${bookingId}`);
        }
    } catch (err) {
        console.error("[Email] notifyLandlordNewBooking error:", err);
    }
};

const datPhongController = {
    // Dat phong (Nguoi thue)
    async create(req, res) {
        try {
            const { idPhong, ghiChu, loaiDat } = req.body; // loaiDat: 'Coc' hoặc 'Full'

            if (!idPhong || isNaN(idPhong)) {
                return res.status(400).json({ success: false, message: "ID phòng không hợp lệ!" });
            }

            // Lay thong tin phong
            const phong = await PhongTroModel.getById(idPhong);
            if (!phong) return res.status(404).json({ success: false, message: "Không tìm thấy phòng!" });

            if (!req.session.user || !req.session.user.ID_TaiKhoan) {
                return res.status(401).json({ success: false, message: "Bạn cần đăng nhập lại!" });
            }

            // Ngăn chặn chủ trọ tự đặt phòng của chính mình
            if (req.session.user.ID_TaiKhoan === phong.ID_TaiKhoan) {
                return res.status(400).json({ success: false, message: "Bạn không thể đặt phòng của chính mình!" });
            }

            // Bắt buộc cọc 10% giá phòng
            const soTien = Math.round((phong.Gia || 0) * 0.1);
            const loaiDatThucTe = 'Coc'; // Cố định loại đặt là cọc

            // Ma giao dich duy nhat (Bat buoc phai co cho SePay)
            const maGiaoDich = `DH${Date.now().toString().slice(-6)}`;

            const idDatPhong = await DatPhongModel.create(
                req.session.user.ID_TaiKhoan,
                idPhong,
                ghiChu,
                loaiDatThucTe,
                soTien,
                maGiaoDich
            );

            // Sinh link VietQR trỏ về Admin (Theo mô hình OZIC)
            // Cố định thông tin Sacombank của Admin để đảm bảo 100% không sai lệch
            const ADMIN_BANK_ID = 'STB'; // Sacombank
            const ADMIN_ACCOUNT_NO = '070133264971';
            const ADMIN_ACCOUNT_NAME = encodeURIComponent('MAI CHI HOAI EM');

            const qrUrl = `https://img.vietqr.io/image/${ADMIN_BANK_ID}-${ADMIN_ACCOUNT_NO}-compact2.png?amount=${soTien}&addInfo=${maGiaoDich}&accountName=${ADMIN_ACCOUNT_NAME}`;

            res.json({
                success: true,
                message: "Tạo yêu cầu đặt phòng thành công!",
                data: {
                    idDatPhong,
                    maGiaoDich,
                    soTien: Number(soTien),
                    qrUrl
                }
            });
        } catch (err) {
            console.error("Create Booking Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Gia lap Webhook nhan tien (Debug/Demo)
    async simulatePayment(req, res) {
        try {
            const { maGiaoDich } = req.body;
            const booking = await DatPhongModel.getByMaGiaoDich(maGiaoDich);

            if (!booking) {
                return res.status(404).json({ success: false, message: "Khong tim thay giao dich!" });
            }

            if (booking.TrangThaiThanhToan === 'Đã thanh toán') {
                return res.json({ success: true, message: "Giao dich nay da duoc thanh toan truoc do." });
            }

            // Cap nhat trang thai thanh toan va trang thai don hang
            await DatPhongModel.updatePaymentStatus(booking.ID_DatPhong, 'Đã thanh toán', 'Chờ xác nhận');
            
            // Tự động ẩn phòng (đổi sang Đã cọc) để tránh người khác đặt trùng
            await PhongTroModel.updateStatus(booking.ID_Phong, 'Đã cọc');

            // Gửi mail thông báo cho chủ trọ
            await notifyLandlordNewBooking(booking.ID_DatPhong);

            res.json({ success: true, message: "Xác nhận thanh toán THÀNH CÔNG (Giả lập)!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay danh sach dat phong cua nguoi thue
    async getMyBookings(req, res) {
        try {
            const data = await DatPhongModel.getByUser(req.session.user.ID_TaiKhoan);
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay danh sach yeu cau dat phong (Chu tro)
    async getBookingRequests(req, res) {
        try {
            console.log("Fetching Booking Requests for Owner:", req.session.user?.ID_TaiKhoan);
            const data = await DatPhongModel.getByOwner(req.session.user.ID_TaiKhoan);
            console.log(`Found ${data.length} requests.`);
            res.json({ success: true, data });
        } catch (err) {
            console.error("Get Booking Requests Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Duyet/Tu choi dat phong (Chu tro)
    async updateStatus(req, res) {
        try {
            const { trangThai } = req.body;
            const id = req.params.id;
            console.log(`[UpdateStatus] Request - BookingID: ${id}, NewStatus: ${trangThai}`);

            // Lay thong tin dat phong de kiem tra thanh toan
            const currentBooking = await DatPhongModel.getById(id);
            if (!currentBooking) {
                return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu đặt phòng!" });
            }

            // Neu muon duyet/xac nhan thi phai thanh toan roi
            if ((trangThai === 'Đã duyệt' || trangThai === 'Xác nhận' || trangThai === 'Đã đặt') &&
                (currentBooking.TrangThaiThanhToan || '').trim() !== 'Đã thanh toán') {
                return res.status(400).json({ success: false, message: "Yêu cầu này chưa được thanh toán, không thể xác nhận!" });
            }

            // Cap nhat trang thai DatPhong
            await DatPhongModel.updateStatus(id, trangThai);

            // Neu Chu tro xac nhan da nhan tien (Đã đặt) hoac da duyet -> Chuyen phong sang 'Đã cho thuê'
            if (trangThai === 'Đã duyệt' || trangThai === 'Xác nhận' || trangThai === 'Đã đặt') {
                const currentBooking = await DatPhongModel.getById(id);
                console.log(`[UpdateStatus] Found Booking Data:`, JSON.stringify(currentBooking));

                if (currentBooking && currentBooking.ID_Phong) {
                    console.log(`[UpdateStatus] Triggering Room ${currentBooking.ID_Phong} status update to 'Đã cho thuê'`);
                    await PhongTroModel.updateStatus(currentBooking.ID_Phong, 'Đã cho thuê');

                    // --- CỘNG TIỀN VÀO VÍ CHỦ TRỌ ---
                    const phong = await PhongTroModel.getById(currentBooking.ID_Phong);
                    if (phong && phong.ID_TaiKhoan) {
                        try {
                            // Tính phí nền tảng 5%
                            const phiDichVu = Math.round(currentBooking.SoTien * 0.05);
                            const thucNhan = currentBooking.SoTien - phiDichVu;

                            await TaiKhoanModel.updateBalance(phong.ID_TaiKhoan, thucNhan);
                            await LichSuViModel.create(
                                phong.ID_TaiKhoan,
                                thucNhan,
                                'Cộng',
                                `Nhận cọc phòng #${id}. Đã trừ 5% phí nền tảng (${new Intl.NumberFormat('vi-VN').format(phiDichVu)}đ)`
                            );
                            console.log(`[UpdateStatus] Wallet updated for landlord ${phong.ID_TaiKhoan}: +${thucNhan} (Fee: ${phiDichVu})`);
                        } catch (err) {
                            console.error(`[UpdateStatus] Failed to update balance for landlord ${phong.ID_TaiKhoan}`, err);
                        }
                    }

                    // Tu dong tu choi các yêu cầu khác cùng phòng
                    console.log(`[UpdateStatus] Rejecting other bookings for room ${currentBooking.ID_Phong}`);
                    await DatPhongModel.rejectOtherBookings(currentBooking.ID_Phong, id);

                    console.log(`[UpdateStatus] Room and Bookings synchronized successfully.`);
                } else {
                    console.warn(`[UpdateStatus] Warning: No Room ID found for Booking ${id}`);
                }
            }

            // Neu Tu choi thi set trang thai thanh toan la 'Chờ hoàn tiền (Chưa có STK)' 
            // và MỞ LẠI PHÒNG thành 'Còn trống'
            if (trangThai === 'Từ chối') {
                console.log(`[UpdateStatus] Rejecting Booking ${id}, setting payment status to 'Chờ hoàn tiền (Chưa có STK)' and opening room ${currentBooking.ID_Phong}`);
                await DatPhongModel.updatePaymentStatus(id, 'Chờ hoàn tiền (Chưa có STK)', 'Từ chối');
                await PhongTroModel.updateStatus(currentBooking.ID_Phong, 'Còn trống');
            }

            // --- GỬI EMAIL THÔNG BÁO CHO NGƯỜI THUÊ ---
            try {
                const tenant = await TaiKhoanModel.getById(currentBooking.ID_TaiKhoan);
                const phong = await PhongTroModel.getById(currentBooking.ID_Phong);
                
                if (tenant && tenant.Email) {
                    let subject = "";
                    let htmlContent = "";

                    if (trangThai === 'Đã duyệt' || trangThai === 'Xác nhận' || trangThai === 'Đã đặt') {
                        subject = "📢 Thông báo: Đơn đặt phòng của bạn đã được PHÊ DUYỆT";
                        htmlContent = `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                                <div style="background: #2563EB; padding: 20px; text-align: center; color: white;">
                                    <h2 style="margin: 0;">CHÚC MỪNG BẠN!</h2>
                                </div>
                                <div style="padding: 24px; color: #374151; line-height: 1.6;">
                                    <p>Chào <b>${tenant.HoTen}</b>,</p>
                                    <p>Chủ trọ đã chính thức <b>PHÊ DUYỆT</b> yêu cầu đặt phòng của bạn.</p>
                                    <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <p style="margin: 5px 0;">🏠 <b>Phòng:</b> ${phong.TieuDe}</p>
                                        <p style="margin: 5px 0;">📍 <b>Địa chỉ:</b> ${phong.DiaChiChiTiet}</p>
                                        <p style="margin: 5px 0;">💰 <b>Số tiền cọc:</b> ${new Intl.NumberFormat('vi-VN').format(currentBooking.SoTien)}đ</p>
                                        <p style="margin: 5px 0;">📋 <b>Trạng thái:</b> Đã xác nhận giữ chỗ</p>
                                    </div>
                                    <p>Bạn có thể liên hệ trực tiếp với chủ trọ để làm thủ tục nhận phòng nhé!</p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Trân trọng, Đội ngũ Ozic House</p>
                                </div>
                            </div>
                        `;
                    } else if (trangThai === 'Từ chối') {
                        subject = "⚠️ Thông báo: Đơn đặt phòng đã bị TỪ CHỐI";
                        htmlContent = `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                                <div style="background: #EF4444; padding: 20px; text-align: center; color: white;">
                                    <h2 style="margin: 0;">THÔNG BÁO TỪ CHỐI</h2>
                                </div>
                                <div style="padding: 24px; color: #374151; line-height: 1.6;">
                                    <p>Chào <b>${tenant.HoTen}</b>,</p>
                                    <p>Rất tiếc, yêu cầu đặt phòng của bạn tại <b>${phong.TieuDe}</b> đã bị từ chối.</p>
                                    
                                    <div style="background: #FFF7ED; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0;">
                                        <p style="margin: 0; color: #9A3412; font-weight: bold;">HƯỚNG DẪN HOÀN TIỀN:</p>
                                        <p style="margin: 5px 0;">Vì bạn đã thanh toán tiền cọc, vui lòng truy cập vào website Ozic House ngay để <b>nhập thông tin tài khoản ngân hàng</b> nhận lại tiền hoàn.</p>
                                    </div>

                                    <div style="text-align: center; margin-top: 30px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="background: #2563EB; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">CẬP NHẬT THÔNG TIN HOÀN TIỀN</a>
                                    </div>
                                    
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Trân trọng, Đội ngũ Ozic House</p>
                                </div>
                            </div>
                        `;
                    }

                    if (subject) {
                        await sendEmail(tenant.Email, subject, htmlContent);
                        console.log(`[Email] Notification sent to ${tenant.Email} for status ${trangThai}`);
                    }
                }
            } catch (mailErr) {
                console.error("[Email] Failed to send notification email:", mailErr);
            }

            res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
        } catch (err) {
            console.error("[updateStatus] Error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Lay tat ca (Admin)
    async getAll(req, res) {
        try {
            const data = await DatPhongModel.getAll();
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Nguoi thue cung cap thong tin hoan tien sau khi bi tu choi
    async provideRefundInfo(req, res) {
        try {
            const { id } = req.params;
            const { stk, nganHang, chuTk } = req.body;

            if (!stk || !nganHang || !chuTk) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin ngân hàng!" });
            }

            await DatPhongModel.updateRefundInfo(id, stk, nganHang, chuTk);
            res.json({ success: true, message: "Gửi thông tin thành công! Admin sẽ sớm hoàn tiền cho bạn." });
        } catch (err) {
            console.error("[provideRefundInfo] Error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Lay danh sach hoan tien cho Admin
    async getAdminRefunds(req, res) {
        try {
            const data = await DatPhongModel.getAdminRefunds();
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Admin xac nhan giai quyet khieu nai
    async resolveDispute(req, res) {
        try {
            const { id } = req.params;
            await DatPhongModel.resolveDispute(id);
            res.json({ success: true, message: "Giai quyet khieu nai thanh cong!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Webhook SePay: Nhận thông báo tiền vào tự động
    async webhookSePay(req, res) {
        try {
            console.log("------------------------------------------");
            console.log("SEPAY WEBHOOK RECEIVED AT:", new Date().toLocaleString());
            console.log("Headers:", JSON.stringify(req.headers));
            console.log("Body:", JSON.stringify(req.body));

            // 1. Kiểm tra mã xác thực (Webhook Token)
            const WEBHOOK_TOKEN = '7PTKIXKWOAU1DNAZJZHXSGJWU7MFYNROLFOJQ5MMPYPDQTRF2HZW4SNDBS9KPIY';

            // SePay có thể gửi "Apikey" hoặc "apikey"
            const authHeader = req.headers['authorization'] || '';
            const receivedToken = authHeader ? authHeader.replace(/Apikey\s+/i, '').trim() : req.headers['x-sepay-token'];

            if (receivedToken !== WEBHOOK_TOKEN) {
                console.log(`❌ AUTH FAILED: Expected "${WEBHOOK_TOKEN}", but got "${receivedToken}"`);
                // Thêm chữ ANTIGRAVITY_CHECK để mình chắc chắn là code này đang chạy
                return res.status(401).json({ success: false, message: "Token không hợp lệ - ANTIGRAVITY_CHECK" });
            }

            const { content, amount } = req.body;
            if (!content) {
                console.log("❌ ERROR: Webhook body missing 'content' field.");
                return res.json({ success: false });
            }

            // 2. Tìm mã giao dịch trong nội dung (ví dụ: DH123456)
            const match = content.match(/DH\d+/i); // Thêm cờ 'i' để ko phân biệt hoa thường
            if (!match) {
                console.log(`❌ NO MATCH: Could not find DH code in content: "${content}"`);
                return res.json({ success: false, message: "Không tìm thấy mã DH" });
            }

            const maGiaoDich = match[0].toUpperCase();
            console.log(`🔍 SEARCHING BOOKING: MaGiaoDich = ${maGiaoDich}`);

            // 3. Tìm đơn đặt phòng tương ứng
            const booking = await DatPhongModel.getByMaGiaoDich(maGiaoDich);

            if (!booking) {
                console.log(`❌ NOT FOUND: No booking found in database for ${maGiaoDich}`);
                return res.json({ success: false });
            }

            console.log(`✅ FOUND BOOKING: ID = ${booking.ID_DatPhong}, Current Status = ${booking.TrangThaiThanhToan}`);

            // Nếu đã thanh toán rồi thì thôi
            if (booking.TrangThaiThanhToan?.trim() === 'Đã thanh toán') {
                console.log("ℹ️ ALREADY PROCESSED: This booking was already marked as paid.");
                return res.json({ success: true, message: "Đã xử lý trước đó" });
            }

            // 4. Cập nhật trạng thái thanh toán
            await DatPhongModel.updatePaymentStatus(booking.ID_DatPhong, 'Đã thanh toán', 'Chờ xác nhận');
            console.log(`✅ DATABASE UPDATED: Booking ${booking.ID_DatPhong} set to 'Đã thanh toán'`);

            // 5. Tự động ẩn phòng (đổi sang Đã cọc)
            await PhongTroModel.updateStatus(booking.ID_Phong, 'Đã cọc');
            console.log(`✅ ROOM HIDDEN: Room ${booking.ID_Phong} set to 'Đã cọc'`);

            // 6. Gửi mail thông báo cho chủ trọ
            await notifyLandlordNewBooking(booking.ID_DatPhong);

            // KHÔNG CỘNG TIỀN VÀO VÍ Ở ĐÂY NỮA, CHỜ CHỦ TRỌ XÁC NHẬN.

            console.log("------------------------------------------");
            res.json({ success: true, message: "Xử lý thanh toán thành công!" });
        } catch (err) {
            console.error("❌ WEBHOOK ERROR:", err);
            res.status(500).json({ success: false });
        }
    }
};

module.exports = datPhongController;
