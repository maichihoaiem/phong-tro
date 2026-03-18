const blogPosts = [
    {
        id: 1,
        title: 'Mẹo tìm phòng trọ nhanh chóng và ưng ý',
        excerpt: 'Các bước đơn giản giúp bạn tìm được phòng ưng ý nhanh nhất, tránh mất thời gian vô ích.',
        image: '/uploads/trocosuong.jpg',
        date: '10/03/2026',
        author: 'Admin OZIC',
        category: 'Kinh nghiệm',
        content: `
            <p>Tìm phòng trọ chưa bao giờ là công việc dễ dàng, đặc biệt là tại các thành phố lớn như Hà Nội hay TP.HCM. Để giúp bạn tiết kiệm thời gian và công sức, OZIC HOUSE xin chia sẻ lộ trình 5 bước tìm phòng "chuẩn chỉnh" nhất.</p>
            
            <h3>1. Xác định nhu cầu và ngân sách</h3>
            <p>Đừng vội vã đi xem phòng ngay. Hãy ngồi lại và liệt kê các tiêu chí: Khu vực mong muốn, giá thuê tối đa, diện tích tối thiểu và các tiện ích bắt buộc (chỗ để xe, máy giặt, giờ giấc tự do...). Việc nhắm trước ngân sách sẽ giúp bạn loại bỏ 70% các lựa chọn không phù hợp.</p>
            
            <h3>2. Tận dụng sức mạnh của công nghệ</h3>
            <p>Thay vì chạy xe ngoài đường dưới nắng nóng để tìm biển treo "Cho thuê phòng", hãy truy cập ngay <strong>OZIC HOUSE</strong>. Với bộ lọc thông minh theo Tỉnh/Thành, Quận/Huyện và khoảng giá, bạn sẽ có ngay danh sách các phòng phù hợp chỉ trong 30 giây.</p>
            
            <h3>3. Kiểm tra thông tin và hình ảnh</h3>
            <p>Hãy ưu tiên các tin đăng có hình ảnh rõ ràng, chi tiết. Đừng ngần ngại gọi điện hỏi thêm về các chi phí phụ (điện, nước, internet, phí dịch vụ) trước khi đến xem trực tiếp để tránh bị "hố".</p>
            
            <h3>4. Đi xem phòng trực tiếp vào "giờ cao điểm"</h3>
            <p>Kinh nghiệm xương máu là hãy đi xem phòng vào buổi trưa hoặc giờ tan tầm. Lúc này bạn sẽ biết được phòng có bị nóng quá không, khu vực xung quanh có ồn ào hay kẹt xe không. Đừng quên kiểm tra kỹ hệ thống điện nước và an ninh của tòa nhà.</p>
            
            <h3>5. Chớp thời cơ nhanh chóng</h3>
            <p>Phòng đẹp giá tốt thường "bay" rất nhanh. Nếu đã thấy ưng ý đến 80-90%, hãy sẵn sàng đặt cọc để giữ chỗ. Tuy nhiên, hãy đảm bảo bạn có giấy biên nhận đặt cọc rõ ràng với đầy đủ thông tin chủ nhà.</p>
            
            <p>Hy vọng những mẹo nhỏ trên sẽ giúp hành trình tìm kiếm "tổ ấm" của bạn trở nên nhẹ nhàng hơn. Chúc bạn sớm tìm được căn phòng như ý tại OZIC HOUSE!</p>
        `
    },
    {
        id: 2,
        title: 'Bí quyết đàm phán giá thuê giúp bạn tiết kiệm hàng triệu đồng',
        excerpt: 'Hướng dẫn cách thương lượng giá thuê để có mức giá tốt nhất mà vẫn làm hài lòng chủ nhà.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
        date: '05/03/2026',
        author: 'Minh Tuấn',
        category: 'Tài chính',
        content: `
            <p>Nhiều người đi thuê phòng thường chấp nhận ngay mức giá chủ nhà đưa ra vì ngại mặc cả. Tuy nhiên, đàm phán giá không phải là "kèo kiệt", mà là tìm kiếm một mức giá công bằng và hợp lý cho cả hai bên. Dưới đây là cách để bạn "deal" giá thành công.</p>
            
            <h3>1. Tìm hiểu mặt bằng giá chung</h3>
            <p>Kiến thức là sức mạnh. Hãy khảo sát giá của ít nhất 3-5 phòng tương tự trong cùng khu vực trên OZIC HOUSE. Nếu giá chủ nhà đưa ra cao hơn mặt bằng chung, bạn đã có một cơ sở vững chắc để bắt đầu cuộc thương lượng.</p>
            
            <h3>2. Khẳng định mình là người thuê "chất lượng"</h3>
            <p>Chủ nhà luôn ưu tiên những người thuê sạch sẽ, ổn định và thanh toán đúng hạn. Hãy giới thiệu ngắn gọn về công việc và lối sống của bạn. Một người thuê tử tế đôi khi đáng giá hơn vài trăm nghìn tiền thuê mỗi tháng trong mắt chủ nhà.</p>
            
            <h3>3. Cam kết thuê dài hạn</h3>
            <p>Nếu bạn dự định ở từ 1 năm trở lên, hãy dùng điều này làm lợi thế. Chủ nhà rất ngại việc phòng bị trống hoặc phải tìm người mới liên tục. Việc cam kết ký hợp đồng dài hạn thường là "chìa khóa" mở ra mức giảm giá từ 5-10%.</p>
            
            <h3>4. Chỉ ra những điểm hạn chế (một cách tinh tế)</h3>
            <p>Nếu phòng có một vài điểm chưa hoàn hảo như bong tróc sơn, thiếu tủ quần áo hay tiền điện hơi cao, hãy nhắc đến chúng một cách nhẹ nhàng. Đây là những lý do hợp lý để bạn đề xuất mức giá thấp hơn hoặc yêu cầu chủ nhà sửa chữa trước khi dọn vào.</p>
            
            <h3>5. Nghệ thuật "Gặp nhau ở giữa"</h3>
            <p>Đàm phán là sự thỏa hiệp. Nếu bạn muốn giảm 500k nhưng chủ nhà chỉ đồng ý giảm 200k, hãy thử đề xuất mức 300k hoặc xin miễn phí tháng đầu tiền gửi xe. Những lợi ích nhỏ cộng lại cũng sẽ giúp bạn tiết kiệm một khoản đáng kể.</p>
            
            <p>Hãy nhớ, thái độ lịch sự và cầu thị luôn mang lại kết quả tốt nhất. Chúc bạn đàm phán thành công!</p>
        `
    },
    {
        id: 3,
        title: 'Cần lưu ý gì khi ký hợp đồng thuê phòng trọ?',
        excerpt: 'Những điều khoản quan trọng và cạm bẫy pháp lý không thể bỏ qua trước khi đặt bút ký.',
        image: '/uploads/rental_contract.png',
        date: '01/03/2026',
        author: 'Luật sư Trần Hiếu',
        category: 'Pháp lý',
        content: `
            <p>Hợp đồng thuê nhà là lá chắn pháp lý quan trọng nhất bảo vệ quyền lợi của bạn. Đừng bao giờ ký kết chỉ vì "tin tưởng lời nói suông". Hãy kiểm tra kỹ 5 hạng mục sau đây để tránh những rắc rối về sau.</p>
            
            <h3>1. Thông tin chủ thể và quyền sở hữu</h3>
            <p>Hãy yêu cầu chủ nhà cho xem CMND/CCCD và bằng chứng họ là chủ sở hữu hoặc có quyền cho thuê lại căn nhà đó. Đã có không ít trường hợp người thuê bị lừa tiền cọc bởi "chủ nhà giả".</p>
            
            <h3>2. Chi tiết về giá và các chi phí phát sinh</h3>
            <p>Hợp đồng cần ghi rõ: Giá thuê cố định trong bao lâu? Tiền cọc là bao nhiêu và điều kiện hoàn cọc? Tiền điện, nước, rác, wifi tính như thế nào? Hãy cảnh giác với các điều khoản "có quyền tăng giá bất cứ lúc nào".</p>
            
            <h3>3. Tình trạng cơ sở vật chất khi bàn giao</h3>
            <p>Hãy lập một danh mục các thiết bị có sẵn (điều hòa, tủ lạnh, giường...) và tình trạng của chúng. Tốt nhất là chụp ảnh lại và đính kèm vào hợp đồng. Điều này giúp bạn tránh bị bắt đền những hư hỏng vốn đã có từ trước.</p>
            
            <h3>4. Quy định về thời hạn và đơn phương chấm dứt hợp đồng</h3>
            <p>Bạn cần biết mình phải báo trước bao nhiêu ngày nếu muốn chuyển đi (thường là 30 ngày) để không bị mất cọc. Ngược lại, chủ nhà cũng phải có trách nhiệm tương tự nếu muốn lấy lại phòng đột ngột.</p>
            
            <h3>5. Quyền riêng tư và sửa chữa</h3>
            <p>Hãy đảm bảo có điều khoản quy định chủ nhà không được tự ý vào phòng khi chưa có sự đồng ý của bạn. Ngoài ra, cần làm rõ ai sẽ chịu trách nhiệm chi phí nếu các thiết bị lớn (như máy lạnh) bị hỏng hóc do hao mòn tự nhiên.</p>
            
            <p>Đừng ngại dành thêm 15 phút để đọc kỹ từng chữ. Một bản hợp đồng rõ ràng sẽ giúp bạn có những ngày tháng sống thoải mái và không lo nghĩ. OZIC HOUSE luôn đồng hành cùng bạn!</p>
        `
    }
];

export default blogPosts;
