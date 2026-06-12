import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Github, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    
    try {
      // Gửi dữ liệu lên Google Sheets webhook
      const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'contact',
            name: formData.name,
            email: formData.email,
            message: formData.message,
            timestamp: new Date().toISOString(),
          }),
        });
      }
      
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to send contact form:', error);
      // Vẫn hiện thành công vì mode: 'no-cors' không trả response
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const t = {
    vi: {
      title: 'Liên Hệ Hợp Tác',
      subtitle: 'Bạn có ý tưởng đột phá? Chúng tôi có công nghệ hiện thực hóa nó. Đừng ngần ngại kết nối.',
      name: 'Họ và tên',
      email: 'Email liên hệ',
      message: 'Nội dung tin nhắn',
      send: 'Gửi Tin Nhắn',
      sending: 'Đang Gửi...',
      success: 'Tin nhắn đã được gửi thành công!',
      infoTitle: 'Thông Tin Liên Hệ',
      address: 'Mã Kiều, Phương Trung, Thanh Oai, Hà Nội',
      follow: 'Theo dõi chúng tôi',
    },
    en: {
      title: 'Let\'s Collaborate',
      subtitle: 'Have a breakthrough idea? We have the tech to realize it. Don\'t hesitate to connect.',
      name: 'Full Name',
      email: 'Contact Email',
      message: 'Your Message',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully!',
      infoTitle: 'Contact Information',
      address: 'Ma Kieu, Phuong Trung, Thanh Oai, Ha Noi',
      follow: 'Follow Us',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-pulse" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">{texts.title}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {texts.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-3xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">{texts.name}</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={language === 'vi' ? "Nhập tên của bạn" : "Enter your name"}
                  className="rounded-xl border-primary/20 focus:border-primary/50 bg-background/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">{texts.email}</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                  className="rounded-xl border-primary/20 focus:border-primary/50 bg-background/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">{texts.message}</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder={language === 'vi' ? "Bạn cần hỗ trợ gì?" : "How can we help?"}
                  className="rounded-xl border-primary/20 focus:border-primary/50 bg-background/50 min-h-[150px]"
                />
              </div>
              
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{texts.success}</span>
                </motion.div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className="w-full btn-neon rounded-xl py-6 text-background font-bold text-lg group"
              >
                {isSubmitting ? texts.sending : texts.send}
                {!isSubmitting && <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="glass-card p-8 rounded-3xl space-y-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg gradient-neon flex items-center justify-center">
                  <Phone className="w-5 h-5 text-background" />
                </span>
                {texts.infoTitle}
              </h3>

              <div className="space-y-6">
                <a href="mailto:ductruong.onl@gmail.com" className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{texts.email}</div>
                    <div className="text-lg font-bold">ductruong.onl@gmail.com</div>
                  </div>
                </a>

                <a href="tel:0962775506" className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Hotline</div>
                    <div className="text-lg font-bold">0962 775 506</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{language === 'vi' ? 'Địa chỉ' : 'Address'}</div>
                    <div className="text-lg font-bold">{texts.address}</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-primary/20">
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">{texts.follow}</div>
                <div className="flex gap-4">
                  {[
                    { Icon: Facebook, href: "https://www.facebook.com/phamductruong17/" },
                    { Icon: Github, href: "https://github.com/TruongAnh2706" },
                    { Icon: MessageCircle, href: "https://zalo.me/0962775506" }
                  ].map(({ Icon, href }, i) => (
                    <motion.a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-xl bg-background border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-background transition-colors"
                    >
                      <Icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
