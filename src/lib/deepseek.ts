import { supabase } from "@/integrations/supabase/client";

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const cleanMarkdownSymbols = (text: string): string => {
    return text
        // Xóa block code (```) nếu AI lỡ rào lại
        .replace(/^```[a-z]*\n/gm, '')
        .replace(/```$/gm, '')
        // Trim whitespace thừa
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const generateAppContent = async (
    name: string,
    context: string = '',
    style: string = 'apple', // 'apple', 'notion', 'fun', 'professional'
    language: 'vi' | 'en' = 'vi',
    apiKey?: string
): Promise<string> => {

    if (!apiKey) {
        // Try getting from local storage if not passed specifically
        apiKey = localStorage.getItem('deepseek_api_key') || '';
        if (!apiKey) {
            throw new Error('Missing DeepSeek API Key');
        }
    }

    let styleInstruction = '';
    switch (style) {
        case 'apple':
            styleInstruction = language === 'vi' ? 'Tối giản, Sang trọng (như Apple), dùng từ ngữ cao cấp.' : 'Minimalist, Elegant (Apple-style), premium vocabulary.';
            break;
        case 'notion':
            styleInstruction = language === 'vi' ? 'Chuyên nghiệp, Rõ ràng, dùng nhiều emoji (như Notion), tập trung hiệu quả.' : 'Professional, Clear, Emoji-rich (Notion-style), efficiency-focused.';
            break;
        case 'fun':
            styleInstruction = language === 'vi' ? 'Vui vẻ, Thân thiện (Gen Z), nhiều emoji, năng động.' : 'Fun, Friendly (Gen Z), many emojis, energetic.';
            break;
        case 'professional':
            styleInstruction = language === 'vi' ? 'Doanh nghiệp, Nghiêm túc, Đáng tin cậy, tập trung vào số liệu.' : 'Enterprise, Serious, Trustworthy, data-driven.';
            break;
        default:
            styleInstruction = 'Neutral, informative.';
    }

    const prompt = language === 'vi'
        ? `Đóng vai một chuyên gia Copywriter hàng đầu cho các sản phẩm công nghệ (Tech Product).
Nhiệm vụ: Viết mô tả sản phẩm hấp dẫn cho phần mềm "${name}".

THÔNG TIN ĐẦU VÀO:
- Ý tưởng/Context từ user: "${context || 'Chưa cung cấp'}"
- Phong cách mong muốn: ${styleInstruction}

YÊU CẦU QUAN TRỌNG:
1. "RESEARCH" (Giả lập): Hãy tự suy luận các tính năng cốt lõi thường có của loại phần mềm này nếu user không cung cấp đủ chi tiết.
2. FORMAT (Vô cùng quan trọng): 
   - Sử dụng Markdown chuẩn để trình bày.
   - Tiêu đề chính dùng H2 (##), tiêu đề phụ dùng H3 (###).
   - Dùng Bullet points (-) cho danh sách tính năng.
   - Bôi đậm (**text**) cho các từ khóa quan trọng.
   - Dùng emoji Unicode tinh tế ở tiêu đề hoặc đầu đoạn.
3. CẤU TRÚC NỘI DUNG:
   - ## Giới Thiệu: Hook câu dẫn, nêu vấn đề (Pain point) và giải pháp tổng quan.
   - ## Tính Năng Nổi Bật: Liệt kê 3-5 tính năng "Killer" dưới dạng Bullet points, mô tả ngắn gọn lợi ích.
   - ## Tại Sao Chọn [Tên App]?: Nêu bật giá trị cốt lõi (Nhanh, An toàn, Tiện lợi...).
   - ## Kết Luận: Lời kết mạnh mẽ và kêu gọi hành động (CTA).

Tuyệt đối không có tiêu đề bài viết (như "Mô tả sản phẩm..."), vào thẳng nội dung.`
        : `Act as a top-tier Copywriter for Tech Products.
Task: Write an engaging product description for the software "${name}".

INPUT ANALYTICS:
- User Context/Ideas: "${context || 'Not provided'}"
- Desired Style: ${styleInstruction}

CRITICAL REQUIREMENTS:
1. "RESEARCH" (Simulated): Infer core features typical for this type of software if user input is sparse.
2. FORMAT (Crucial):
   - Use standard Markdown.
   - Use H2 (##) for main sections, H3 (###) for subsections.
   - Use Bullet points (-) for feature lists.
   - Bold (**text**) key terms.
   - Use subtle Unicode emojis in headers.
3. STRUCTURE:
   - ## Introduction: Hook the reader, address Pain Point and Solution.
   - ## Key Features: List 3-5 "Killer" features as bullet points with benefits.
   - ## Why Choose [App Name]?: Highlight core values (Speed, Security, Convenience...).
   - ## Conclusion: Strong ending and Call to Action (CTA).

Return ONLY the description text content.`;

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a professional Tech Copywriter." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate content');
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        return cleanMarkdownSymbols(content);
    } catch (error) {
        console.error('DeepSeek API Error:', error);
        throw error;
    }
};
