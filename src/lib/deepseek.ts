
interface DeepSeekResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const generateAppContent = async (name: string, description_draft: string, language: 'vi' | 'en', apiKey: string) => {
    if (!apiKey) throw new Error('API Key is required');

    const prompt = language === 'vi'
        ? `Hãy viết mô tả chuẩn SEO và hấp dẫn cho phần mềm tên là "${name}". 
       Ý tưởng ban đầu: "${description_draft}".
       Yêu cầu:
       - Viết tiêu đề hấp dẫn (Title)
       - Mở bài thu hút (Description ngắn)
       - Danh sách tính năng nổi bật (Features) có icon
       - Kết bài kêu gọi hành động.
       - Viết bằng tiếng Việt, giọng văn công nghệ, hiện đại, chuyên nghiệp.`
        : `Write an SEO-friendly and engaging description for a software named "${name}".
       Initial idea: "${description_draft}".
       Requirements:
       - Catchy Title
       - Engaging Intro (Short Description)
       - List of Key Features with icons
       - Call to Action conclusion.
       - Write in English, modern tech tone, professional.`;

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API Error: ${response.statusText}`);
        }

        const data: DeepSeekResponse = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
};
