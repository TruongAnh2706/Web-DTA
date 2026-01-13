import { motion } from 'framer-motion';
import { Code, Heart, Zap, Shield, Globe, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { language } = useLanguage();

  const t = {
    vi: {
      title: 'Về DTA Studio',
      subtitle: 'Chúng tôi xây dựng các giải pháp tự động hóa giúp bạn làm việc hiệu quả hơn.',
      mission: 'Sứ Mệnh',
      missionDesc: 'Đánh thức tiềm năng vô hạn của nhà sáng tạo nội dung bằng sức mạnh công nghệ. Chúng tôi tự động hóa sự toan tính để bạn tự do sáng tạo.',
      vision: 'Tầm Nhìn',
      visionDesc: 'Trở thành "Vũ khí bí mật" không thể thiếu của mọi MMO-er và Content Creator hàng đầu tại Việt Nam.',
      values: 'Giá Trị Cốt Lõi',
      stats: {
        users: 'Người dùng',
        apps: 'Dự án',
        revenue: 'Khách hàng hài lòng',
      }
    },
    en: {
      title: 'About DTA Studio',
      subtitle: 'We build automation solutions that help you work smarter.',
      mission: 'Mission',
      missionDesc: 'To unlock the limitless potential of creators through technology. We automate the calculations so you are free to create.',
      vision: 'Vision',
      visionDesc: 'To become the indispensable "Secret Weapon" for every top MMO-er and Content Creator in Vietnam.',
      values: 'Core Values',
      stats: {
        users: 'Active Users',
        apps: 'Projects',
        revenue: 'Happy Clients',
      }
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  const features = [
    {
      icon: Code,
      title: language === 'vi' ? 'Công Nghệ Hiện Đại' : 'Modern Tech',
      desc: language === 'vi' ? 'Sử dụng React, Node.js, AI mới nhất.' : 'Using latest React, Node.js, AI stack.'
    },
    {
      icon: Shield,
      title: language === 'vi' ? 'An Toàn & Bảo Mật' : 'Secure & Safe',
      desc: language === 'vi' ? 'Bảo vệ dữ liệu người dùng tuyệt đối.' : 'Absolute user data protection.'
    },
    {
      icon: Zap,
      title: language === 'vi' ? 'Hiệu Suất Cao' : 'High Performance',
      desc: language === 'vi' ? 'Tối ưu hóa tốc độ và trải nghiệm.' : 'Optimized for speed and experience.'
    }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
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

        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-3xl space-y-6 neon-border"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl text-primary">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{texts.mission}</h3>
                <p className="text-muted-foreground">{texts.missionDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-xl text-accent">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{texts.vision}</h3>
                <p className="text-muted-foreground">{texts.visionDesc}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="text-4xl font-bold gradient-text mb-2">10k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">{texts.stats.users}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="text-4xl font-bold gradient-text mb-2">50+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">{texts.stats.apps}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center col-span-2">
              <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">{texts.stats.revenue}</div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-2xl text-center hover:bg-primary/5 transition-colors"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full gradient-neon flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
