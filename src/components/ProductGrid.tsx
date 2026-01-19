import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Monitor, ExternalLink, Download, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApps, getIconComponent, type AppData } from '@/hooks/useApps';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/data';
import { useAuthContext, type AccountType } from '@/contexts/AuthContext';
import UpgradeModal from '@/components/UpgradeModal';

// Helper function để so sánh cấp độ subscription
const subscriptionLevels: Record<AccountType, number> = {
  'Free': 0,
  'VIP1': 1,
  'VIP2': 2,
};

const hasAccess = (userLevel: AccountType, requiredLevel: AccountType): boolean => {
  return subscriptionLevels[userLevel] >= subscriptionLevels[requiredLevel];
};

type Category = 'all' | 'web' | 'desktop' | 'automation';

const categories: { id: Category; labelKey: keyof typeof translations.en.categories }[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'web', labelKey: 'web' },
  { id: 'desktop', labelKey: 'desktop' },
  { id: 'automation', labelKey: 'automation' },
];

interface ProductCardProps {
  app: AppData;
  index: number;
  isLocked?: boolean;
  onLockedClick?: () => void;
}

const ProductCard = ({ app, index, isLocked = false, onLockedClick }: ProductCardProps) => {
  const { language, t } = useLanguage();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const Icon = getIconComponent(app.icon_name);
  const title = language === 'vi' ? app.title_vi : app.title;
  const description = language === 'vi' ? app.description_vi : app.description;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -15;
    const rotateYValue = ((x - centerX) / centerX) * 15;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const imageUrl = app.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=340&fit=crop&auto=format';

  // Handler for locked app click
  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked && onLockedClick) {
      e.preventDefault();
      onLockedClick();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group perspective-1000"
      onClick={handleCardClick}
    >
      <Link to={isLocked ? '#' : `/app/${app.id}`} className={isLocked ? 'cursor-pointer' : ''}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-card neon-border p-0 h-full flex flex-col overflow-hidden transform-gpu cursor-pointer"
        >
          {/* Image Container */}
          <div
            className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-secondary/50 to-muted/50"
            style={{ transform: 'translateZ(20px)' }}
          >
            <img
              src={imageUrl}
              alt={`${title} interface`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

            <motion.div
              className="absolute top-4 left-4 w-12 h-12 rounded-xl gradient-neon flex items-center justify-center glow-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{ transform: 'translateZ(40px)' }}
            >
              <Icon className="w-6 h-6 text-background" />
            </motion.div>

            {app.featured && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4"
                style={{ transform: 'translateZ(40px)' }}
              >
                <Badge className="gradient-neon text-background border-0 font-bold uppercase tracking-wider text-xs px-3 py-1">
                  Featured
                </Badge>
              </motion.div>
            )}

            {/* Lock Badge for VIP apps */}
            {isLocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/2 left-1/2 z-20"
                style={{ transform: 'translate3d(-50%, -50%, 40px)' }}
              >
                <Badge className="bg-amber-500/90 text-white border-0 font-bold uppercase tracking-wider text-sm px-4 py-2 flex items-center gap-2 shadow-lg backdrop-blur-md">
                  <Lock className="w-4 h-4" />
                  VIP ACCESS
                </Badge>
              </motion.div>
            )}

            <div className="absolute bottom-4 left-4" style={{ transform: 'translateZ(30px)' }}>
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border-primary/20"
              >
                {app.platform === 'web' ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span className="text-foreground font-semibold">{t.badges.web}</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-accent" />
                    <span className="text-foreground font-semibold">{t.badges.desktop}</span>
                  </>
                )}
              </Badge>
            </div>

            <div className="absolute bottom-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ transform: 'translateZ(30px)' }}>
              <img src="/logo.png" alt="DTA Studio" className="h-6 w-auto" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-grow" style={{ transform: 'translateZ(15px)' }}>
            <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm flex-grow mb-6 line-clamp-3 leading-relaxed">
              {description}
            </p>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full btn-neon rounded-xl text-background font-bold uppercase tracking-wider py-5"
                onClick={(e) => e.preventDefault()}
              >
                {app.platform === 'web' ? (
                  <>
                    {t.apps.launch}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {t.apps.download}
                    <Download className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* 3D Shine effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
              transform: 'translateZ(50px)',
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
};

const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedRequiredLevel, setSelectedRequiredLevel] = useState<AccountType>('VIP1');
  const { t } = useLanguage();
  const { data: apps, isLoading, error } = useApps();
  const { accountType } = useAuthContext();

  const handleLockedAppClick = (requiredLevel: AccountType) => {
    setSelectedRequiredLevel(requiredLevel);
    setUpgradeModalOpen(true);
  };

  const filteredApps = activeCategory === 'all'
    ? apps
    : apps?.filter(app => app.categories.includes(activeCategory));

  return (
    <section id="apps" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {t.apps.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{t.apps.title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t.apps.subtitle}
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold uppercase tracking-wider text-sm transition-all duration-300 ${activeCategory === cat.id
                ? 'btn-neon text-background'
                : 'glass border-primary/20 hover:border-primary/50 hover:bg-primary/10'
                }`}
            >
              {t.categories[cat.labelKey]}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-destructive">
            <p>Error loading apps. Please try again.</p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredApps?.map((app, index) => {
                const requiredLevel = app.required_subscription || 'Free';
                const canAccess = hasAccess(accountType, requiredLevel);
                const isLocked = !canAccess && requiredLevel !== 'Free';

                return (
                  <ProductCard
                    key={app.id}
                    app={app}
                    index={index}
                    isLocked={isLocked}
                    onLockedClick={() => handleLockedAppClick(requiredLevel)}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requiredLevel={selectedRequiredLevel}
      />
    </section>
  );
};

export default ProductGrid;
