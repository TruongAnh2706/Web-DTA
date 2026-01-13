import { motion } from 'framer-motion';
import { Github, Facebook, Mail, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const socialLinks = [
  { icon: Github, href: 'https://github.com/TruongAnh2706', label: 'GitHub' },
  { icon: Facebook, href: 'https://www.facebook.com/phamductruong17/', label: 'Facebook' },
  { icon: Mail, href: 'mailto:ductruong.onl@gmail.com', label: 'Email' },
];

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-12 px-4 border-t border-primary/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start gap-2"
          >
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DTA Studio"
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-lg">
                DTA <span className="gradient-text">Studio</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t.footer.copyright}
              <Heart className="w-3 h-3 text-accent inline mx-1" />
              DTA Studio
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
