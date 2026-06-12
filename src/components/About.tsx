import { motion } from 'framer-motion';
import { Cpu, Layout, Zap, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      id: 'tech',
      icon: Cpu,
      title: t('home.why_us.tech.title'),
      desc: t('home.why_us.tech.desc'),
      color: 'text-neon-cyan',
      bgGlow: 'bg-[hsl(var(--neon-cyan))]',
      delay: 0
    },
    {
      id: 'user',
      icon: Layout,
      title: t('home.why_us.user.title'),
      desc: t('home.why_us.user.desc'),
      color: 'text-neon-red',
      bgGlow: 'bg-[hsl(var(--neon-red))]',
      delay: 0.2
    },
    {
      id: 'efficiency',
      icon: Zap,
      title: t('home.why_us.efficiency.title'),
      desc: t('home.why_us.efficiency.desc'),
      color: 'text-neon-cyan',
      bgGlow: 'bg-[hsl(var(--neon-cyan))]',
      delay: 0.4
    }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <span className="gradient-text">{t('home.why_us.title')}</span>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {features.map((feature, idx) => {
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: feature.delay }}
                className="relative z-10"
              >
                <div className="cyber-glass p-8 rounded-3xl h-full border border-white/5 transform hover:-translate-y-2 transition-all duration-500">
                  {/* Background Glow */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 ${feature.bgGlow} opacity-[0.03] rounded-full blur-3xl`} />
                  
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transform transition-transform duration-500 hover:rotate-6">
                    <feature.icon className="w-8 h-8 text-white/80" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-xs">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Parallax Background Elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[hsl(var(--neon-cyan))] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(var(--neon-red))] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none -translate-x-1/2 translate-y-1/4" />
    </section>
  );
};

export default About;
