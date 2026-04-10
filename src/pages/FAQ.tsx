import { motion } from 'framer-motion';
import { HelpCircle, MessagesSquare, Search } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';

const FAQ = () => {
  const { language } = useLanguage();

  const t = {
    vi: {
      title: 'Câu hỏi thường gặp',
      subtitle: 'Tìm thấy câu trả lời cho các thắc mắc về tải xuống, cài đặt và bảo mật.',
      search: 'Nhập câu hỏi của bạn...',
      supportTitle: 'Vẫn còn thắc mắc?',
      supportDesc: 'Bạn có thể trực tiếp liên hệ với độ ngũ phát triển.',
      contactBtn: 'Liên hệ hỗ trợ',
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers about downloading, installing, and security.',
      search: 'Search your question...',
      supportTitle: 'Still have questions?',
      supportDesc: 'You can contact our development team directly.',
      contactBtn: 'Contact Support',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  const faqs = [
    {
      q: language === 'vi' ? 'Làm sao để tải phần mềm DTA AutoDown?' : 'How to download DTA AutoDown?',
      a: language === 'vi' ? 'Bạn có thể vào thẻ Ứng dụng, chọn DTA AutoDown rồi nhấn Tải về. Sau đó đăng nhập bằng Account đã cấp quyền để kích hoạt công cụ.' : 'Go to Apps, select DTA AutoDown and click Download. Then login with an authorized account to activate the tool.'
    },
    {
      q: language === 'vi' ? 'Mua V.I.P Trọn Đời có thời hạn bảo hành không?' : 'Does Lifetime VIP have a warranty period?',
      a: language === 'vi' ? 'Tất cả phần mềm ở mức VIP trọn đời đều được bảo trì vĩnh viễn và liên tục dọn lỗi, làm mới tính năng.' : 'All software in Lifetime VIP tier receives perpetual maintenance, continuous bug fixes, and feature updates.'
    },
    {
      q: language === 'vi' ? 'Tôi có thể chia sẻ License Key cho người khác không?' : 'Can I share my License Key with others?',
      a: language === 'vi' ? 'Không. Mỗi License Key được gắn liền với Hardware ID và phiên bản cài đặt của máy tính. Tuy nhiên, nếu bạn đổi máy hoặc nâng cấp phần cứng, bạn có thể gửi yêu cầu cấu hình (reset HWID) trên trang Admin.' : 'No. Each License Key is bound to a Hardware ID. However, if you change machines, you can request an HWID reset via the Admin page.'
    },
    {
      q: language === 'vi' ? 'Tại sao nút Đăng Nhập bằng Google không hoạt động?' : 'Why is the Google Login button not working?',
      a: language === 'vi' ? 'Hãy lưu ý không chặn Popup của trình duyệt. Các extension giả lập chặn quảng cáo (AdBlock) cũng đôi khi can thiệp vào tiến trình bảo mật Google Auth.' : 'Please ensure you are not blocking popups. Ad blocker extensions can also sometimes interfere with Google Auth security processes.'
    },
    {
      q: language === 'vi' ? 'Làm thế nào để sử dụng thử ứng dụng Web Tools?' : 'How can I try out the Web Tools application?',
      a: language === 'vi' ? 'Hầu hết các tool chạy qua API trên WebTools thuộc dạng Sandbox miễn phí. Hãy nhấp vô phần "Công cụ Web" trên thanh điều hướng.' : 'Most API-driven tools in WebTools are in a free Sandbox state. Click on "Web Tools" in the navigation bar.'
    }
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Header />

      <main className="pt-32 pb-24 px-4 min-h-[calc(100vh-100px)]">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center glow-sm mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {texts.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {texts.subtitle}
            </p>
          </div>

          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder={texts.search} 
              className="pl-12 h-14 rounded-2xl bg-secondary/30 backdrop-blur-md border-primary/20 text-lg focus-visible:ring-primary/50 transition-all"
            />
          </div>

          <div className="glass-card p-6 md:p-8 rounded-3xl neon-border">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b-0 bg-secondary/30 px-6 rounded-2xl border border-primary/10 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 transition-all">
                  <AccordionTrigger className="text-left font-bold text-[15px] hover:no-underline py-4 py- md:py-6">
                      {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-6 p-8 glass-card rounded-3xl mt-12 text-center md:text-left justify-between"
          >
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <MessagesSquare className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">{texts.supportTitle}</h3>
                    <p className="text-muted-foreground">{texts.supportDesc}</p>
                </div>
             </div>
             <a href="/#contact" className="w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-3 btn-neon rounded-xl text-background font-bold whitespace-nowrap">
                    {texts.contactBtn}
                </button>
             </a>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
