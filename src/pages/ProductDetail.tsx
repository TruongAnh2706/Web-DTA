import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Download, Globe, Monitor, Star, Check, Zap, Shield, Clock, Github, Loader2, BookOpen, Youtube, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp, getIconComponent } from '@/hooks/useApps';
import GitHubReleaseCard from '@/components/GitHubReleaseCard';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { data: app, isLoading, error } = useApp(id || '');

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <AnimatedBackground />
        <Header />
        <main className="pt-32 pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{language === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product Not Found'}</h1>
            <p className="text-muted-foreground mb-8">
              {language === 'vi'
                ? 'Sản phẩm bạn tìm kiếm không tồn tại.'
                : 'The product you are looking for does not exist.'}
            </p>
            <Link to="/#apps">
              <Button className="btn-neon rounded-full px-8 py-6 text-background font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Quay lại' : 'Go Back'}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = getIconComponent(app.icon_name);
  const title = language === 'vi' ? app.title_vi : app.title;
  const description = language === 'vi' ? app.description_vi : app.description;

  const features = language === 'vi' ? [
    'Giao diện người dùng trực quan và dễ sử dụng',
    'Hiệu suất cao và tối ưu hóa bộ nhớ',
    'Hỗ trợ đa ngôn ngữ',
    'Cập nhật tự động miễn phí',
    'Hỗ trợ kỹ thuật 24/7',
    'Tích hợp API linh hoạt',
  ] : [
    'Intuitive and user-friendly interface',
    'High performance and memory optimized',
    'Multi-language support',
    'Free automatic updates',
    '24/7 technical support',
    'Flexible API integration',
  ];

  const stats = [
    { icon: Star, value: '4.9', label: language === 'vi' ? 'Đánh giá' : 'Rating' },
    { icon: Download, value: '50K+', label: language === 'vi' ? 'Lượt tải' : 'Downloads' },
    { icon: Zap, value: '99.9%', label: language === 'vi' ? 'Uptime' : 'Uptime' },
  ];

  const imageUrl = app.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop&auto=format';
  const screenshots = [
    imageUrl,
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop&auto=format',
  ];

  const handleMainAction = () => {
    if (app.platform === 'web' && app.url && app.url !== '#') {
      window.open(app.url, '_blank');
    } else if (app.download_url) {
      window.open(app.download_url, '_blank');
    } else if (app.github_url) {
      window.open(app.github_url, '_blank');
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <Header />

      <main className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/#apps">
              <Button variant="ghost" className="rounded-full hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Quay lại danh sách' : 'Back to Apps'}
              </Button>
            </Link>
          </motion.div>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl gradient-neon flex items-center justify-center glow-sm"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon className="w-8 h-8 text-background" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5 bg-primary/10 border-primary/20"
                    >
                      {app.platform === 'web' ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-primary" />
                          <span className="text-primary font-semibold">{t.badges.web}</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-accent" />
                          <span className="text-accent font-semibold">{t.badges.desktop}</span>
                        </>
                      )}
                    </Badge>
                    {app.featured && (
                      <Badge className="gradient-neon text-background border-0 font-bold text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="gradient-text">{title.split(' ').slice(-1)}</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="glass-card p-4 text-center rounded-xl"
                  >
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="btn-neon rounded-full px-10 py-7 text-lg font-bold uppercase tracking-wider text-background"
                    onClick={handleMainAction}
                  >
                    {app.platform === 'web' ? (
                      <>
                        {t.apps.launch}
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        {t.apps.download}
                        <Download className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* GitHub Release Card */}
              {app.github_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <GitHubReleaseCard repoUrl={app.github_url} />
                </motion.div>
              )}
            </motion.div>

            {/* Right: Main Screenshot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card neon-border rounded-2xl overflow-hidden">
                <img
                  src={screenshots[0]}
                  alt={`${title} screenshot`}
                  className="w-full h-auto object-cover"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl glass-card p-2 glow-sm"
              >
                <img src="/logo.png" alt="DTA Studio" className="w-full h-full object-contain" />
              </motion.div>
            </motion.div>
          </div>

          {/* TABS SECTION */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-xl mb-8 h-auto">
              <TabsTrigger value="overview" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Layout className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Tổng Quan' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="guide" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <BookOpen className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Hướng Dẫn' : 'Guide'}
              </TabsTrigger>
              <TabsTrigger value="video" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Youtube className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Video' : 'Video'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-8 text-center">
                  {language === 'vi' ? 'Tính năng ' : 'Key '}
                  <span className="gradient-text">{language === 'vi' ? 'Nổi Bật' : 'Features'}</span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 rounded-xl flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Screenshots Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-8 text-center">
                  {language === 'vi' ? 'Ảnh ' : 'Screen'}
                  <span className="gradient-text">{language === 'vi' ? 'Màn Hình' : 'shots'}</span>
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {screenshots.map((src, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="glass-card neon-border rounded-xl overflow-hidden cursor-pointer"
                    >
                      <img
                        src={src}
                        alt={`${title} screenshot ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="guide">
              <div className="min-h-[400px] flex flex-col items-center justify-center glass-card rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'vi' ? 'Hướng dẫn chưa có sẵn' : 'Guide Not Available'}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {language === 'vi'
                    ? 'Chúng tôi đang biên soạn tài liệu hướng dẫn chi tiết cho sản phẩm này. Vui lòng quay lại sau.'
                    : 'We are currently working on detailed documentation for this product. Please check back later.'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="video">
              <div className="min-h-[400px] flex flex-col items-center justify-center glass-card rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Youtube className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'vi' ? 'Video chưa có sẵn' : 'Video Not Available'}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {language === 'vi'
                    ? 'Video giới thiệu và hướng dẫn đang được sản xuất. Hãy đăng ký kênh YouTube của chúng tôi để cập nhật.'
                    : 'Introduction and tutorial videos are coming soon. Subscribe to our YouTube channel for updates.'}
                </p>
                <Button variant="outline" className="mt-6 rounded-full" onClick={() => window.open('https://youtube.com', '_blank')}>
                  {language === 'vi' ? 'Truy cập YouTube' : 'Visit YouTube'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card neon-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <img src="/logo.png" alt="DTA Studio" className="h-12 w-auto" />
              <div>
                <h3 className="text-xl font-bold">DTA Studio</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Nhà phát triển phần mềm' : 'Software Developer'}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">{language === 'vi' ? 'An toàn' : 'Secure'}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Đã xác minh' : 'Verified Safe'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">{language === 'vi' ? 'Cập nhật' : 'Updated'}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Thường xuyên' : 'Regularly'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">{language === 'vi' ? 'Hiệu suất' : 'Performance'}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Tối ưu hóa' : 'Optimized'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
