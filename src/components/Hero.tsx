import { motion } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 pt-24">
      <div className="max-w-5xl mx-auto text-center">
        {/* Logo & Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <motion.img
            src="/logo.png"
            alt="DTA Studio"
            className="h-20 w-auto object-contain"
            animate={{
              filter: ['drop-shadow(0 0 20px hsl(185 100% 55% / 0.5))', 'drop-shadow(0 0 40px hsl(185 100% 55% / 0.8))', 'drop-shadow(0 0 20px hsl(185 100% 55% / 0.5))']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 text-sm font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="gradient-text">{t.hero.badge}</span>
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-tight"
        >
          <span className="block">{t.hero.title.line1}</span>
          <span className="gradient-text block">{t.hero.title.line2}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="btn-neon rounded-full px-10 py-7 text-lg font-bold uppercase tracking-wider text-background"
              onClick={() => document.getElementById('apps')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.hero.cta.explore}
              <ChevronDown className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-10 py-7 text-lg font-bold uppercase tracking-wider glass border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.hero.cta.learn}
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest font-semibold">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-primary glow-cyan"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
