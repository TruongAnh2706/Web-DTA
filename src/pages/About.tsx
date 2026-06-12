import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Zap, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import { Helmet } from 'react-helmet';

const AboutPage = () => {
  const { t } = useTranslation();

  const values = [
    {
      id: 'ai',
      icon: BrainCircuit,
      title: t('home.about_page.values.ai.title'),
      desc: t('home.about_page.values.ai.desc'),
      glowClass: 'bg-[hsl(var(--neon-cyan))]',
      textColor: 'text-neon-cyan',
      delay: 0.1
    },
    {
      id: 'efficiency',
      icon: Zap,
      title: t('home.about_page.values.efficiency.title'),
      desc: t('home.about_page.values.efficiency.desc'),
      glowClass: 'bg-[hsl(var(--neon-red))]',
      textColor: 'text-neon-red',
      delay: 0.3
    },
    {
      id: 'growth',
      icon: TrendingUp,
      title: t('home.about_page.values.growth.title'),
      desc: t('home.about_page.values.growth.desc'),
      glowClass: 'bg-[hsl(var(--neon-cyan))]',
      textColor: 'text-neon-cyan',
      delay: 0.5
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('nav.about')} - DTA Studio</title>
        <meta name="description" content={t('home.about_page.title')} />
        <meta name="keywords" content="DTA Studio, AI Content Automation, YouTube Workflow, Video Downloader Pro, AI Voiceover Solutions" />
      </Helmet>

      <main className="min-h-screen pt-32 pb-24 relative overflow-hidden">
        <article className="max-w-6xl mx-auto px-4 relative z-10">
          
          {/* Header Section */}
          <header className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
                <span className="gradient-text">{t('home.about_page.title')}</span>
              </h1>
            </motion.div>
          </header>

          {/* Mission Section */}
          <section className="mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card neon-border rounded-3xl p-8 md:p-12 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[hsl(var(--neon-cyan))] opacity-10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl gradient-neon flex items-center justify-center glow-sm transform rotate-3">
                  <Target className="w-10 h-10 text-background" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  {t('home.about_page.mission.title')}
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  {t('home.about_page.mission.desc')}
                </p>
              </div>
            </motion.div>
          </section>

          {/* Core Values Section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <span className="gradient-text">{t('home.about_page.values.title')}</span>
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val) => (
                <motion.div
                  key={val.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: val.delay }}
                  className="h-full"
                >
                  <div className="glass-card neon-border rounded-3xl p-8 h-full flex flex-col items-center text-center relative overflow-hidden group transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_0_40px_rgba(var(--primary),0.2)]">
                    {/* Hover Glow Effect */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${val.glowClass} opacity-0 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
                    
                    <div className="w-16 h-16 rounded-2xl gradient-neon flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <val.icon className="w-8 h-8 text-background" />
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-4 ${val.textColor}`}>
                      {val.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed flex-grow text-lg">
                      {val.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </article>

        {/* Global Parallax Elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[hsl(var(--neon-cyan))] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[hsl(var(--neon-red))] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none -translate-x-1/2" />
      </main>
    </>
  );
};

export default AboutPage;
