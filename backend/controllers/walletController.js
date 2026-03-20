const TaiKhoanModel = require("../models/TaiKhoanModel");
const LichSuViModel = require("../models/LichSuViModel");
const RutTienModel = require("../models/RutTienModel");

function normalizeVietnameseText(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

function detectVietQrBankId(bankName = "") {
    const normalized = normalizeVietnameseText(bankName);
    if (!normalized) return null;

    const bankMatchers = [
        { id: "VCB", keys: ["vietcombank", "vcb", "ngoai thuong"] },
        { id: "ICB", keys: ["vietinbank", "vietin", "icb", "cong thuong"] },
        { id: "BIDV", keys: ["bidv", "dau tu va phat trien"] },
        { id: "VBA", keys: ["agribank", "vba", "nong nghiep"] },
        { id: "MB", keys: ["mbbank", "mb bank", "quan doi", "mb"] },
        { id: "TCB", keys: ["techcombank", "tcb"] },
        { id: "ACB", keys: ["acb", "a chau"] },
        { id: "VPB", keys: ["vpbank", "vpb"] },
        { id: "TPB", keys: ["tpbank", "tpb", "tien phong"] },
        { id: "STB", keys: ["sacombank", "stb", "sai gon thuong tin"] },
        { id: "HDB", keys: ["hdbank", "hdb", "phat trien tphcm"] },
        { id: "VIB", keys: ["vib", "quoc te"] },
        { id: "SHB", keys: ["shb", "sai gon ha noi"] },
        { id: "OCB", keys: ["ocb", "phuong dong"] },
        { id: "MSB", keys: ["msb", "maritime", "hang hai"] },
        { id: "LPB", keys: ["lienvietpostbank", "lien viet", "lpb"] },
        { id: "ABB", keys: ["abbank", "an binh", "abb"] },
        { id: "VCCB", keys: ["vietcapitalbank", "ban viet", "vccb"] },
        { id: "SCB", keys: ["scb", "sai gon"] },
        { id: "EIB", keys: ["eximbank", "eib", "xuat nhap khau"] }
    ];

    for (const bank of bankMatchers) {
        if (bank.keys.some((keyword) => normalized.includes(keyword))) {
            return bank.id;
        }
    }

    return null;
}

function buildVietQrUrl(withdrawal) {
    const bankId = detectVietQrBankId(withdrawal.TenNganHang);
    if (!bankId) {
        return { bankId: null, qrUrl: null, qrNote: null };
    }

    const accountNumber = String(withdrawal.SoTaiKhoan || "").replace(/\s+/g, "");
    const amount = Number(withdrawal.SoTien || 0);
    if (!accountNumber || !amount) {
        return { bankId, qrUrl: null, qrNote: null };
    }

    const transferNote = `RUTTIEN ${withdrawal.ID_RutTien}`;
    const encodedNote = encodeURIComponent(transferNote);
    const encodedName = encodeURIComponent(withdrawal.ChuTaiKhoan || "");
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedNote}&accountName=${encodedName}`;

    return {
        bankId,
        qrUrl,
        qrNote: transferNote
    };
}

const walletController = {
    // Lay thong tin vi cua chu tro
    async getMyWallet(req, res) {
        try {
            const userId = req.session.user.ID_TaiKhoan;
            const user = await TaiKhoanModel.getById(userId);
            const history = await LichSuViModel.getByUserId(userId);
            const withdrawals = await RutTienModel.getByUserId(userId);

            res.json({
                success: true,
                data: {
                    balance: user.SoDu || 0,
                    tenNganHang: user.TenNganHang || '',
                    soTaiKhoan: user.SoTaiKhoan || '',
                    chuTaiKhoan: user.ChuTaiKhoan || '',
                    history,
                    withdrawals
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Yeu cau rut tien
    async requestWithdrawal(req, res) {
        try {
            const userId = req.session.user.ID_TaiKhoan;
            const { soTien, tenNganHang, soTaiKhoan, chuTaiKhoan } = req.body;

            const user = await TaiKhoanModel.getById(userId);
            if ((user.SoDu || 0) < soTien) {
                return res.status(400).json({ success: false, message: "Số dư không đủ để thực hiện yêu cầu này!" });
            }

            // Tao yeu cau rut tien
            await RutTienModel.create(userId, soTien, { tenNganHang, soTaiKhoan, chuTaiKhoan });

            // Tru tam thoi so du (Hoac de Admin tru sau khi duyet - o day minh tru luon cho chac)
            await TaiKhoanModel.updateBalance(userId, -soTien);

            // Luu lich su
            await LichSuViModel.create(userId, soTien, 'Trừ', `Yêu cầu rút tiền về tài khoản ${soTaiKhoan}`);

            res.json({ success: true, message: "Yêu cầu rút tiền của bạn đã được gửi và đang chờ xử lý." });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    //================ ADMINISTRATOR METHODS ================
    
    // Lay tat ca yeu cau rut tien (Admin)
    async getAllWithdrawals(req, res) {
        try {
            const data = await RutTienModel.getAll();
            const mapped = data.map((item) => {
                const qrData = buildVietQrUrl(item);
                return {
                    ...item,
                    VietQrBankId: qrData.bankId,
                    VietQrUrl: qrData.qrUrl,
                    VietQrTransferNote: qrData.qrNote
                };
            });

            res.json({ success: true, data: mapped });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Duyet / Tu choi yeu cau rut tien (Admin)
    async updateWithdrawalStatus(req, res) {
        try {
            const { id } = req.params;
            const { trangThai, ghiChuAdmin } = req.body;

            // Lay thong tin cua yeu cau hien tai
            // NOTE: Can 1 querry de lay thong tin, co the viet truc tiep neu RutTienModel chua co getById
            const { query } = require("../db");
            const rs = await query(`SELECT * FROM RutTien WHERE ID_RutTien = ${id}`);
            if (rs.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu rút tiền!" });
            }
            const withdrawal = rs[0];

            // Neu yeu cau da duoc xu ly roi thi khong cho xu ly lai
            if (withdrawal.TrangThai !== 'Chờ duyệt') {
                return res.status(400).json({ success: false, message: "Yêu cầu này đã được xử lý!" });
            }

            // Cap nhat trang thai
            await RutTienModel.updateStatus(id, trangThai, ghiChuAdmin || '');

            // Neu Admin TỪ CHỐI, tra lai tien vao vi cho chu tro
            if (trangThai === 'Từ chối') {
                await TaiKhoanModel.updateBalance(withdrawal.ID_TaiKhoan, withdrawal.SoTien);
                
                // Luu lich su hoan tien do tu choi rut
                await LichSuViModel.create(
                    withdrawal.ID_TaiKhoan, 
                    withdrawal.SoTien, 
                    'Cộng', 
                    `Hoàn tiền do yêu cầu rút tiền bị từ chối. LBN: ${ghiChuAdmin || 'Không có'}`
                );
            }

            res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Lay danh sach vi cua tat ca chu tro (Admin)
    async getAllLandlordWallets(req, res) {
        try {
            const { query } = require("../db");
            const rs = await query(`
                SELECT tk.ID_TaiKhoan, tk.HoTen, tk.Email, tk.SoDienThoai, 
                       ISNULL(tk.SoDu, 0) as SoDu, 
                       tk.TenNganHang, tk.SoTaiKhoan, tk.ChuTaiKhoan
                FROM TaiKhoan tk
                JOIN VaiTro vt ON tk.ID_VaiTro = vt.ID_VaiTro
                WHERE vt.TenVaiTro = N'Chủ trọ' OR vt.ID_VaiTro = 2
                ORDER BY tk.SoDu DESC
            `);
            res.json({ success: true, data: rs });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = walletController;
