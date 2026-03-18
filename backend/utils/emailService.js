const nodemailer = require("nodemailer");

// Kiểm tra biến môi trường
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Cảnh báo: EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình trong biến môi trường.");
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Bổ sung timeout để tránh treo app trên Render nếu connect chậm
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000,
    socketTimeout: 10000
});

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
        console.error('- Thông báo:', error.message);
        console.error('- Mã lỗi:', error.code);
        console.error('- Lệnh:', error.command);
        
        if (error.code === 'EAUTH') {
            console.error('👉 Lỗi xác thực: Vui lòng kiểm tra lại EMAIL_USER và EMAIL_PASS (App Password).');
        } else if (error.code === 'ESOCKET') {
            console.error('👉 Lỗi kết nối: Render có thể đang chặn port hoặc mạng không ổn định.');
        }
        
        throw error;
    }
};

module.exports = { sendEmail };

