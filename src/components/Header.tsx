import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Languages, Settings, Wallet, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import WalletModal from './WalletModal';
import { SearchCommand } from './SearchCommand';
import { NotificationDropdown } from './NotificationDropdown';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { user, isAdmin, signOut } = useAuth();
  const { data: dashboardData } = useDashboard();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.tools'), href: '/tools' },
    { label: t('nav.resources'), href: '/resources' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.pricing'), href: '/pricing' },
    { label: t('nav.about'), href: '/about' },
  ];

  const toggleLanguage = () => {
    i18n.changeLanguage(language === 'en' ? 'vi' : 'en');
    localStorage.setItem('dta_language', language === 'en' ? 'vi' : 'en');
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
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-blue))] to-[hsl(var(--neon-red))] z-[60] shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className={`transition-all duration-300 ease-in-out ${scrolled ? 'mx-0 mt-0' : 'mx-4 mt-4'}`}>
          <div className={`transition-all duration-300 ease-in-out ${
            scrolled 
            ? 'bg-background/80 backdrop-blur-xl border-b border-[hsl(var(--neon-cyan)/0.2)] px-4 py-3 sm:px-6' 
            : 'glass rounded-2xl px-6 py-4 border-[hsl(var(--neon-cyan)/0.2)]'
          }`}>
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
                <SearchCommand />
                
                {!user ? (
                  <Link to="/auth">
                    <Button className="btn-neon rounded-xl text-background font-bold tracking-wider">
                      {t('nav.login')}
                    </Button>
                  </Link>
                ) : null}
                {/* User Avatar Dropdown */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-primary/10 hover:text-primary relative"
                        title="Account"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt="Avatar"
                          className="w-6 h-6 rounded-full"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel>
                        {t('nav.my_account')}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          <span>{t('nav.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Notification Dropdown */}
                {user && <NotificationDropdown />}

                {/* Wallet Button */}
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:inline-flex rounded-xl hover:bg-primary/10 hover:text-primary relative"
                    onClick={() => setIsWalletOpen(true)}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </Button>
                )}

                {/* Admin Link */}
                {isAdmin && (
                  <Link to="/admin" className="hidden sm:inline-flex">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                )}

                {/* Language Toggle */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
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
                    
                    {/* Mobile Only Extra Controls */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: navItems.length * 0.1 }}
                      className="flex flex-col gap-2 mt-4 pt-4 border-t border-primary/20 sm:hidden"
                    >
                      {user && (
                        <button
                          onClick={() => { setIsWalletOpen(true); setIsMenuOpen(false); }}
                          className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors font-semibold text-sm"
                        >
                          <Wallet className="w-5 h-5" />
                          <span>{language === 'vi' ? 'Ví của tôi' : 'My Wallet'}</span>
                        </button>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors font-semibold text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors font-semibold text-sm"
                      >
                        <Languages className="w-5 h-5" />
                        <span>{language === 'vi' ? 'Switch to English' : 'Đổi sang Tiếng Việt'}</span>
                      </button>
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors font-semibold text-sm"
                      >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </motion.div>
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
        balance={dashboardData?.wallet?.balance || 0}
      />
    </>
  );
};

export default Header;
