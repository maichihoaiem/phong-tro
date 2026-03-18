const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { requireLogin, requireRole } = require("../middleware/auth");

router.get("/my-wallet", requireLogin, walletController.getMyWallet);
router.post("/withdraw", requireLogin, walletController.requestWithdrawal);

// Admin Routes
router.get("/admin/withdrawals", requireRole(1), walletController.getAllWithdrawals);
router.put("/admin/withdrawals/:id", requireRole(1), walletController.updateWithdrawalStatus);
router.get("/admin/landlords-wallets", requireRole(1), walletController.getAllLandlordWallets);

module.exports = router;
