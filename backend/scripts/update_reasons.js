const { getRequest, sql } = require('../db');

async function updateAllLockedAccounts() {
    try {
        const request = await getRequest();
        const reason = "Tài khoản bị báo cáo quá nhiều lần từ nhiều người.";
        
        console.log("Updating all locked accounts to reason:", reason);
        
        const result = await request
            .input('reason', sql.NVarChar, reason)
            .query("UPDATE TaiKhoan SET GhiChuKhoa = @reason, TrangThai = N'đã khóa' WHERE TrangThai = N'locked' OR TrangThai LIKE N'%khóa%' OR TrangThai LIKE N'%Bị khóa%' OR GhiChuKhoa IS NOT NULL");
            
        console.log(`Successfully updated ${result.rowsAffected[0]} accounts.`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating accounts:", err);
        process.exit(1);
    }
}

updateAllLockedAccounts();
