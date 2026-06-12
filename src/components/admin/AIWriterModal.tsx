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
      const coverImgInstruction = imgSource !== 'none' 
        ? '\n7. BẮT BUỘC: Ngay sau thẻ H1, chèn 1 ẢNH BÌA (cover image) toàn chiều rộng liên quan đến chủ đề bài viết. Ảnh bìa phải có style: width:100%; aspect-ratio:21/9; object-fit:cover; border-radius:16px;'
        : '';

      if (imgSource === 'pollinations') {
         imgInstructions = `Hãy chèn TỔNG CỘNG 4-5 hình ảnh xuyên suốt bài viết (bao gồm ảnh bìa). MỖI LẦN chèn ảnh, viết đúng cú pháp: <img src="https://image.pollinations.ai/prompt/{keyword_tiếng_anh_rõ_ràng_mô_tả_cảnh}?width=1200&height=675&nologo=true" alt="{mô_tả_tiếng_việt}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 12px; margin: 32px 0; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />`;
      } else if (imgSource === 'pixabay' || imgSource === 'pexels') {
         imgInstructions = 'Hãy chèn TỔNG CỘNG 4-5 ảnh minh họa (bao gồm ảnh bìa). Tại vị trí muốn chèn ảnh, hãy gõ CHUẨN XÁC chuỗi: [IMG_SEARCH: {từ khóa tiếng anh ngắn gọn}]. VD: [IMG_SEARCH: digital marketing strategy].';
      }

      let systemMessage = '';
      let userPrompt = prompt;

      if (mode === 'generate') {
        systemMessage = `Bạn là Chuyên gia Content SEO cấp cao của DTA Studio. Nhiệm vụ: viết bài blog HTML dạng báo chí chuyên nghiệp, GÂY ẤN TƯỢNG MẠNH.

=== CẤU TRÚC BẮT BUỘC ===
1. TIÊU ĐỀ H1: Phải gây sốc, tạo tò mò (kiểu clickbait nhưng vẫn chính xác). Dùng CON SỐ CỤ THỂ, câu hỏi, hoặc từ mạnh (Bí Mật, Sự Thật, Đừng Bỏ Lỡ, Cách Đơn Giản...). VD: "7 Bí Mật Chạy Ads Mà 90% Người Mới Không Biết" thay vì "Hướng dẫn chạy Ads".
2. MỞ BÀI: 2-3 câu ngắn, hook cảm xúc hoặc đặt vấn đề gây đồng cảm. Có thể mở bằng câu hỏi tu từ hoặc thống kê gây sốc.
3. THÂN BÀI: Tối thiểu 4 thẻ H2 (mỗi H2 là 1 section riêng biệt). Giữa mỗi section H2, PHẢI có thẻ <hr style="border:none; height:1px; background: linear-gradient(to right, transparent, rgba(0,255,255,0.3), transparent); margin: 48px 0;" /> để phân tách rõ ràng.
4. Mỗi section H2 nên có ít nhất 1 ảnh minh họa liên quan.
5. KẾT LUẬN: Tóm tắt giá trị + CTA mạnh mẽ (Kêu gọi hành động cụ thể).
6. Dùng <strong> in đậm từ khóa. Đoạn văn ngắn 2-3 câu. Xen kẽ <ul>/<ol> khi liệt kê.${coverImgInstruction}

=== PHONG CÁCH ===
- Giọng văn: ${tone}
- Không dùng markdown code blocks. Trả về raw HTML.
- Tạo cảm giác "tạp chí cao cấp": thoáng, sạch, có nhịp thở giữa các phần.

${imgInstructions}`;
        if (url && scrapedContent) {
           userPrompt = `Dựa trên bài viết gốc này: ${scrapedContent}\n\nYêu cầu thêm: ${prompt}`;
        } else {
           userPrompt = `Viết bài chi tiết, chuyên sâu (tối thiểu 1500 từ) với chủ đề: ${prompt}`;
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
               const res = await fetch(`https://pixabay.com/api/?key=${encodeURIComponent(imgApiKey)}&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=horizontal&per_page=3`);
               const dt = await res.json();
               if (dt.hits && dt.hits.length > 0) {
                 imgUrl = dt.hits[0].largeImageURL || dt.hits[0].webformatURL;
                 altText = dt.hits[0].tags;
               }
             } else if (imgSource === 'pexels') {
               const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`, { headers: { 'Authorization': imgApiKey } });
               const dt = await res.json();
               if (dt.photos && dt.photos.length > 0) {
                 imgUrl = dt.photos[0].src.landscape || dt.photos[0].src.large;
                 altText = dt.photos[0].alt;
               }
             }
             
             if (imgUrl) {
                content = content.replace(match[0], `<img src="${imgUrl}" alt="${altText}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />`);
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
      <DialogContent className="max-w-[95vw] xl:max-w-7xl glass-card rounded-2xl border-neon-blue/30 max-h-[95vh] h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between border-b border-primary/20 p-5 bg-background/50 backdrop-blur-md z-10">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-red">
            <Sparkles className="w-6 h-6 text-neon-blue" />
            {mode === 'generate' ? 'DTA AI Content Studio' : 'DTA AI Editor'}
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPrompt('')} className="rounded-xl border-primary/20 hover:border-primary/50 text-xs">
              Làm Mới
            </Button>
            <Button 
              onClick={handleInsert} 
              disabled={!generatedContent || loading}
              className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-red border-none text-white font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-2" />
              LƯU VÀO BÀI VIẾT
            </Button>
          </div>
        </DialogHeader>

        {/* 2 Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT: CONTROL PANEL */}
          <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 border-r border-primary/20 bg-background/40 flex flex-col overflow-y-auto custom-scrollbar p-5 space-y-6">
             
             {/* Text/Topic Input */}
             <div className="space-y-3">
                <Label className="text-secondary-foreground flex items-center gap-2 font-bold text-base">
                  <Settings2 className="w-5 h-5 text-neon-blue" />
                  {mode === 'generate' ? 'Nội dung & Yêu cầu' : 'Văn Bản Cần Tối Ưu'}
                </Label>
                <Textarea
                  placeholder="VD: Viết bài chia sẻ kinh nghiệm chạy Ads chuyển đổi cho spa. Nhấn mạnh vào tầm quan trọng của Content Video..."
                  className="min-h-[150px] rounded-xl bg-black/30 border-primary/20 focus-visible:border-neon-blue resize-none shadow-inner"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
             </div>

             {/* Nguồn URL */}
             {mode === 'generate' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"><LinkIcon className="w-4 h-4 text-primary"/> Nguồn cào dữ liệu (URL tuỳ chọn)</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Dán link bài viết tham khảo..."
                    className="rounded-xl bg-black/30 border-primary/20"
                  />
                  <p className="text-[10px] text-muted-foreground">AI sẽ đọc nội dung link này và viết lại theo ý bạn.</p>
                </div>
             )}

             {/* Options Grid */}
             <div className="space-y-4 pt-4 border-t border-primary/10">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">Giọng văn (Tone)</Label>
                  <Input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="rounded-xl bg-black/30 border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"><ImageIcon className="w-4 h-4 text-primary"/> Nguồn ảnh tự động</Label>
                  <Select value={imgSource} onValueChange={(v) => setImgSource(v as ImageSource)}>
                    <SelectTrigger className="rounded-xl bg-black/30 border-primary/20 focus:ring-neon-blue/50">
                      <SelectValue placeholder="Chọn Nguồn" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-primary/20">
                      <SelectItem value="none">Không chèn ảnh</SelectItem>
                      <SelectItem value="pollinations">Vẽ ảnh AI (Pollinations - Miễn phí)</SelectItem>
                      <SelectItem value="pixabay">Kho ảnh Pixabay (Cần API Key)</SelectItem>
                      <SelectItem value="pexels">Kho ảnh Pexels (Cần API Key)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>

             {/* API Key Input for Image Source */}
             {(imgSource === 'pixabay' || imgSource === 'pexels') && (
                <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/20 space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold">
                    <KeyRound className="w-3.5 h-3.5"/> API Key cho {imgSource}
                  </Label>
                  <Input
                    value={imgApiKey}
                    type="password"
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Nhập khóa API..."
                    className="rounded-lg bg-black/30 border-yellow-500/30 text-sm h-9"
                  />
                  {imgApiKey && <p className="text-[10px] text-yellow-500/70">Đã lưu cục bộ an toàn.</p>}
                </div>
             )}

             <div className="mt-auto pt-6">
                <Button
                  className="w-full btn-neon rounded-xl py-6 font-bold tracking-wider"
                  onClick={handleGenerate}
                  disabled={loading || (!prompt && !url && mode === 'generate')}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> ĐANG TẠO BÀI...</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" /> BẮT ĐẦU VIẾT BÀI</>
                  )}
                </Button>
             </div>
          </div>

          {/* RIGHT: AI RESULT PANEL */}
          <div className="flex-1 flex flex-col bg-secondary/10 relative">
            <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center justify-between shrink-0">
              <span className="font-bold tracking-wide text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4"/> 
                XEM TRƯỚC BÀI VIẾT (PREVIEW)
              </span>
              {generatedContent && (
                <Button variant="ghost" size="sm" className="h-8 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg text-xs" onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  toast({ title: 'Đã copy thành công' });
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy HTML
                </Button>
              )}
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar relative bg-white/5 dark:bg-black/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-neon-blue/70">
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin"></div>
                    <div className="absolute w-12 h-12 rounded-full border-2 border-neon-red/20 border-b-neon-red animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Trí tuệ nhân tạo đang phân tích...</h3>
                  <p className="text-muted-foreground text-sm max-w-sm text-center">
                    Quá trình này có thể mất từ 10 - 20 giây để hệ thống nghiên cứu từ khóa, lập dàn ý và tìm kiếm hình ảnh phù hợp.
                  </p>
                </div>
              ) : generatedContent ? (
                <div className="max-w-4xl mx-auto bg-background p-8 md:p-12 rounded-2xl shadow-2xl border border-primary/10">
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-2xl prose-img:shadow-xl prose-headings:text-foreground prose-a:text-primary marker:text-primary"
                    dangerouslySetInnerHTML={{ __html: generatedContent }} 
                  />
                  
                  {/* Closed Loop Refinement (Vòng lặp khép kín) */}
                  <div className="mt-12 pt-8 border-t border-primary/10">
                    <Label className="text-sm font-bold flex items-center gap-2 mb-3 text-neon-blue">
                      <Sparkles className="w-4 h-4" /> Chưa ưng ý? Yêu cầu AI tinh chỉnh lại phần trên:
                    </Label>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="VD: Viết lại đoạn mở bài cho lôi cuốn hơn..." 
                        className="rounded-xl border-primary/20 bg-background"
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             setPrompt(`Dựa trên bài viết này:\n\n${generatedContent}\n\nHãy sửa lại theo yêu cầu sau: ${e.currentTarget.value}`);
                             handleGenerate();
                           }
                        }}
                      />
                      <Button variant="outline" className="rounded-xl border-primary/50 text-primary">Sửa đổi</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                  <div className="w-24 h-24 mb-6 rounded-full border-4 border-dashed border-current flex items-center justify-center">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold">Khung Xem Trước Trống</h3>
                  <p className="mt-2 text-center max-w-sm">Điền thông tin vào cột bên trái và bấm "Bắt đầu viết bài" để tạo nội dung.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
