import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Play, Check, Copy, Settings2, Image as ImageIcon, Link as LinkIcon, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAIRetry } from '@/lib/aiUtils';

interface AIWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  initialTopic?: string;
  mode?: 'generate' | 'paraphrase';
}

type ImageSource = 'none' | 'pollinations' | 'pixabay' | 'pexels';

export function AIWriterModal({ isOpen, onClose, onInsert, initialTopic = '', mode = 'generate' }: AIWriterModalProps) {
  const [prompt, setPrompt] = useState(initialTopic);
  const [url, setUrl] = useState('');
  const [tone, setTone] = useState('Chuyên nghiệp, chuẩn SEO');
  const [imgSource, setImgSource] = useState<ImageSource>('pollinations');
  const [imgApiKey, setImgApiKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Tải API Key đã lưu từ trước cho nguồn ảnh hiện tại
    if (imgSource === 'pixabay') {
      const saved = localStorage.getItem('dta_pixabay_key');
      if (saved) setImgApiKey(saved);
      else setImgApiKey('');
    } else if (imgSource === 'pexels') {
      const saved = localStorage.getItem('dta_pexels_key');
      if (saved) setImgApiKey(saved);
      else setImgApiKey('');
    }
  }, [imgSource]);

  const handleApiKeyChange = (v: string) => {
    setImgApiKey(v);
    if (imgSource === 'pixabay') localStorage.setItem('dta_pixabay_key', v);
    if (imgSource === 'pexels') localStorage.setItem('dta_pexels_key', v);
  };

  const handleGenerate = async () => {
    if (!prompt && !url && mode === 'generate') {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập chủ đề, nội dung hoặc dán Link bài viết.', variant: 'destructive' });
      return;
    }

    if ((imgSource === 'pixabay' || imgSource === 'pexels') && !imgApiKey) {
      toast({ title: 'Lỗi API Key', description: `Vui lòng nhập API Key của ${imgSource} để tự động tải ảnh.`, variant: 'destructive' });
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
          toast({ title: 'Cảnh báo mạng', description: 'Không thể tải nội dung do tường lửa, AI sẽ cố viết nguyên bản.', variant: 'default' });
        }
      }

      let imgInstructions = '';
      if (imgSource === 'pollinations') {
         imgInstructions = 'Hãy tự động chèn 2-3 hình ảnh vào các đoạn phù hợp. MỖI LẦN chèn ảnh, viết đúng cú pháp HTML: <img src="https://image.pollinations.ai/prompt/{keyword_tiếng_anh_chi_tiết_ảnh}?width=800&height=450&nologo=true" alt="{mô_tả}" style="width: 100%; border-radius: 8px; margin: 16px 0;" />';
      } else if (imgSource === 'pixabay' || imgSource === 'pexels') {
         imgInstructions = 'Hãy chèn ít nhất 2 ảnh minh họa. Tại vị trí muốn chèn ảnh, hảy gõ CHUẨN XÁC chuỗi này: [IMG_SEARCH: {từ khóa tiếng anh ngắn gọn 2 mục tiêu}]. VD: [IMG_SEARCH: digital marketing].';
      }

      let systemMessage = '';
      let userPrompt = prompt;

      if (mode === 'generate') {
        systemMessage = `Bạn là Content SEO của DTA Studio. Viết bài HTML CHUẨN (h2, h3, p, ul). Không dùng markdown html blocks. Giọng văn: ${tone}. ${imgInstructions}`;
        if (url && scrapedContent) {
           userPrompt = `Dựa trên bài viết gốc này: ${scrapedContent}\n\nYêu cầu thêm: ${prompt}`;
        } else {
           userPrompt = `Viết bài chi tiết với chủ đề: ${prompt}`;
        }
      } else {
        systemMessage = `Bạn là Biên tập viên của DTA Studio. Tối ưu, viết lại text dưới dạng HTML chuẩn (h3, p, ul). Không markdown. Giọng văn: ${tone}. ${imgInstructions}`;
      }

      const response = await fetchWithAIRetry('gemini', async (apiKey: string, fallbackModel?: string) => {
        const targetModel = fallbackModel || 'gemini-2.5-flash';
        return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemMessage }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          })
        });
      }, 5);

      const data = await response.json();
      
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Xóa markdown syntax
      content = content.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
      
      // Post-Processing Pexels/Pixabay Image Search Tokens
      if ((imgSource === 'pixabay' || imgSource === 'pexels') && content.includes('[IMG_SEARCH:')) {
         const regex = /\[IMG_SEARCH:\s*(.*?)\]/g;
         const matches = [...content.matchAll(regex)];
         for (const match of matches) {
           const keyword = match[1].trim();
           try {
             let imgUrl = '';
             let altText = keyword;
             if (imgSource === 'pixabay') {
               const res = await fetch(`https://pixabay.com/api/?key=${encodeURIComponent(imgApiKey)}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=3`);
               const dt = await res.json();
               if (dt.hits && dt.hits.length > 0) {
                 imgUrl = dt.hits[0].largeImageURL || dt.hits[0].webformatURL;
                 altText = dt.hits[0].tags;
               }
             } else if (imgSource === 'pexels') {
               const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`, { headers: { 'Authorization': imgApiKey } });
               const dt = await res.json();
               if (dt.photos && dt.photos.length > 0) {
                 imgUrl = dt.photos[0].src.large || dt.photos[0].src.medium;
                 altText = dt.photos[0].alt;
               }
             }
             
             if (imgUrl) {
                content = content.replace(match[0], `<img src="${imgUrl}" alt="${altText}" style="width: 100%; border-radius: 8px; margin: 16px 0;" />`);
             } else {
                content = content.replace(match[0], ''); // Remove failed placeholders
             }
           } catch(err) {
             content = content.replace(match[0], ''); // Remove failed placeholders
           }
         }
      }

      setGeneratedContent(content);
    } catch (error: any) {
      if (error.message?.includes('NO_API_KEY')) {
         toast({ title: 'Thiếu API Key', description: 'Vui lòng nạp Google Gemini API Key vào Trạm Quản Lý.', variant: 'destructive' });
      } else if (error.message?.includes('EXHAUSTED')) {
         toast({ title: 'AI Quá Tải', description: 'API Key đã hết hạn ngạch.', variant: 'destructive' });
      } else {
         toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
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
      <DialogContent className="max-w-5xl glass-card rounded-2xl border-neon-blue/30 max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between border-b border-primary/20 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-red">
            <Sparkles className="w-6 h-6 text-neon-blue" />
            {mode === 'generate' ? 'Studio Sáng Tạo AI' : 'Trung Tâm Chỉnh Sửa AI'}
          </DialogTitle>
          <Button variant="outline" size="sm" onClick={() => setPrompt('')} className="rounded-xl border-primary/20 hover:border-primary/50 text-xs text-muted-foreground">
             Làm Mới Biểu Mẫu
          </Button>
        </DialogHeader>

        {/* 1 Column Layout: Controls on Top, Result takes remainder */}
        <div className="flex-1 flex flex-col mt-4 min-h-0 space-y-4">
          
          {/* CONTROL PANEL */}
          <div className="shrink-0 space-y-4 bg-background/40 p-4 rounded-xl border border-primary/10">
             
             {/* Text/Topic Input */}
             <div>
                <Label className="text-secondary-foreground mb-2 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-neon-blue" />
                  {mode === 'generate' ? 'Chủ Đề Cần Phân Tích & Viết Bài' : 'Dán Văn Bản Cần Tối Ưu'}
                </Label>
                <Textarea
                  placeholder="VD: Mô tả một số kinh nghiệm triển khai Ads..."
                  className="min-h-[80px] rounded-xl bg-black/30 border-primary/20 focus-visible:border-neon-blue resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
             </div>

             {/* Options Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mode === 'generate' && (
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><LinkIcon className="w-3.5 h-3.5"/> Nguồn tham chiếu gốc</Label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="rounded-xl bg-black/30 border-primary/20"
                    />
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Settings2 className="w-3.5 h-3.5"/> Giọng văn</Label>
                  <Input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="rounded-xl bg-black/30 border-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><ImageIcon className="w-3.5 h-3.5"/> Cài đặt Ảnh Tự Động</Label>
                  <Select value={imgSource} onValueChange={(v) => setImgSource(v as ImageSource)}>
                    <SelectTrigger className="rounded-xl bg-black/30 border-primary/20 focus:ring-neon-blue/50">
                      <SelectValue placeholder="Chọn Nguồn" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-primary/20">
                      <SelectItem value="none">Không Chèn Ảnh</SelectItem>
                      <SelectItem value="pollinations">Vẽ Ảnh Bằng AI (Pollinations)</SelectItem>
                      <SelectItem value="pixabay">Tìm từ Pixabay (Có phí/Free API)</SelectItem>
                      <SelectItem value="pexels">Tìm từ Pexels (Free API)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>

             {/* API Key Input for Image Source */}
             {(imgSource === 'pixabay' || imgSource === 'pexels') && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="flex items-center gap-1.5 text-xs text-yellow-500 mb-1.5"><KeyRound className="w-3.5 h-3.5"/> API Key Dành Cho Nguồn ({imgSource})</Label>
                  <div className="flex gap-2">
                     <Input
                        value={imgApiKey}
                        type="password"
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder="Nhập khóa API..."
                        className="rounded-xl bg-black/30 border-yellow-500/30 focus-visible:border-yellow-500"
                     />
                     <Button disabled variant="outline" className="rounded-xl border-yellow-500/30 text-yellow-500 bg-yellow-500/10 whitespace-nowrap">Đã Lưu Nội Bộ</Button>
                  </div>
                </div>
             )}

             {/* Execute Button */}
             <div className="pt-2">
                <Button
                  className="w-full btn-neon rounded-xl py-6 font-bold tracking-wider"
                  onClick={handleGenerate}
                  disabled={loading || (!prompt && !url && mode === 'generate')}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      HỆ THỐNG ĐANG KHỞI TẠO... (MẤT VÀI GIÂY)
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      BẮT ĐẦU VẬN HÀNH AI
                    </>
                  )}
                </Button>
             </div>
          </div>

          {/* AI RESULT PANEL */}
          <div className="flex-1 flex flex-col bg-secondary/20 rounded-xl border border-primary/20 overflow-hidden relative min-h-[300px]">
            <div className="bg-primary/10 px-4 py-2.5 border-b border-primary/20 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm tracking-wide text-neon-blue flex items-center gap-2"><Sparkles className="w-4 h-4"/> NỘI DUNG SẴN SÀNG</span>
              {generatedContent && (
                <Button variant="ghost" size="sm" className="h-8 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg text-xs" onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  toast({ title: 'Đã copy thành công' });
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Văn Bản
                </Button>
              )}
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto text-sm text-foreground/90 whitespace-pre-wrap leading-[1.8]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-neon-blue/70">
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin"></div>
                    <div className="absolute w-10 h-10 rounded-full border-2 border-neon-red/20 border-b-neon-red animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Đang liên kết Nơ-ron...</p>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center max-w-xs">(Nó sẽ tự động phân tích và chèn ảnh vào ngữ cảnh, vui lòng đợi cho tới khu chạy xong...)</p>
                </div>
              ) : generatedContent ? (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-headings:text-neon-blue prose-a:text-neon-red"
                  dangerouslySetInnerHTML={{ __html: generatedContent }} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                  <Play className="w-12 h-12 mb-3" />
                  Kết quả lập trình của AI sẽ xuất hiện tại đây...
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-primary/20 shrink-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl text-muted-foreground hover:text-foreground">Huỷ Bỏ Hành Động</Button>
          <Button 
            onClick={handleInsert} 
            disabled={!generatedContent || loading}
            className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-red border-none text-white font-bold hover:opacity-90 shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            <Check className="w-4 h-4 mr-2" />
            HOÀN TẤT & XUẤT XẢN PHẨM
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
