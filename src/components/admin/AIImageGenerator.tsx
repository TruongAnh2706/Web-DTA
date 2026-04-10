import { useState } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAIRetry } from '@/lib/aiUtils';

interface AIImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

export function AIImageGenerator({ isOpen, onClose, onInsert }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImg, setGeneratedImg] = useState('');
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!prompt) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập mô tả ảnh', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setGeneratedImg('');

    try {
      // Mocking or hitting generic stable diffusion / Pollinations as fallback if Gemini image API fails/not accessible
      // Dùng pollinations AI tạm như 1 phương án dự phòng vì API Imagen của Google AI Studio chưa public REST đầy đủ ở VN.
      // Sẽ dùng prompt gọi qua AI để sinh ảnh đẹp.
      
      const response = await fetchWithAIRetry('gemini', async (apiKey: string, fallbackModel?: string) => {
        const targetModel = fallbackModel || 'gemini-2.5-flash';
        return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: "Bạn là chuyên gia Prompt Engineer. Người dùng sẽ đưa ý tưởng ảnh, hãy dịch nó ra 1 câu tiếng Anh miêu tả cực kỳ chi tiết, phong cách chân thực, điện ảnh, sắc nét để đưa vào AI vẽ tranh. Chỉ in ra câu prompt tiếng Anh, không thêm chữ nào khác." }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          })
        });
      }, 5);

      const data = await response.json();
      
      let optimizedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
      
      // Use pollinations.ai for image generation (free, no key needed) as a placeholder for Imagen 3
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=1024&height=576&nologo=true`;
      
      // Giả lập thời gian vẽ
      setTimeout(() => {
        setGeneratedImg(imgUrl);
        setLoading(false);
      }, 3000);
      
    } catch (error: any) {
      if (error.message?.includes('NO_API_KEY')) {
        toast({ title: 'Thiếu API Key', description: 'Vui lòng nạp API Key vào Trạm Quản Lý.', variant: 'destructive' });
      } else {
        toast({ title: 'Lỗi sinh ảnh', description: error.message, variant: 'destructive' });
      }
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedImg) {
      onInsert(generatedImg);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card rounded-2xl border-neon-blue/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-neon-blue">
            <ImageIcon className="w-6 h-6" />
            Tạo Ảnh Minh Họa Bằng AI
          </DialogTitle>
          <DialogDescription>
            Sử dụng Gemini Prompt Engineer để dịch tưởng tượng của bạn thành hình ảnh chất lượng cao.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Textarea
            placeholder="Mô tả bức ảnh bạn muốn... VD: Một con mèo robot làm việc trên laptop máy tính."
            className="min-h-[100px] rounded-xl bg-background/50 border-primary/20 focus-visible:border-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <Button
            className="w-full btn-neon rounded-xl py-6"
            onClick={handleGenerateImage}
            disabled={loading || !prompt}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI đang vẽ tranh...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Bắt đầu Sáng Tạo
              </>
            )}
          </Button>

          <div className="h-[300px] w-full mt-4 bg-secondary/30 rounded-xl border border-dashed border-primary/20 flex flex-col items-center justify-center overflow-hidden relative">
            {loading ? (
              <div className="flex flex-col items-center opacity-70">
                <Loader2 className="w-8 h-8 text-neon-blue animate-spin mb-4" />
                <p>Đang tải xuống dữ liệu ảnh...</p>
              </div>
            ) : generatedImg ? (
              <img src={generatedImg} alt="AI Generated" className="w-full h-full object-cover" />
            ) : (
               <div className="text-muted-foreground flex flex-col items-center opacity-50">
                 <ImageIcon className="w-12 h-12 mb-2" />
                 Khung xem trước ảnh
               </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-primary/10">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Huỷ</Button>
          <Button onClick={handleInsert} disabled={!generatedImg || loading} className="rounded-xl bg-neon-blue hover:bg-neon-blue/80 text-background font-bold">
            <Check className="w-4 h-4 mr-2" /> Chèn Ảnh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
