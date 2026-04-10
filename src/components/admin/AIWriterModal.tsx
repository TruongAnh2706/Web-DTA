import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Play, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAIRetry } from '@/lib/aiUtils';

interface AIWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  initialTopic?: string;
  mode?: 'generate' | 'paraphrase';
}

export function AIWriterModal({ isOpen, onClose, onInsert, initialTopic = '', mode = 'generate' }: AIWriterModalProps) {
  const [prompt, setPrompt] = useState(initialTopic);
  const [url, setUrl] = useState('');
  const [tone, setTone] = useState('Chuyên nghiệp, thuyết phục');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt && !url) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập chủ đề, nội dung hoặc dán Link bài viết.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setGeneratedContent('');

    try {
      let scrapedContent = '';
      if (url) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (response.ok) {
            const data = await response.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            scrapedContent = doc.body.innerText.replace(/\s+/g, ' ').substring(0, 15000);
          }
        } catch (error) {
          toast({ title: 'Cảnh báo proxy', description: 'Không thể đọc nội dung từ link (timeout 7s), AI sẽ cố viết dựa trên URL nếu có thể.', variant: 'default' });
        }
      }
      let systemMessage = '';
      let userPrompt = prompt;

      if (url && scrapedContent) {
        systemMessage = `Bạn là một chuyên gia Content SEO xuất sắc của DTA Studio... (Yêu cầu phải viết CHUẨN HTML như h2, h3, p, ul). Giọng văn: ${tone}`;
        userPrompt = `Viết bài từ chủ đề/yêu cầu sau (nếu có): ${prompt}\n\nDựa trên nội dung web: ${scrapedContent}\n\nHãy sinh ra ĐỊNH DẠNG HTML (Đừng bọc trong \\\`\\\`\\\`html)`;
      } else if (mode === 'generate') {
        systemMessage = `Bạn là một chuyên gia Content SEO xuất sắc của nền tảng DTA Studio. Viết bài blog có định dạng HTML CHUẨN XÁC (h2, h3, p, ul). Không dùng markdown block. Giọng văn: ${tone}.`;
      } else {
        systemMessage = `Bạn là biên tập viên của DTA Studio. Cải thiện và tối ưu đoạn text sau thành chuỗi HTML chuẩn (p, h3, ul). Không có markdown code block. Giọng văn: ${tone}.`;
      }
      const response = await fetchWithAIRetry('gemini', async (apiKey: string, fallbackModel?: string) => {
        const targetModel = fallbackModel || 'gemini-2.5-flash';
        return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemMessage }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          })
        });
      }, 5);

      const data = await response.json();
      
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Xoá bỏ markdown html block (nếu Gemini vẫn ngoan cố sinh ra)
      content = content.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
      
      setGeneratedContent(content);
    } catch (error: any) {
      if (error.message?.includes('NO_API_KEY')) {
         toast({ title: 'Thiếu API Key', description: 'Vui lòng nạp Google Gemini API Key vào Trạm Quản Lý.', variant: 'destructive' });
      } else if (error.message?.includes('EXHAUSTED')) {
         toast({ title: 'Hệ thống AI Tạm Ngưng', description: 'Toàn bộ API Key đã hết hạn ngạch. Vui lòng nạp thêm Key mới.', variant: 'destructive' });
      } else {
         toast({ title: 'Lỗi sinh nội dung', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    onInsert(generatedContent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl glass-card rounded-2xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold gradient-text">
            <Sparkles className="w-6 h-6 text-primary" />
            {mode === 'generate' ? 'Tạo nội dung bằng AI' : 'Viết lại nội dung'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'generate' ? 'Nhập ý tưởng hoặc dán Link bài báo, AI sẽ tổng hợp và viết một bài blog hoàn chỉnh.' : 'Cải thiện nội dung bạn đang viết để chuyên nghiệp hơn.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            {mode === 'generate' && (
              <div className="space-y-2">
                <Label>Nguồn Link (Tuỳ chọn)</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Dán link bài báo, trang web..."
                  className="rounded-xl border-dashed border-primary/50 focus-visible:border-primary"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>{mode === 'generate' ? 'Chủ đề / Yêu cầu thêm' : 'Văn bản gốc'}</Label>
              <Textarea
                placeholder={mode === 'generate' ? 'VD: Lợi ích của công cụ... (Hoặc để trống nếu đã nhập link)' : 'Dán nội dung cần sửa vào đây...'}
                className="min-h-[120px] rounded-xl"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Giọng văn (Tone)</Label>
              <Input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="VD: Chuyên nghiệp, Hài hước, Khẩn cấp..."
                className="rounded-xl"
              />
            </div>

            <Button
              className="w-full btn-neon rounded-xl py-6"
              onClick={handleGenerate}
              disabled={loading || !prompt}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang sáng tạo...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Bắt đầu sinh nội dung
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col h-full bg-secondary/30 rounded-xl border border-primary/10 overflow-hidden relative">
            <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center justify-between">
              <span className="font-semibold text-sm">Kết quả từ AI</span>
              {generatedContent && (
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  toast({ title: 'Đã copy vào clipboard' });
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="p-4 flex-1 overflow-y-auto min-h-[300px] text-sm text-muted-foreground whitespace-pre-wrap font-serif leading-relaxed">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-primary/50">
                  <div className="w-12 h-12 rounded-full border-b-2 border-primary animate-spin mb-4"></div>
                  AI đang viết...
                </div>
              ) : generatedContent ? (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedContent }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full opacity-50 italic">
                  Nội dung kết quả sẽ hiển thị ở đây.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t border-primary/10 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Huỷ</Button>
          <Button 
            onClick={handleInsert} 
            disabled={!generatedContent || loading}
            className="rounded-xl bg-primary hover:bg-primary/80 text-background font-bold"
          >
            <Check className="w-4 h-4 mr-2" />
            Chèn vào bài viết
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
