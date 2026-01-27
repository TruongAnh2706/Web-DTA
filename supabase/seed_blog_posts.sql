
-- Xóa dữ liệu cũ (Tùy chọn, comment lại nếu không muốn xóa)
-- DELETE FROM public.posts;

-- Insert 5 Bài viết mẫu
INSERT INTO public.posts (title, slug, excerpt, content, cover_image, is_published, featured, tags, author_id)
VALUES 
(
    'Bùng Nổ Doanh Thu YouTube 2025: Top 5 Công Cụ Tự Động Hóa Không Thể Thiếu',
    'bung-no-doanh-thu-youtube-2025-top-5-cong-cu-automation',
    'Khám phá cách các YouTuber hàng đầu sử dụng đòn bẩy công nghệ để tiết kiệm 90% thời gian làm việc và tối ưu hóa lợi nhuận.',
    '<p>Trong kỷ nguyên số 2025, làm YouTube bằng "sức trâu" đã không còn là chiến lược thông minh. Những Creator thành công nhất đang sử dụng **đòn bẩy công nghệ** để nhân bản sức lao động của mình.</p>
    
    <h2>1. Công nghệ tự động hóa là gì?</h2>
    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" alt="Technology Automation" style="width: 100%; border-radius: 8px; margin: 20px 0;">
    <p>Thay vì mất hàng giờ để render, upload thủ công, hay tìm kiếm từ khóa, các công cụ Automation giúp bạn xử lý hàng loạt tác vụ chỉ với vài cú click chuột. DTA AutoDown là một ví dụ điển hình cho việc tự động hóa quy trình tải và xử lý video.</p>

    <h2>2. Tại sao bạn cần Tool?</h2>
    <p>Hãy tưởng tượng bạn có thể quản lý 10 kênh YouTube cùng lúc mà chỉ tốn thời gian như quản lý 1 kênh. Đó chính là sức mạnh của công cụ.</p>
    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Data Analytics" style="width: 100%; border-radius: 8px; margin: 20px 0;">
    
    <h2>3. Kết luận</h2>
    <p>Đừng để đối thủ vượt mặt chỉ vì họ biết dùng tool còn bạn thì không.</p>',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    true,
    true,
    ARRAY['Automation', 'YouTube Tools', 'Tech'],
    auth.uid() -- Lưu ý: Cần thay thế bằng UUID cụ thể nếu chạy trực tiếp trong SQL Editor mà không qua App
),
(
    'AI & YouTube: Cuộc Cách Mạng Nội Dung Số',
    'ai-va-youtube-cuoc-cach-mang-noi-dung-so',
    'Trí tuệ nhân tạo (AI) đang thay đổi cách chúng ta sáng tạo video như thế nào? Từ ChatGPT viết kịch bản đến Midjourney tạo Thumbnail.',
    '<p>AI không còn là phim viễn tưởng. Nó đang ở đây, và nó đang giúp các YouTuber kiếm hàng nghìn đô mỗi tháng.</p>
    
    <h2>Sức mạnh của Generative AI</h2>
    <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop" alt="AI Brain" style="width: 100%; border-radius: 8px; margin: 20px 0;">
    <p>Bạn bí ý tưởng? ChatGPT sẽ lo. Bạn không biết thiết kế? Midjourney sẽ vẽ. Bạn ngại thu âm? VALL-E sẽ nói hộ bạn. Rào cản gia nhập ngành sáng tạo nội dung chưa bao giờ thấp đến thế nhờ công nghệ.</p>

    <h2>Đòn bẩy cho người mới</h2>
    <p>Với AI, một người mới bắt đầu có thể tạo ra chất lượng nội dung tương đương một team 5 người chuyên nghiệp.</p>
    <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" alt="AI Future" style="width: 100%; border-radius: 8px; margin: 20px 0;">',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop',
    true,
    false,
    ARRAY['AI', 'ChatGPT', 'Innovation'],
    auth.uid()
),
(
    'Reup YouTube Bền Vững: Giải Pháp Công Nghệ Từ DTA Studio',
    'reup-youtube-ben-vung-giai-phap-cong-nghe',
    'Reup không xấu, nếu bạn biết cách làm đúng. công nghệ lách bản quyền và tối ưu hóa nội dung để kiếm tiền bền vững.',
    '<p>Cộng đồng MMO thường có cái nhìn khắt khe về Reup. Tuy nhiên, Reup thông minh là việc curating (chọn lọc) và editing (biên tập) lại để mang lại giá trị mới.</p>
    
    <h2>Công nghệ "Lách" hay "Tối ưu"?</h2>
    <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" alt="YouTube Shield" style="width: 100%; border-radius: 8px; margin: 20px 0;">
    <p>DTA Studio cung cấp các giải pháp giúp bạn xử lý video gốc, thay đổi MD5, điều chỉnh âm thanh và hình ảnh để tránh các thuật toán quét tự động, đồng thời nâng cao chất lượng video.</p>

    <h2>Quy trình chuẩn</h2>
    <ol>
        <li>Tải video nguồn chất lượng cao.</li>
        <li>Xử lý tự động qua Tool DTA.</li>
        <li>Tối ưu SEO và Upload.</li>
    </ol>
    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" alt="Digital Process" style="width: 100%; border-radius: 8px; margin: 20px 0;">',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
    true,
    false,
    ARRAY['Reup', 'MMO', 'Tips'],
    auth.uid()
),
(
    'Workflow Triệu View: Từ Ý Tưởng Đến Video Hoàn Chỉnh',
    'workflow-trieu-view-tu-y-tuong-den-video',
    'Xây dựng một quy trình làm việc (Workflow) chuẩn chỉnh giúp bạn sản xuất video đều đặn mà không bị burnout.',
    '<p>Sự kiên trì là chìa khóa của YouTube. Nhưng làm sao để kiên trì khi bạn phải làm quá nhiều việc? Câu trả lời là: <strong>Workflow</strong>.</p>
    
    <h2>Bước 1: Nghiên cứu từ khóa</h2>
    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Keyword Research" style="width: 100%; border-radius: 8px; margin: 20px 0;">
    <p>Sử dụng các công cụ như Google Trends, Ahrefs để biết khán giả đang tìm kiếm gì.</p>

    <h2>Bước 2: Sản xuất hàng loạt</h2>
    <p>Đừng làm từng video một. Hãy quay 5 video một lúc, edit 5 video một lúc. Đó là cách các Pro làm việc.</p>
    <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop" alt="Video Production" style="width: 100%; border-radius: 8px; margin: 20px 0;">',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
    true,
    false,
    ARRAY['Workflow', 'Productivity', 'Guide'],
    auth.uid()
),
(
    'Giải Mã Thuật Toán YouTube: Data Là Vua',
    'giai-ma-thuat-toan-youtube-data-la-vua',
    'Đừng đoán mò. Hãy để dữ liệu chỉ đường. Cách sử dụng các công cụ phân tích để hiểu thuật toán đề xuất của YouTube.',
    '<p>Thuật toán YouTube không phải là một chiếc hộp đen bí ẩn nếu bạn biết cách đọc dữ liệu.</p>
    
    <h2>CTR và AVD: Hai chỉ số vàng</h2>
    <img src="https://images.unsplash.com/photo-1543286386-713df548e9cc?q=80&w=2070&auto=format&fit=crop" alt="Analytics Chart" style="width: 100%; border-radius: 8px; margin: 20px 0;">
    <p>Click-Through Rate (CTR) và Average View Duration (AVD) quyết định 80% khả năng video của bạn được đề xuất. Hãy dùng công cụ để A/B test thumbnail và tiêu đề liên tục.</p>

    <h2>Công nghệ Analytics</h2>
    <p>Các dashboard hiện đại cho phép bạn nhìn thấy bức tranh toàn cảnh về hành vi người xem mà YouTube Studio đôi khi không hiển thị rõ ràng.</p>
    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" alt="Data Dashboard" style="width: 100%; border-radius: 8px; margin: 20px 0;">',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2076&auto=format&fit=crop',
    true,
    false,
    ARRAY['Analytics', 'Algorithm', 'Growth'],
    auth.uid()
);
