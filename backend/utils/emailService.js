const nodemailer = require("nodemailer");

// Kiểm tra biến môi trường
console.log("📧 [Email Config] EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : "❌ CHƯA CÓ");
console.log("📧 [Email Config] EMAIL_PASS:", process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.length} ký tự` : "❌ CHƯA CÓ");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Chế độ debug để xem chi tiết lỗi trong logs
    debug: true,
    logger: true,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
});

// Xác thực kết nối SMTP khi khởi động
transporter.verify()
    .then(() => console.log("✅ [Email] Kết nối SMTP thành công! Sẵn sàng gửi email."))
    .catch((err) => console.error("❌ [Email] Không thể kết nối SMTP:", err.message, "| Code:", err.code));

/**
 * Gửi email dùng chung
 * @param {string} to Email người nhận
 * @param {string} subject Tiêu đề email
 * @param {string} html Nội dung email (dạng HTML)
 */
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"OZIC HOUSE" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        };

        console.log(`📩 Đang gửi email tới: ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email đã gửi thành công:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Lỗi khi gửi email:');
        console.error('  - Thông báo:', error.message);
        console.error('  - Mã lỗi:', error.code);
        console.error('  - Lệnh:', error.command);
        console.error('  - Full error:', JSON.stringify(error, null, 2));
        throw error;
    }
};

module.exports = { sendEmail, transporter };
