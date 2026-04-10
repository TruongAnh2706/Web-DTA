import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 text-center px-4">
        {/* Glitch 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8"
        >
          <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none gradient-text select-none relative">
            404
            {/* Glitch layers */}
            <span className="absolute inset-0 text-primary/20 animate-pulse" style={{ clipPath: 'inset(20% 0 30% 0)', transform: 'translate(4px, -2px)' }}>
              404
            </span>
            <span className="absolute inset-0 text-accent/20 animate-pulse" style={{ clipPath: 'inset(50% 0 10% 0)', transform: 'translate(-4px, 2px)' }}>
              404
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold">
            {language === 'vi' ? 'Trang không tồn tại' : 'Page Not Found'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {language === 'vi'
              ? 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'
              : 'Sorry, the page you are looking for does not exist or has been moved.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/">
              <Button className="btn-neon rounded-full px-8 py-6 text-background font-bold uppercase tracking-wider">
                <Home className="w-5 h-5 mr-2" />
                {language === 'vi' ? 'Về Trang Chủ' : 'Go Home'}
              </Button>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 font-bold uppercase tracking-wider glass border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {language === 'vi' ? 'Quay Lại' : 'Go Back'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-sm text-muted-foreground"
        >
          Phát triển bởi DTA Studio - Chủ quản: Đức Trường
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
