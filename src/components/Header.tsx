import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Languages, Settings, Wallet } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import WalletModal from './WalletModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.apps, href: '/#apps' }, // We'll handle this click to ensure scrolling
    { label: language === 'vi' ? 'Bảng Giá' : 'Pricing', href: '/pricing' },
    { label: t.nav.about, href: '/#about' },
    { label: t.nav.contact, href: '/#contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  // Handle smooth scroll for hash links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      // If we are on the home page, scroll smoothly
      if (window.location.pathname === '/') {
        e.preventDefault();
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // If we are NOT on home page, Link will navigate to /, then we need to scroll. 
      // This usually requires a separate wrapper or useEffect on Index page.
    }

    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="glass rounded-2xl px-6 py-4 border-[hsl(var(--neon-cyan)/0.2)]">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <img
                  src="/logo.png"
                  alt="DTA Studio"
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden items-center gap-2">
                  <div className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center glow-sm">
                    <span className="text-background font-bold text-lg">D</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight">
                    DTA <span className="gradient-text">Studio</span>
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-muted-foreground hover:text-primary transition-colors font-semibold uppercase tracking-wider text-sm"
                  >
                    <motion.span
                      whileHover={{ y: -2, textShadow: '0 0 10px hsl(var(--neon-cyan) / 0.5)' }}
                      whileTap={{ y: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
              </nav>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {!user ? (
                  <Link to="/auth">
                    <Button className="btn-neon rounded-xl text-background font-bold tracking-wider">
                      {language === 'vi' ? 'Đăng Nhập' : 'Login'}
                    </Button>
                  </Link>
                ) : null}
                {/* Dashboard Link */}
                {user && (
                  <Link to="/dashboard">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-primary/10 hover:text-primary relative"
                      title="Dashboard"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full"
                      />
                    </Button>
                  </Link>
                )}

                {/* Wallet Button */}
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-primary/10 hover:text-primary relative"
                    onClick={() => setIsWalletOpen(true)}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </Button>
                )}

                {/* Admin Link */}
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                )}

                {/* Language Toggle */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLanguage}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary"
                  >
                    <Languages className="w-5 h-5" />
                    <span className="sr-only">Toggle language</span>
                  </Button>
                </motion.div>
                <span className="text-sm font-bold text-primary hidden sm:block uppercase tracking-wider">
                  {language}
                </span>

                {/* Theme Toggle */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary"
                  >
                    <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </motion.div>

                {/* Mobile Menu Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary"
                  >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.nav
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="pt-4 pb-2 flex flex-col gap-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.href}
                          className="block py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors font-semibold uppercase tracking-wider text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={0} // Mock balance for now, can be connected to Supabase later
      />
    </>
  );
};

export default Header;
