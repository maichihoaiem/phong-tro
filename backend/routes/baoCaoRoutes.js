const express = require("express");
const router = express.Router();
const baoCaoController = require("../controllers/baoCaoController");
const auth = require("../middleware/auth");

// Người dùng gửi báo cáo
router.post("/send", auth.requireLogin, baoCaoController.sendReport);

// Admin quản lý
router.get("/all", auth.requireLogin, auth.requireRole(1), baoCaoController.getReports);
router.post("/handle", auth.requireLogin, auth.requireRole(1), baoCaoController.handleReport);

module.exports = router;
