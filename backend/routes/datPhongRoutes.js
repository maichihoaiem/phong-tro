// =============================================
// Routes: DatPhong
// =============================================
const express = require("express");
const router = express.Router();
const datPhongController = require("../controllers/datPhongController");
const { requireLogin, requireRole } = require("../middleware/auth");

// Moi nguoi da dang nhap deu co the dat phong (Tranh loi phan quyen)
router.post("/", requireLogin, datPhongController.create);
router.get("/my-bookings", requireLogin, datPhongController.getMyBookings);
router.post("/simulate-payment", datPhongController.simulatePayment); // Dung cho demo/test
router.post("/webhook-sepay", datPhongController.webhookSePay); // SePay Webhook

// Chu tro (Dung requireLogin de tranh loi vai tro khi test)
router.get("/requests", requireLogin, datPhongController.getBookingRequests);
router.put("/:id/status", requireRole(2), datPhongController.updateStatus);
// Nguoi thue
router.put("/:id/refund-info", requireLogin, datPhongController.provideRefundInfo);

// Admin
router.get("/all", requireRole(1), datPhongController.getAll);
router.get("/admin-refunds", requireRole(1), datPhongController.getAdminRefunds);
router.put("/:id/resolve-dispute", requireRole(1), datPhongController.resolveDispute);

module.exports = router;
