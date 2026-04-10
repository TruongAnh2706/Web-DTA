import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchWithAIRetry, getPrimaryProvider } from '@/lib/aiUtils';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const t = {
    vi: {
      greeting: 'Xin chào! Tôi là Trợ lý AI của DTA Studio. Tôi có thể giúp tìm kiếm ứng dụng hoặc giải đáp thắc mắc gì cho bạn?',
      inputPlaceholder: 'Nhắn tin cho DTA Studio...',
      title: 'Hỗ trợ trực tuyến AI'
    },
    en: {
      greeting: 'Hello! I am the DTA Studio AI Assistant. How can I help you discover apps or answer your questions today?',
      inputPlaceholder: 'Message DTA Studio...',
      title: 'AI Live Support'
    }
  };

  const texts = t[language as keyof typeof t] || t.en;

  // Initialize greeting log only once
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: '1', role: 'bot', content: texts.greeting }]);
    }
  }, [texts.greeting, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const provider = getPrimaryProvider();

      const apiMessages = [
        { role: 'system', content: 'Bạn là chuyên viên chăm sóc khách hàng tự động của DTA Studio. Hãy trả lời ngắn gọn, lịch sự, thân thiện. Cố gắng hướng người dùng tới việc trải nghiệm sản phẩm AutoDown.' },
        ...messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: userMessage.content }
      ];

      const response = await fetchWithAIRetry(provider, async (apiKey: string, fallbackModel?: string) => {
        let endpoint = 'https://api.deepseek.com/chat/completions';
        let modelOptions = { model: 'deepseek-chat', messages: apiMessages, max_tokens: 300 };

        if (provider === 'gemini') {
           const targetModel = fallbackModel || 'gemini-2.5-flash';
           endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
           const systemMsg = apiMessages.find(m => m.role === 'system')?.content || '';

           const userContents = apiMessages.filter(m => m.role !== 'system').map(m => ({
               role: m.role === 'assistant' ? 'model' : 'user',
               parts: [{ text: m.content }]
           }));
           
           return await fetch(endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemMsg }] },
                contents: userContents
             })
           });
        }
        
        // Deepseek request
        return await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(modelOptions)
        });
      }, 3);

      const data = await response.json();
      
      let botResponse = '';
      if (provider === 'gemini') {
         botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lỗi xử lý ngôn ngữ AI.';
      } else {
         botResponse = data.choices[0].message.content;
      }

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        content: botResponse
      }]);

    } catch (error: any) {
      if (error.message?.includes('NO_API_KEY')) {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'bot',
          content: 'Hiện tại hệ thống chưa nạp API Key. Vui lòng vào trang Quản Trị -> Cấu hình API để chạy được tính năng này!'
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: 'bot',
          content: 'Xin lỗi, kết nối tới máy chủ AI đang bận. Vui lòng thử lại sau.'
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-background flex items-center justify-center relative group"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[80vh] z-50 flex flex-col glass-card border border-primary/20 shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-primary-foreground shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-background/20 p-1.5 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{texts.title}</h3>
                  <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Trực tuyến
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-primary text-background'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted border border-border/50 text-foreground rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-primary text-background">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-muted border border-border/50 text-foreground rounded-tl-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-background border-t border-primary/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={texts.inputPlaceholder}
                    className="pr-10 rounded-full border-primary/20 bg-muted/50 focus-visible:ring-primary/50"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0 h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!input.trim() || isTyping}
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
