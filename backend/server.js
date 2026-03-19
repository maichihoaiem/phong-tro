// =============================================
// Server chinh - Entry Point
// =============================================
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const { connectDB } = require("./db");

const app = express();

// Quan trong: Trust proxy de session hoat dong dung khi chay sau Vercel/Render proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session - Cau hinh cho moi truong proxy (Vercel -> Render)
app.use(session({
    secret: "phongtro_secret_key_2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 ngay
        secure: process.env.NODE_ENV === 'production', // HTTPS only tren production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' cho cross-site proxy
    }
}));

// Serve static files tu frontend
app.use(express.static(path.join(__dirname, "../frontend")));
// Serve folder anh (Dung chung 1 thu muc uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer Configuration (Memory Storage - Upload thủ công lên Cloudinary)
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Dùng memoryStorage thay vì CloudinaryStorage để tránh xung đột thư viện
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// Hàm upload 1 file lên Cloudinary
function uploadToCloudinary(fileBuffer, originalName) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'phong-tro',
                resource_type: 'image',
                public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, "")}`,
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        stream.end(fileBuffer);
    });
}

// Upload API
app.post("/api/upload", upload.array("images", 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: "Khong co file nao!" });
        }

        console.log(`[Upload] Received ${req.files.length} files. Uploading to Cloudinary...`);

        // Upload từng file lên Cloudinary
        const uploadPromises = req.files.map(f => uploadToCloudinary(f.buffer, f.originalname));
        const urls = await Promise.all(uploadPromises);

        console.log("[Upload] Cloudinary URLs:", urls);
        res.json({ success: true, urls });
    } catch (error) {
        console.error("[Upload] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/phong-tro", require("./routes/phongTroRoutes"));
app.use("/api/location", require("./routes/locationRoutes"));
app.use("/api/dat-phong", require("./routes/datPhongRoutes"));
app.use("/api/yeu-thich", require("./routes/yeuThichRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// Ket noi DB va start server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Kết nối server thành công tại cổng ${PORT}`);
    });
}).catch((err) => {

    console.error("Khong the khoi dong server:", err.message);
});