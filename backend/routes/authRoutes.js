// =============================================
// Routes: Auth (Dang ky, Dang nhap, Dang xuat)
// =============================================
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireLogin, requireRole } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getMe);
router.get("/users", requireRole(1), authController.getAllUsers); // Admin only
router.get("/profile", requireLogin, authController.getProfile);
router.put("/profile", requireLogin, authController.updateProfile);
router.put("/change-password", requireLogin, authController.changePassword);

// Quen mat khau
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password", authController.resetPassword);

// Khóa/mở tài khoản (Admin)
router.put("/users/:id/lock", requireRole(1), authController.lockOrUnlockUser);

module.exports = router;
