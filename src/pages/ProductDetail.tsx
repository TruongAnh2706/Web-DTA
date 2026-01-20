import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { useAuthContext } from '@/contexts/AuthContext';
import { useDownloadHistory } from '@/hooks/useDownloadHistory';
import { toast } from 'sonner';

// Simple Markdown Renderer Component
const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  const lines = content.split('\n');
  return (
    <div className="space-y-4 text-muted-foreground leading-relaxed">
      {lines.map((line, index) => {
        // H2
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">{line.replace('## ', '')}</h2>;
        }
        // H3
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">{line.replace('### ', '')}</h3>;
        }
        // Bullet points
        if (line.trim().startsWith('- ')) {
          return (
            <div key={index} className="flex items-start gap-2 ml-4">
              <span className="text-primary mt-1.5">•</span>
              <span>{parseBold(line.replace('- ', ''))}</span>
            </div>
          );
        }
        // Empty line
        if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        }
        // Normal paragraph
        return <p key={index}>{parseBold(line)}</p>;
      })}
    </div>
  );
};

// Helper to parse **bold** text
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { data: app, isLoading, error } = useApp(id || '');
  const { session } = useAuthContext();
  const { addToHistory } = useDownloadHistory();
  const navigate = useNavigate();

  const handleAuthAction = (callback: () => void) => {
    if (!session) {
      toast.error(language === 'vi' ? 'Vui lòng đăng nhập để sử dụng tính năng này' : 'Please login to use this feature');
      navigate('/auth');
      return;
    }
    callback();
  };

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

  // Use Features Array if available (for future), currently static
  const basicFeatures = language === 'vi' ? [
    'Giao diện người dùng trực quan',
    'Hiệu suất tối ưu hóa',
    'Hỗ trợ đa ngôn ngữ',
    'Cập nhật tự động',
    'Hỗ trợ 24/7',
  ] : [
    'Intuitive interface',
    'Optimized performance',
    'Multi-language support',
    'Automatic updates',
    '24/7 support',
  ];

  const stats = [
    { icon: Star, value: '4.9', label: language === 'vi' ? 'Đánh giá' : 'Rating' },
    { icon: Download, value: '50K+', label: language === 'vi' ? 'Lượt tải' : 'Downloads' },
    { icon: Zap, value: '99.9%', label: language === 'vi' ? 'Uptime' : 'Uptime' },
  ];

  const imageUrl = app.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop&auto=format';

  // Use Screenshots from DB or fallback
  const screenshots = (app.screenshots && app.screenshots.length > 0)
    ? app.screenshots
    : [imageUrl, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop'];

  const handleMainAction = () => {
    handleAuthAction(() => {
      // Save to local history
      addToHistory({
        id: app.id,
        title: language === 'vi' ? app.title_vi : app.title,
        icon_name: app.icon_name
      }, app.platform === 'web' ? 'launch' : 'download');

      if (app.platform === 'web' && app.url && app.url !== '#') {
        window.open(app.url, '_blank');
      } else if (app.download_url) {
        window.open(app.download_url, '_blank');
      } else if (app.github_url) {
        window.open(app.github_url, '_blank');
      }
    });
  };

  const getVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(app.video_url);

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
                    {app.required_subscription && app.required_subscription !== 'Free' && (
                      <Badge variant="outline" className="border-amber-500 text-amber-500 font-bold text-xs">
                        {app.required_subscription}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="gradient-text">{title.split(' ').slice(-1)}</span>
              </h1>

              {/* Render Description using Markdown if available, else standard p */}
              <div className="text-lg text-muted-foreground mb-8 leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {description && <MarkdownRenderer content={description} />}
              </div>

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
              <div className="glass-card neon-border rounded-2xl overflow-hidden aspect-video">
                {videoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                    title="App Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img
                    src={screenshots[0]}
                    alt={`${title} screenshot`}
                    className="w-full h-full object-cover"
                  />
                )}
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
                  {basicFeatures.map((feature, index) => (
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
                      className="glass-card neon-border rounded-xl overflow-hidden cursor-pointer aspect-video"
                      onClick={() => window.open(src, '_blank')}
                    >
                      <img
                        src={src}
                        alt={`${title} screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="guide">
              {app.guide ? (
                <div className="glass-card rounded-2xl p-8 min-h-[400px]">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    {language === 'vi' ? 'Hướng Dẫn Cài Đặt & Sử Dụng' : 'Installation & Usage Guide'}
                  </h3>
                  <MarkdownRenderer content={app.guide} />
                </div>
              ) : (
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
              )}
            </TabsContent>

            <TabsContent value="video">
              {videoId ? (
                <div className="glass-card rounded-2xl p-4 md:p-8 min-h-[500px] flex items-center justify-center bg-black/40">
                  <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl neon-border">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="App Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex flex-col items-center justify-center glass-card rounded-2xl p-12 text-center relative overflow-hidden group hover:neon-border transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center mb-6 relative z-10"
                  >
                    <Youtube className="w-10 h-10 text-red-600" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2 relative z-10">
                    {language === 'vi' ? 'Xem video hướng dẫn tại DTA TV' : 'Watch Tutorials on DTA TV'}
                  </h3>

                  <p className="text-muted-foreground max-w-md mb-8 relative z-10">
                    {language === 'vi'
                      ? 'Hiện chưa có video riêng cho phần mềm này. Truy cập kênh YouTube chính thức của DTA để xem các hướng dẫn mới nhất.'
                      : 'Specific video for this app is not available yet. Visit our official YouTube channel for the latest tutorials and guides.'}
                  </p>

                  <Button
                    size="lg"
                    className="rounded-full bg-red-600 hover:bg-red-700 text-white relative z-10 shadow-lg shadow-red-600/20"
                    onClick={() => handleAuthAction(() => window.open('https://www.youtube.com/channel/UC5tB611cewWoBwaczEquAXg/', '_blank'))}
                  >
                    <Youtube className="w-5 h-5 mr-2" />
                    {language === 'vi' ? 'Truy Cập Kênh YouTube' : 'Visit YouTube Channel'}
                  </Button>
                </div>
              )}
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
