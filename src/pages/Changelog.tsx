import { motion } from 'framer-motion';
import { FileClock, Tag, GitCommit, Search } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const Changelog = () => {
  const { language } = useLanguage();

  const t = {
    vi: {
      title: 'Lịch sử cập nhật',
      subtitle: 'Theo dõi các thay đổi mới nhất từ đội ngũ phát triển DTA Studio.',
      search: 'Tìm kiếm tính năng, lỗi đã sửa...',
      version: 'Phiên bản',
      new: 'Mới',
      fixed: 'Đã sửa',
      improved: 'Cải thiện',
    },
    en: {
      title: 'Changelog',
      subtitle: 'Track the latest updates from the DTA Studio development team.',
      search: 'Search for features, bug fixes...',
      version: 'Version',
      new: 'New',
      fixed: 'Fixed',
      improved: 'Improved',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  const logs = [
    {
      version: 'v2.0.0',
      date: '10/04/2026',
      changes: [
        { type: 'new', text: language === 'vi' ? 'Trải nghiệm UI/UX Cyberpunk Glassmorphism hoàn toàn mới.' : 'Brand new Cyberpunk Glassmorphism UI/UX experience.' },
        { type: 'new', text: language === 'vi' ? 'Tích hợp thanh toán linh hoạt qua VietQR tự động.' : 'Flexible automated VietQR payments integrated.' },
        { type: 'improved', text: language === 'vi' ? 'Tối ưu tốc độ tải trang bằng CDN.' : 'Optimized page load speeds using CDN.' },
      ]
    },
    {
      version: 'v1.5.0',
      date: '15/03/2026',
      changes: [
        { type: 'new', text: language === 'vi' ? 'Dashboard thống kê chuyên nghiệp cho admin.' : 'Professional stats dashboard for admin.' },
        { type: 'fixed', text: language === 'vi' ? 'Lỗi văng ứng dụng khi render API dài.' : 'App crashing bug on long API renders fixed.' },
      ]
    },
    {
      version: 'v1.0.0',
      date: '01/01/2026',
      changes: [
        { type: 'new', text: language === 'vi' ? 'Ra mắt DTA Studio Web Platform.' : 'Initial release of DTA Studio Web Platform.' },
      ]
    }
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Header />

      <main className="pt-32 pb-24 px-4 min-h-[calc(100vh-100px)]">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center glow-sm mb-6">
                <FileClock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {texts.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {texts.subtitle}
            </p>
          </div>

          <div className="relative max-w-md mx-auto mb-16">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder={texts.search} 
              className="pl-10 h-14 rounded-2xl bg-secondary/30 backdrop-blur-md border-primary/20 text-lg focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
            {logs.map((log, i) => (
              <motion.div 
                key={log.version}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary/80 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
                  <Tag className="w-4 h-4" />
                </div>

                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl neon-border hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <h3 className="font-bold text-xl text-primary">{log.version}</h3>
                    <time className="text-sm font-mono text-muted-foreground bg-primary/10 px-2 py-1 rounded-md">
                      {log.date}
                    </time>
                  </div>
                  
                  <ul className="space-y-3">
                    {log.changes.map((change, j) => (
                      <li key={j} className="flex gap-3 text-sm">
                        <GitCommit className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div>
                           <Badge variant={change.type === 'new' ? 'default' : change.type === 'improved' ? 'secondary' : 'destructive'} className="mr-2 text-[10px] h-5 px-1.5 uppercase tracking-wider mb-1">
                               {texts[change.type as keyof typeof texts]}
                           </Badge>
                           <span className="text-muted-foreground leading-relaxed inline-block">{change.text}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Changelog;
