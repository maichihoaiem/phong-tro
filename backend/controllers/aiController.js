const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PhongTroModel = require("../models/PhongTroModel");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let groq;
const MAX_HISTORY_MESSAGES = 30;

const normalizeText = (text = "") =>
    String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const parseVndAmount = (rawAmount, rawUnit = "") => {
    if (!rawAmount) return null;

    let amountText = String(rawAmount).trim().replace(/\s+/g, "");
    const unitText = String(rawUnit || "").trim();

    if (amountText.includes(",") && amountText.includes(".")) {
        amountText = amountText.replace(/\./g, "").replace(/,/g, ".");
    } else if (amountText.includes(",")) {
        amountText = amountText.replace(/,/g, ".");
    }

    const amount = Number(amountText);
    if (!Number.isFinite(amount)) return null;

    if (/^(trieu|tr|m)$/.test(unitText)) return Math.round(amount * 1_000_000);
    if (/^(nghin|ngan|k)$/.test(unitText)) return Math.round(amount * 1_000);
    return Math.round(amount);
};

const matchByNormalizedIncludes = (names = [], text = "") => {
    const normalizedText = normalizeText(text);
    return [...new Set(
        (names || []).filter(Boolean).filter((name) => normalizedText.includes(normalizeText(name)))
    )];
};

const extractLocationKeywords = (message = "") => {
    const text = normalizeText(message);
    const pick = (regex) => {
        const match = text.match(regex);
        return match?.[1]?.trim() || "";
    };

    return {
        provinceKeyword: pick(/(?:tinh|thanh pho|tp)\s+([a-z0-9\s]+)/),
        districtKeyword: pick(/(?:quan|huyen|q\.|h\.)\s+([a-z0-9\s]+)/),
        wardKeyword: pick(/(?:phuong|xa|p\.|x\.)\s+([a-z0-9\s]+)/)
    };
};

const extractPriceRange = (message = "") => {
    const text = normalizeText(message);

    const rangePatterns = [
        /(?:tu|khoang)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)?\s*(?:den|toi|-)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)?/,
        /(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)?\s*-\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)?/
    ];

    for (const pattern of rangePatterns) {
        const match = text.match(pattern);
        if (match) {
            const first = parseVndAmount(match[1], match[2]);
            const second = parseVndAmount(match[3], match[4]);
            if (first !== null && second !== null) {
                return {
                    minPrice: Math.min(first, second),
                    maxPrice: Math.max(first, second)
                };
            }
        }
    }

    const maxMatch = text.match(/(?:duoi|nho hon|it hon|toi da|khong qua|<=?)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)?/);
    if (maxMatch) {
        const maxPrice = parseVndAmount(maxMatch[1], maxMatch[2]);
        if (maxPrice !== null) {
            return { minPrice: null, maxPrice };
        }
    }

    const minMatch = text.match(/(?:tren|lon hon|it nhat|toi thieu|>=?)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|ngan|k)?/);
    if (minMatch) {
        const minPrice = parseVndAmount(minMatch[1], minMatch[2]);
        if (minPrice !== null) {
            return { minPrice, maxPrice: null };
        }
    }

    return { minPrice: null, maxPrice: null };
};

const extractLocationConstraint = (message = "", rooms = [], fallbackLocation = null) => {
    const text = normalizeText(message);
    const hasNearbyIntent = /(gan day|gan toi|quanh day|xung quanh|gan khu vuc nay)/.test(text);
    const hasRoomSearchIntent = /(tim|goi y|phong|tro|gia|duoi|tren|khoang|tu|den|trieu|nghin|k\b|m\b|dien tich|quan|huyen|tinh|thanh pho|khu vuc)/.test(text);

    const provinces = [...new Set(rooms.map(r => r?.TenTinhThanh).filter(Boolean))];
    const districts = [...new Set(rooms.map(r => r?.TenQuanHuyen).filter(Boolean))];
    const wards = [...new Set(rooms.map(r => r?.TenPhuongXa).filter(Boolean))];

    let matchedProvinces = matchByNormalizedIncludes(provinces, text);
    let matchedDistricts = matchByNormalizedIncludes(districts, text);
    let matchedWards = matchByNormalizedIncludes(wards, text);

    const { provinceKeyword, districtKeyword, wardKeyword } = extractLocationKeywords(message);

    if (provinceKeyword) {
        matchedProvinces = [...new Set([
            ...matchedProvinces,
            ...matchByNormalizedIncludes(provinces, provinceKeyword)
        ])];
    }
    if (districtKeyword) {
        matchedDistricts = [...new Set([
            ...matchedDistricts,
            ...matchByNormalizedIncludes(districts, districtKeyword)
        ])];
    }
    if (wardKeyword) {
        matchedWards = [...new Set([
            ...matchedWards,
            ...matchByNormalizedIncludes(wards, wardKeyword)
        ])];
    }

    const hasExplicitLocation = matchedProvinces.length > 0 || matchedDistricts.length > 0 || matchedWards.length > 0;

    if (hasExplicitLocation) {
        return {
            provinces: matchedProvinces,
            districts: matchedDistricts,
            wards: matchedWards,
            nearby: hasNearbyIntent,
            usedFallback: false
        };
    }

    if (fallbackLocation && (hasNearbyIntent || hasRoomSearchIntent)) {
        return {
            provinces: fallbackLocation.provinces || [],
            districts: fallbackLocation.districts || [],
            wards: fallbackLocation.wards || [],
            nearby: hasNearbyIntent,
            usedFallback: true
        };
    }

    return {
        provinces: [],
        districts: [],
        wards: [],
        nearby: hasNearbyIntent,
        usedFallback: false
    };
};

const aiController = {
    analyzeReport: async (req, res) => {
        try {
            const { reason, description, imageUrl, roomTitle, hostName } = req.body;

            if (!process.env.GROQ_API_KEY) {
                return res.status(500).json({ success: false, message: "GROQ_API_KEY chưa được cấu hình." });
            }

            if (!groq) {
                groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            }

            const prompt = `Bạn là một chuyên gia quản lý sàn giao dịch bất động sản chuyên nghiệp.
Hãy phân tích báo cáo vi phạm sau đây và đưa ra đề xuất cho Admin:
- Lý do báo cáo: ${reason}
- Mô tả từ người dùng: ${description || "Không có mô tả"}
- Bài đăng bị báo cáo: ${roomTitle}
- Chủ nhà: ${hostName}
${imageUrl ? ` - Ảnh minh chứng (link): ${imageUrl}` : ""}

Yêu cầu:
1. Đưa ra Quyết định: "DUYỆT PHẠT" (nếu vi phạm rõ ràng hoặc lý do hợp lý) hoặc "BỎ QUA" (nếu thiếu bằng chứng hoặc mô tả không rõ ràng).
2. Giải thích lý do ngắn gọn (tối đa 2 câu).
3. Đề xuất mức độ ưu tiên xử lý (Thấp, Trung bình, Cao).

Luôn luôn trả về kết quả dưới định dạng JSON duy nhất như sau, không được thêm văn bản thừa:
{
  "decision": "DUYỆT PHẠT" | "BỎ QUA",
  "reasoning": "...",
  "priority": "..."
}`;

            const response = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                max_tokens: 500,
                response_format: { type: "json_object" }
            });

            const aiData = JSON.parse(response.choices[0].message.content);
            res.json({ success: true, aiData });
        } catch (error) {
            console.error("Groq Analyze Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    chat: async (req, res) => {
        try {
            console.log("📨 [AI Chat] Request received:", req.body.message);
            const { message, history } = req.body;

            if (!process.env.GROQ_API_KEY) {
                return res.status(500).json({ 
                    message: "Hệ thống chưa cấu hình Groq API Key. Vui lòng liên hệ Admin.",
                    error: "MISSING_API_KEY"
                });
            }

            // Khởi tạo Groq client
            if (!groq) {
                groq = new Groq({
                    apiKey: process.env.GROQ_API_KEY
                });
            }

            // 1. Lấy tất cả phòng TỪ DB
            let allRooms = [];
            try {
                // Fetch rooms with landlord info
                const { query } = require("../db");
                allRooms = await query(`
                    SELECT pt.ID_Phong, pt.TieuDe, pt.Gia, pt.DienTich, pt.DiaChiChiTiet,
                           px.TenPhuongXa, qh.TenQuanHuyen, tt.TenTinhThanh,
                           tk.HoTen AS TenChuTro, tk.SoDienThoai AS SDTChuTro,
                           (SELECT TOP 1 DuongDanAnh FROM HinhAnhPhong WHERE ID_Phong = pt.ID_Phong) AS AnhDaiDien
                    FROM PhongTro pt
                    LEFT JOIN PhuongXa px ON pt.ID_PhuongXa = px.ID_PhuongXa
                    LEFT JOIN QuanHuyen qh ON px.ID_QuanHuyen = qh.ID_QuanHuyen
                    LEFT JOIN TinhThanh tt ON qh.ID_TinhThanh = tt.ID_TinhThanh
                    LEFT JOIN TaiKhoan tk ON pt.ID_TaiKhoan = tk.ID_TaiKhoan
                    WHERE pt.TrangThai IS NULL OR pt.TrangThai = N'Còn trống' OR pt.TrangThai = N'Đang trống' OR pt.TrangThai = ''
                    ORDER BY pt.NgayDang DESC
                `);
                
                if (allRooms && allRooms.length > 0) {
                    // Fetch amenities for ALL fetched rooms in one query
                    const roomIds = allRooms.map(r => r.ID_Phong).join(',');
                    const amenities = await query(`
                        SELECT pti.ID_Phong, ti.TenTienIch
                        FROM PhongTro_TienIch pti
                        JOIN TienIch ti ON pti.ID_TienIch = ti.ID_TienIch
                        WHERE pti.ID_Phong IN (${roomIds})
                    `);

                    // Map amenities to rooms
                    allRooms.forEach(room => {
                        room.TienIch = amenities
                            .filter(a => a.ID_Phong === room.ID_Phong)
                            .map(a => a.TenTienIch)
                            .join(', ');
                    });
                }
                console.log(`AI Debug: Fetched ${allRooms.length} rooms with amenities and landlord info`);
            } catch (err) {
                console.error("Error fetching detailed rooms:", err.message);
            }
            
            // 2. Chuẩn bị danh sách phòng chi tiết cho AI tham khảo
            const { minPrice, maxPrice } = extractPriceRange(message);
            const lastLocation = req.session?.aiLastLocation || null;
            const locationConstraint = extractLocationConstraint(message, allRooms || [], lastLocation);

            const filteredRooms = (allRooms || []).filter((room) => {
                const price = Number(room?.Gia);
                if (!Number.isFinite(price)) return false;
                if (minPrice !== null && price < minPrice) return false;
                if (maxPrice !== null && price > maxPrice) return false;

                const byProvince = locationConstraint.provinces.length === 0 || locationConstraint.provinces.includes(room?.TenTinhThanh);
                const byDistrict = locationConstraint.districts.length === 0 || locationConstraint.districts.includes(room?.TenQuanHuyen);
                const byWard = locationConstraint.wards.length === 0 || locationConstraint.wards.includes(room?.TenPhuongXa);
                if (!byProvince || !byDistrict || !byWard) return false;

                return true;
            });

            const hasPriceFilter = minPrice !== null || maxPrice !== null;
            const hasLocationFilter = locationConstraint.provinces.length > 0 || locationConstraint.districts.length > 0 || locationConstraint.wards.length > 0;
            const shouldApplyFilter = hasPriceFilter || hasLocationFilter;
            const roomsForAI = shouldApplyFilter ? filteredRooms : allRooms;

            if (req.session && hasLocationFilter) {
                req.session.aiLastLocation = {
                    provinces: locationConstraint.provinces,
                    districts: locationConstraint.districts,
                    wards: locationConstraint.wards
                };
            }
            const roomList = (roomsForAI && roomsForAI.length > 0) 
                ? roomsForAI.map((r) => {
                    const price = typeof r.Gia === 'number' ? r.Gia : 0;
                    const priceFormatted = price.toLocaleString('vi-VN');
                    const location = [r.TenPhuongXa, r.TenQuanHuyen, r.TenTinhThanh].filter(Boolean).join(', ');
                    const amenitiesStr = r.TienIch ? ` - Tiện ích: ${r.TienIch}` : '';
                    return `- [${r.ID_Phong}] ${r.TieuDe}: ${priceFormatted}đ/tháng, DT ${r.DienTich}m2, KV: ${location}${amenitiesStr}. Liên hệ: ${r.TenChuTro} (${r.SDTChuTro})`;
                }).join('\n')
                : "Hiện chưa có phòng trong hệ thống.";

            // Chuẩn bị system prompt chuyên nghiệp
            const context = `Bạn là trợ lý Ozic House.
Nhiệm vụ: Tư vấn phòng từ danh sách THỰC TẾ.

QUY TẮC BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
1. ĐỐI VỚI TÌM KIẾM THÔNG THƯỜNG: 
   - BẮT ĐẦU bằng câu: "Tôi đã tìm thấy các phòng trọ [Khu vực/Yêu cầu] cho bạn rồi đây:"
   - Sau đó liệt kê các link: /phong-tro/[ID]
   - TUYỆT ĐỐI KHÔNG ghi thêm bất kỳ văn bản nào khác.
2. ĐỐI VỚI YÊU CẦU SO SÁNH PHÒNG:
   - Bạn ĐƯỢC PHÉP viết dài hơn để so sánh các phòng về: **Giá, Diện tích, Tiện ích, Vị trí**.
   - Trình bày so sánh theo dạng danh sách gạch đầu dòng rõ ràng, ngắn gọn.
   - Luôn kết thúc bằng việc liệt kê các link /phong-tro/[ID] của các phòng được so sánh để hiện Card.
   - QUAN TRỌNG: Chỉ so sánh các phòng có cùng khu vực (Quận, Tỉnh) mà khách yêu cầu.
3. QUY TẮC ĐỊA LÝ (CỰC KỲ QUAN TRỌNG):
    - Khi khách hỏi ở một **Tỉnh/Thành phố**, **Quận/Huyện** hoặc **Phường/Xã** cụ thể, bạn CHỈ ĐƯỢC PHÉP gợi ý các phòng thuộc đúng khu vực đó.
   - TUYỆT ĐỐI không gợi ý phòng ở Cần Thơ khi khách hỏi ở Hồ Chí Minh (và ngược lại).
   - Nếu trong danh sách không có phòng nào ở khu vực đó, hãy trả lời: "Rất tiếc, hiện tại hệ thống chưa có phòng nào ở [Tên Khu Vực] mà bạn yêu cầu."
4. QUY TẮC GIÁ CẢ (CỰC KỲ QUAN TRỌNG):
   - Khi khách yêu cầu một tầm giá cụ thể (ví dụ: "dưới 2 triệu"), bạn PHẢI so sánh con số thực tế trong danh sách.
   - TUYỆT ĐỐI không gợi ý phòng có giá 4 triệu khi khách yêu cầu "dưới 2 triệu". 
   - "1 triệu" = 1.000.000đ. Hãy dùng tư duy toán học để lọc đúng khoảng giá.
5. ĐỐI VỚI CÁC CÂU HỎI KHÔNG LIÊN QUAN (Chào hỏi, hỏi tên, tán gẫu,...):
   - Bạn hãy trả lời thân thiện, lịch sự.
   - TUYỆT ĐỐI KHÔNG kèm theo bất kỳ Link phòng trọ /phong-tro/[ID] hay bất kỳ gợi ý phòng nào.
6. LUÔN LUÔN kèm theo các link /phong-tro/[ID] CHỈ KHI nó thực sự hỗ trợ cho việc tìm kiếm hoặc so sánh phòng.
7. Nếu không thấy phòng nào phù hợp, trả lời: "Rất tiếc, tôi chưa tìm thấy phòng phù hợp với yêu cầu của bạn."

📋 DANH SÁCH PHÒNG (${roomsForAI?.length || 0} phòng):
${roomList}`;

            // 3. Xử lý lịch sử chat cho Groq
            let messages = [
                {
                    role: "system",
                    content: context
                }
            ];

            const sessionHistory = Array.isArray(req.session?.aiChatHistory)
                ? req.session.aiChatHistory
                : [];

            const incomingHistory = Array.isArray(history)
                ? history
                    .filter(h => h?.role && h?.parts?.[0]?.text)
                    .map(h => ({
                        role: h.role === "model" ? "assistant" : "user",
                        content: String(h.parts[0].text)
                    }))
                : [];

            const normalizedHistory = (sessionHistory.length > 0 ? sessionHistory : incomingHistory)
                .filter(item => item?.role && item?.content)
                .slice(-MAX_HISTORY_MESSAGES);

            messages.push(...normalizedHistory);
            
            // Thêm tin nhắn hiện tại
            messages.push({
                role: "user",
                content: message
            });

            // 4. Gọi Groq API
            console.log("Calling Groq API...");
            const response = await groq.chat.completions.create({
                messages: messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 1000,
            });

            const responseText = response.choices[0]?.message?.content || "Không có phản hồi từ AI";
            console.log("AI Response Text:", responseText);

            const updatedSessionHistory = [
                ...normalizedHistory,
                { role: "user", content: String(message || "") },
                { role: "assistant", content: responseText }
            ].slice(-MAX_HISTORY_MESSAGES);

            if (req.session) {
                req.session.aiChatHistory = updatedSessionHistory;
            }

            res.json({ 
                success: true, 
                reply: responseText,
                suggestedRooms: roomsForAI // Truyền dữ liệu phòng để frontend hiển thị card
            });

        } catch (error) {
            console.error("AI Controller Error:", error);
            res.status(500).json({ message: "AI đang bận, vui lòng thử lại sau.", error: error.message });
        }
    }
};

module.exports = aiController;
