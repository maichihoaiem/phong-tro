-- =============================================
-- DATABASE: DB_PhongTro
-- Website Tim Kiem & Dat Phong Tro Online
-- 12 bang + du lieu mau
-- =============================================

USE DB_PhongTro;
GO

-- =============================================
-- 1. BANG VaiTro
-- =============================================
CREATE TABLE VaiTro (
    ID_VaiTro INT IDENTITY(1,1) PRIMARY KEY,
    TenVaiTro NVARCHAR(50) NOT NULL
);
GO

-- =============================================
-- 2. BANG TaiKhoan
-- =============================================
CREATE TABLE TaiKhoan (
    ID_TaiKhoan INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    SDT VARCHAR(15),
    AnhDaiDien NVARCHAR(255) DEFAULT '/uploads/default-avatar.png',
    NgayTao DATETIME DEFAULT GETDATE(),
    ID_VaiTro INT NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'active',
    GhiChuKhoa NVARCHAR(255) NULL,
    CONSTRAINT FK_TaiKhoan_VaiTro FOREIGN KEY (ID_VaiTro) REFERENCES VaiTro(ID_VaiTro)
);
GO

-- =============================================
-- 3. BANG TinhThanh
-- =============================================
CREATE TABLE TinhThanh (
    ID_TinhThanh INT IDENTITY(1,1) PRIMARY KEY,
    TenTinhThanh NVARCHAR(100) NOT NULL
);
GO

-- =============================================
-- 4. BANG QuanHuyen
-- =============================================
CREATE TABLE QuanHuyen (
    ID_QuanHuyen INT IDENTITY(1,1) PRIMARY KEY,
    TenQuanHuyen NVARCHAR(100) NOT NULL,
    ID_TinhThanh INT NOT NULL,
    CONSTRAINT FK_QuanHuyen_TinhThanh FOREIGN KEY (ID_TinhThanh) REFERENCES TinhThanh(ID_TinhThanh)
);
GO

-- =============================================
-- 5. BANG PhuongXa
-- =============================================
CREATE TABLE PhuongXa (
    ID_PhuongXa INT IDENTITY(1,1) PRIMARY KEY,
    TenPhuongXa NVARCHAR(100) NOT NULL,
    ID_QuanHuyen INT NOT NULL,
    CONSTRAINT FK_PhuongXa_QuanHuyen FOREIGN KEY (ID_QuanHuyen) REFERENCES QuanHuyen(ID_QuanHuyen)
);
GO

-- =============================================
-- 6. BANG LoaiPhong
-- =============================================
CREATE TABLE LoaiPhong (
    ID_LoaiPhong INT IDENTITY(1,1) PRIMARY KEY,
    TenLoaiPhong NVARCHAR(100) NOT NULL
);
GO

-- =============================================
-- 7. BANG PhongTro
-- =============================================
CREATE TABLE PhongTro (
    ID_PhongTro INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX),
    Gia DECIMAL(12,0) NOT NULL,
    DienTich FLOAT NOT NULL,
    DiaChi NVARCHAR(255) NOT NULL,
    LuotXem INT DEFAULT 0,
    TrangThai NVARCHAR(50) DEFAULT N'Còn trống',
    NgayDang DATETIME DEFAULT GETDATE(),
    ID_TaiKhoan INT NOT NULL,
    ID_LoaiPhong INT NOT NULL,
    ID_PhuongXa INT NOT NULL,
    CONSTRAINT FK_PhongTro_TaiKhoan FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan),
    CONSTRAINT FK_PhongTro_LoaiPhong FOREIGN KEY (ID_LoaiPhong) REFERENCES LoaiPhong(ID_LoaiPhong),
    CONSTRAINT FK_PhongTro_PhuongXa FOREIGN KEY (ID_PhuongXa) REFERENCES PhuongXa(ID_PhuongXa)
);
GO

-- =============================================
-- 8. BANG HinhAnhPhong
-- =============================================
CREATE TABLE HinhAnhPhong (
    ID_HinhAnh INT IDENTITY(1,1) PRIMARY KEY,
    DuongDanAnh NVARCHAR(255) NOT NULL,
    ID_Phong INT NOT NULL,
    CONSTRAINT FK_HinhAnhPhong_PhongTro FOREIGN KEY (ID_Phong) REFERENCES PhongTro(ID_PhongTro)
);
GO

-- =============================================
-- 9. BANG TienIch
-- =============================================
CREATE TABLE TienIch (
    ID_TienIch INT IDENTITY(1,1) PRIMARY KEY,
    TenTienIch NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50)
);
GO

-- =============================================
-- 10. BANG PhongTro_TienIch (bang trung gian)
-- =============================================
CREATE TABLE PhongTro_TienIch (
    ID_PhongTro INT NOT NULL,
    ID_TienIch INT NOT NULL,
    PRIMARY KEY (ID_PhongTro, ID_TienIch),
    CONSTRAINT FK_PT_TienIch_PhongTro FOREIGN KEY (ID_PhongTro) REFERENCES PhongTro(ID_PhongTro),
    CONSTRAINT FK_PT_TienIch_TienIch FOREIGN KEY (ID_TienIch) REFERENCES TienIch(ID_TienIch)
);
GO

-- =============================================
-- 11. BANG DatPhong
-- =============================================
CREATE TABLE DatPhong (
    ID_DatPhong INT IDENTITY(1,1) PRIMARY KEY,
    NgayDat DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(50) DEFAULT N'Chờ xác nhận',
    GhiChu NVARCHAR(MAX),
    ID_TaiKhoan INT NOT NULL,
    ID_PhongTro INT NOT NULL,
    CONSTRAINT FK_DatPhong_TaiKhoan FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan),
    CONSTRAINT FK_DatPhong_PhongTro FOREIGN KEY (ID_PhongTro) REFERENCES PhongTro(ID_PhongTro)
);
GO

-- =============================================
-- 12. BANG YeuThich
-- =============================================
CREATE TABLE YeuThich (
    ID_YeuThich INT IDENTITY(1,1) PRIMARY KEY,
    NgayThem DATETIME DEFAULT GETDATE(),
    ID_TaiKhoan INT NOT NULL,
    ID_PhongTro INT NOT NULL,
    CONSTRAINT FK_YeuThich_TaiKhoan FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan),
    CONSTRAINT FK_YeuThich_PhongTro FOREIGN KEY (ID_PhongTro) REFERENCES PhongTro(ID_PhongTro)
);
GO

-- =============================================
-- DU LIEU MAU
-- =============================================

-- Vai tro
INSERT INTO VaiTro (TenVaiTro) VALUES 
(N'Admin'),
(N'Chủ trọ'),
(N'Người thuê');
GO

-- Tai khoan (MatKhau la hash cua '123456')
INSERT INTO TaiKhoan (HoTen, Email, MatKhau, SDT, ID_VaiTro) VALUES
(N'Admin Hệ Thống', 'admin@phongtro.com', '123456', '0900000001', 1),
(N'Nguyễn Văn A', 'chutro1@gmail.com', '123456', '0901111111', 2),
(N'Trần Thị B', 'chutro2@gmail.com', '123456', '0902222222', 2),
(N'Lê Văn C', 'nguoithue1@gmail.com', '123456', '0903333333', 3),
(N'Phạm Thị D', 'nguoithue2@gmail.com', '123456', '0904444444', 3);
GO

-- Tinh Thanh
INSERT INTO TinhThanh (TenTinhThanh) VALUES
(N'TP. Hồ Chí Minh'),
(N'Hà Nội'),
(N'Đà Nẵng'),
(N'Hậu Giang');
GO

-- Quan Huyen
INSERT INTO QuanHuyen (TenQuanHuyen, ID_TinhThanh) VALUES
-- TP.HCM
(N'Quận 1', 1),
(N'Quận 3', 1),
(N'Quận Bình Thạnh', 1),
(N'Quận Gò Vấp', 1),
(N'Quận Thủ Đức', 1),
-- Ha Noi
(N'Quận Ba Đình', 2),
(N'Quận Hoàn Kiếm', 2),
(N'Quận Cầu Giấy', 2),
-- Da Nang
(N'Quận Hải Châu', 3),
(N'Quận Thanh Khê', 3),
-- Hau Giang
(N'Thành phố Vị Thanh', 4);
GO

-- Phuong Xa
INSERT INTO PhuongXa (TenPhuongXa, ID_QuanHuyen) VALUES
-- Quan 1 (ID=1)
(N'Phường Bến Nghé', 1),
(N'Phường Bến Thành', 1),
(N'Phường Nguyễn Thái Bình', 1),
-- Quan 3 (ID=2)
(N'Phường Võ Thị Sáu', 2),
(N'Phường 1', 2),
-- Binh Thanh (ID=3)
(N'Phường 1', 3),
(N'Phường 2', 3),
-- Go Vap (ID=4)
(N'Phường 1', 4),
(N'Phường 3', 4),
-- Thu Duc (ID=5)
(N'Phường Linh Trung', 5),
(N'Phường Linh Chiểu', 5),
-- Ba Dinh (ID=6)
(N'Phường Cống Vị', 6),
-- Hoan Kiem (ID=7)
(N'Phường Hàng Bạc', 7),
-- Cau Giay (ID=8)
(N'Phường Dịch Vọng', 8),
-- Hai Chau (ID=9)
(N'Phường Hải Châu 1', 9),
-- Thanh Khe (ID=10)
(N'Phường Thanh Khê Đông', 10),
-- Vi Thanh (ID=11)
(N'Phường 1', 11);
GO

-- Loai Phong
INSERT INTO LoaiPhong (TenLoaiPhong) VALUES
(N'Phòng trọ'),
(N'Chung cư mini'),
(N'Nhà nguyên căn'),
(N'Căn hộ'),
(N'Ký túc xá');
GO

-- Tien Ich
INSERT INTO TienIch (TenTienIch, Icon) VALUES
(N'WiFi', 'fa-wifi'),
(N'Máy lạnh', 'fa-snowflake'),
(N'Chỗ để xe', 'fa-motorcycle'),
(N'Tự do giờ giấc', 'fa-clock'),
(N'Gác lửng', 'fa-layer-group'),
(N'WC riêng', 'fa-bath'),
(N'Bếp', 'fa-utensils'),
(N'Ban công', 'fa-door-open'),
(N'Máy giặt', 'fa-tshirt'),
(N'Tủ lạnh', 'fa-box');
GO

-- Phong Tro
INSERT INTO PhongTro (TieuDe, MoTa, Gia, DienTich, DiaChi, LuotXem, TrangThai, ID_TaiKhoan, ID_LoaiPhong, ID_PhuongXa) VALUES
(N'Phòng trọ giá rẻ Quận 1', N'Phòng sạch sẽ, thoáng mát, gần trung tâm. Có ban công rộng, view đẹp. Phù hợp cho sinh viên và người đi làm.', 3500000, 25, N'123 Lê Lai, Phường Bến Thành, Quận 1', 150, N'Còn trống', 2, 1, 2),
(N'Chung cư mini Bình Thạnh', N'Căn hộ mini đầy đủ nội thất, an ninh 24/7. Gần chợ, trường học, bệnh viện.', 5000000, 35, N'456 Điện Biên Phủ, Phường 1, Bình Thạnh', 89, N'Còn trống', 2, 2, 6),
(N'Nhà nguyên căn Gò Vấp', N'Nhà 1 trệt 1 lầu, 2 phòng ngủ, 2 WC. Gần chợ, trường học, khu dân cư an ninh.', 8000000, 60, N'789 Quang Trung, Phường 3, Gò Vấp', 45, N'Còn trống', 3, 3, 9),
(N'Căn hộ Thủ Đức view sông', N'Căn hộ 2 phòng ngủ, full nội thất cao cấp. View sông thoáng mát, hồ bơi, gym.', 12000000, 70, N'101 Võ Văn Ngân, Linh Chiểu, Thủ Đức', 200, N'Còn trống', 3, 4, 11),
(N'KTX giá sinh viên Quận 1', N'Ký túc xá máy lạnh, WiFi miễn phí. An ninh, sạch sẽ, gần các trường ĐH.', 1500000, 15, N'55 Nguyễn Trãi, Phường Bến Thành, Quận 1', 320, N'Còn trống', 2, 5, 2),
(N'Phòng trọ cao cấp Quận 3', N'Phòng mới xây, nội thất hiện đại. Có thang máy, camera an ninh 24/7.', 4500000, 30, N'22 Võ Thị Sáu, Phường Võ Thị Sáu, Quận 3', 78, N'Còn trống', 2, 1, 4),
(N'Phòng trọ sinh viên Hậu Giang', N'Phòng rộng rãi, gần trường đại học Võ Trường Toản, khu vực an ninh.', 1200000, 20, N'Số 1 Đường 3/2', 0, N'Còn trống', 2, 1, 11);
GO

-- Hinh Anh Phong
INSERT INTO HinhAnhPhong (DuongDan, ID_PhongTro) VALUES
('/uploads/phong1_1.jpg', 1),
('/uploads/phong1_2.jpg', 1),
('/uploads/phong1_3.jpg', 1),
('/uploads/phong2_1.jpg', 2),
('/uploads/phong2_2.jpg', 2),
('/uploads/phong3_1.jpg', 3),
('/uploads/phong3_2.jpg', 3),
('/uploads/phong4_1.jpg', 4),
('/uploads/phong4_2.jpg', 4),
('/uploads/phong4_3.jpg', 4),
('/uploads/phong5_1.jpg', 5),
('/uploads/phong6_1.jpg', 6),
('/uploads/phong6_2.jpg', 6),
('/uploads/default-avatar.png', 7);
GO

-- PhongTro_TienIch
INSERT INTO PhongTro_TienIch (ID_PhongTro, ID_TienIch) VALUES
-- Phong 1: WiFi, May lanh, Cho de xe, WC rieng
(1, 1), (1, 2), (1, 3), (1, 6),
-- Phong 2: WiFi, May lanh, Cho de xe, Tu do gio giac, WC rieng, Bep
(2, 1), (2, 2), (2, 3), (2, 4), (2, 6), (2, 7),
-- Phong 3: WiFi, Cho de xe, Tu do gio giac, WC rieng, Bep, Ban cong
(3, 1), (3, 3), (3, 4), (3, 6), (3, 7), (3, 8),
-- Phong 4: WiFi, May lanh, Cho de xe, WC rieng, Bep, Ban cong, May giat, Tu lanh
(4, 1), (4, 2), (4, 3), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10),
-- Phong 5: WiFi, May lanh
(5, 1), (5, 2),
-- Phong 6: WiFi, May lanh, Cho de xe, WC rieng, Gac lung
(6, 1), (6, 2), (6, 3), (6, 5), (6, 6);
GO

-- Dat Phong
INSERT INTO DatPhong (TrangThai, GhiChu, ID_TaiKhoan, ID_PhongTro) VALUES
(N'Chờ xác nhận', N'Tôi muốn xem phòng vào cuối tuần', 4, 1),
(N'Đã xác nhận', N'Dọn vào đầu tháng sau', 4, 2),
(N'Chờ xác nhận', N'Cho tôi hỏi thêm về tiện ích', 5, 3),
(N'Đã hủy', N'Tôi đã tìm được phòng khác', 5, 1);
GO

-- Yeu Thich
INSERT INTO YeuThich (ID_TaiKhoan, ID_PhongTro) VALUES
(4, 1),
(4, 4),
(4, 6),
(5, 2),
(5, 4);
GO

PRINT N'✅ Tạo 12 bảng và dữ liệu mẫu thành công!';
GO
