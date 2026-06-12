import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import InteractiveGrid from './InteractiveGrid';

const Hero = () => {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);

  // Tách tiêu đề thành các từ để tạo staggered animation cao cấp
  const titleText = t('home.hero.title');
  const words = titleText.split(' ');

  const marqueeRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = Math.abs(currentScrollY - lastScrollY.current);
      
      // Vận tốc tỷ lệ với chênh lệch cuộn (vận tốc càng cao thì thời gian chạy càng nhỏ)
      const newVelocity = Math.min(1 + diff * 0.04, 2.5);

      if (marqueeRef.current) {
        // Cập nhật hướng dựa trên chiều cuộn
        if (currentScrollY > lastScrollY.current) {
          marqueeRef.current.style.setProperty('--marquee-dir', 'reverse');
        } else {
          marqueeRef.current.style.setProperty('--marquee-dir', 'normal');
        }
        marqueeRef.current.style.setProperty('--marquee-speed', `${60 / newVelocity}s`);
      }
      
      lastScrollY.current = currentScrollY;

      // Reset về tốc độ thường sau khi dừng cuộn 150ms
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        if (marqueeRef.current) {
          marqueeRef.current.style.setProperty('--marquee-speed', '60s');
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-4 pt-24 overflow-hidden bg-background scanlines">
      {/* Nền lưới 3D tương tác theo chuột */}
      <InteractiveGrid />

      {/* Cyber HUD Tech-Lines Deco */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-25">
        {/* Đường chéo góc trên trái */}
        <svg className="absolute top-0 left-0 w-80 h-80 text-primary" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" />
          <circle cx="50" cy="50" r="1.5" fill="currentColor" className="animate-pulse" />
        </svg>
        {/* Đường chéo góc trên phải */}
        <svg className="absolute top-0 right-0 w-80 h-80 text-accent" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" />
          <circle cx="50" cy="50" r="1.5" fill="currentColor" className="animate-pulse" />
        </svg>
        {/* Tech-lines dọc cạnh màn hình */}
        <div className="absolute left-10 top-1/4 bottom-1/4 w-[1.5px] bg-gradient-to-b from-transparent via-primary/45 to-transparent" />
        <div className="absolute right-10 top-1/4 bottom-1/4 w-[1.5px] bg-gradient-to-b from-transparent via-accent/45 to-transparent" />
      </div>

      {/* Background Marquee chạy ẩn phía sau chứa thông điệp ý nghĩa */}
      <div className="absolute inset-0 flex flex-col justify-center pointer-events-none opacity-[0.025] select-none z-0 overflow-hidden">
        <div ref={marqueeRef} className="animate-marquee-infinite text-[9.5vw] font-black uppercase text-foreground leading-none tracking-widest" style={{ '--marquee-speed': '60s' } as React.CSSProperties}>
          <span>DTA STUDIO ĐƯỢC PHÁT TRIỂN BỞI ĐỨC TRƯỜNG AI GIÚP MANG LẠI HỆ SINH THÁI PHẦN MỀM CÔNG NGHỆ CHUYÊN SÂU HỖ TRỢ CONTENT CREATER • &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>DTA STUDIO ĐƯỢC PHÁT TRIỂN BỞI ĐỨC TRƯỜNG AI GIÚP MANG LẠI HỆ SINH THÁI PHẦN MỀM CÔNG NGHỆ CHUYÊN SÂU HỖ TRỢ CONTENT CREATER • &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      <motion.div style={{ y: y1 }} className="max-w-5xl mx-auto text-center relative z-10">
        {/* Logo & Badge - PHÓNG TO LOGO ĐỂ NHẬN DIỆN THƯƠNG HIỆU */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <div className="relative animate-cyber-float">
            {/* Tech-rings nghiêng 3D quay quanh logo */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center scale-[1.5] z-0" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              {/* Vòng 1: Nghiêng Trái */}
              <div style={{ transform: 'rotateX(65deg) rotateY(25deg)', transformStyle: 'preserve-3d' }} className="absolute">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="w-52 h-52 rounded-full border-2 border-dashed border-primary/45"
                />
              </div>
              
              {/* Vòng 2: Nghiêng Phải */}
              <div style={{ transform: 'rotateX(65deg) rotateY(-25deg)', transformStyle: 'preserve-3d' }} className="absolute">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                  className="w-64 h-64 rounded-full border-[3px] border-dotted border-accent/45"
                />
              </div>
            </div>
            
            <motion.img
              src="/logo.png"
              alt="DTA Studio"
              className="h-36 sm:h-40 md:h-44 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(0,240,255,0.4)] relative z-10"
              animate={{
                filter: [
                  'drop-shadow(0 0 20px rgba(0, 240, 255, 0.35)) drop-shadow(0 0 5px rgba(0, 240, 255, 0.2))',
                  'drop-shadow(0 0 35px rgba(255, 0, 85, 0.5)) drop-shadow(0 0 10px rgba(255, 0, 85, 0.3))',
                  'drop-shadow(0 0 20px rgba(0, 240, 255, 0.35)) drop-shadow(0 0 5px rgba(0, 240, 255, 0.2))'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full cyber-glass border-primary/30 text-sm font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="gradient-text font-black">DTA Studio Ecosystem</span>
          </span>
        </motion.div>

        {/* Title H1 - Staggered Words trượt mượt mà từng chữ */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight flex flex-wrap justify-center overflow-hidden py-2">
          {words.map((word, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 50, letterSpacing: "-0.05em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.02em" }}
              transition={{ 
                duration: 1.2, 
                ease: [0.25, 1, 0.5, 1], 
                delay: 0.1 + idx * 0.08 
              }}
              className="shimmer-text inline-block mr-3 md:mr-4 leading-tight pb-2"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t('home.hero.subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="btn-neon rounded-full px-10 py-7 text-base font-black uppercase tracking-wider text-background"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('home.hero.cta')}
              <ChevronDown className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute -bottom-24 left-1/2 -translate-x-1/2"
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
      </motion.div>

      {/* Floating Neon Blobs chuyển động ngẫu nhiên tạo Mesh Gradient */}
      <motion.div style={{ y: y2 }} className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 60, -40, 0],
            y: [0, -80, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[hsl(var(--neon-cyan))]/5 rounded-full mix-blend-screen filter blur-[140px] opacity-40" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 60, 0],
            y: [0, 70, -60, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] bg-[hsl(var(--neon-red))]/5 rounded-full mix-blend-screen filter blur-[140px] opacity-40" 
        />
      </motion.div>
    </section>
  );
};

export default Hero;
