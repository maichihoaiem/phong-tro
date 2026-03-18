const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Lấy từ .env
        pass: process.env.EMAIL_PASS  // Lấy từ .env (App Password)
    }
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

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail };
