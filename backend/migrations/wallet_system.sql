-- Migration script to add Wallet system

-- 1. Add SoDu column to TaiKhoan (for landlords)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TaiKhoan') AND name = 'SoDu')
BEGIN
    ALTER TABLE TaiKhoan ADD SoDu DECIMAL(18, 0) DEFAULT 0;
END
GO

-- 2. Update existing landlords to have 0 balance
UPDATE TaiKhoan SET SoDu = 0 WHERE SoDu IS NULL;
GO

-- 3. Create LichSuVi table (Transaction History)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('LichSuVi') AND type = 'U')
BEGIN
    CREATE TABLE LichSuVi (
        ID_LichSu INT PRIMARY KEY IDENTITY(1,1),
        ID_TaiKhoan INT NOT NULL,
        SoTien DECIMAL(18, 0) NOT NULL,
        LoaiGiaoDich NVARCHAR(50) NOT NULL, -- 'Cộng' (Booking), 'Trừ' (Withdrawal)
        NoiDung NVARCHAR(500),
        NgayGiaoDich DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
    );
END
GO

-- 4. Create RutTien table (Withdrawal Requests)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('RutTien') AND type = 'U')
BEGIN
    CREATE TABLE RutTien (
        ID_RutTien INT PRIMARY KEY IDENTITY(1,1),
        ID_TaiKhoan INT NOT NULL,
        SoTien DECIMAL(18, 0) NOT NULL,
        TenNganHang NVARCHAR(100),
        SoTaiKhoan VARCHAR(50),
        ChuTaiKhoan NVARCHAR(100),
        TrangThai NVARCHAR(50) DEFAULT N'Chờ duyệt', -- 'Chờ duyệt', 'Đã duyệt', 'Từ chối'
        NgayYeuCau DATETIME DEFAULT GETDATE(),
        NgayXuLy DATETIME,
        GhiChuAdmin NVARCHAR(500),
        FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
    );
END
GO
