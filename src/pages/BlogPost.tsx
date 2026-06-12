import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import TextToSpeech from '@/components/TextToSpeech';
import { BlogPost } from '@/hooks/useBlog';
import { Loader2, Calendar, ArrowLeft, Share2, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const BlogPostPage = () => {
    const { slug } = useParams();
    const { t, language } = useLanguage();

    const { data: post, isLoading } = useQuery({
        queryKey: ['blog-post', slug],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from('posts' as any)
                .select('*')
                .eq('slug', slug)
                .single());

            if (error) throw error;
            return data as unknown as BlogPost;
        },
        enabled: !!slug
    });

    // Cập nhật thẻ SEO động
    useEffect(() => {
        if (post) {
            document.title = `${post.title} | DTA Studio Blog`;
            
            // Xử lý content để lấy đoạn mô tả ngắn gọn không chứa HTML
            const plainText = post.content?.replace(/<[^>]+>/g, '').substring(0, 150) || '';
            const descriptionStr = plainText.length === 150 ? `${plainText}...` : plainText;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', descriptionStr);
            } else {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                metaDesc.setAttribute('content', descriptionStr);
                document.head.appendChild(metaDesc);
            }
            
            // Open Graph
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (!ogTitle) {
                ogTitle = document.createElement('meta');
                ogTitle.setAttribute('property', 'og:title');
                document.head.appendChild(ogTitle);
            }
            ogTitle.setAttribute('content', post.title);

            // OG Image
            if (post.cover_image) {
                let ogImage = document.querySelector('meta[property="og:image"]');
                if (!ogImage) {
                    ogImage = document.createElement('meta');
                    ogImage.setAttribute('property', 'og:image');
                    document.head.appendChild(ogImage);
                }
                ogImage.setAttribute('content', post.cover_image);
            }
        }
        
        return () => {
            document.title = 'DTA Studio';
        };
    }, [post]);

    // Skeleton Loading
    if (isLoading) {
        return (
            <div className="min-h-screen relative flex flex-col">
                <AnimatedBackground />
                <Header />
                <div className="w-full h-[50vh] min-h-[400px] mt-20 relative">
                    <Skeleton className="absolute inset-0 opacity-20" />
                </div>
                <div className="container mx-auto px-4 max-w-4xl -mt-24 mb-20 relative z-20">
                    <div className="glass-card p-8 md:p-12 rounded-3xl space-y-6">
                        <Skeleton className="w-3/4 h-10 opacity-20" />
                        <Skeleton className="w-full h-4 opacity-20" />
                        <Skeleton className="w-full h-4 opacity-20" />
                        <Skeleton className="w-5/6 h-4 opacity-20" />
                        <Skeleton className="w-full h-[200px] rounded-xl opacity-20" />
                        <Skeleton className="w-full h-4 opacity-20" />
                        <Skeleton className="w-2/3 h-4 opacity-20" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <AnimatedBackground />
                <h1 className="text-4xl font-bold">Post Not Found</h1>
                <Link to="/blog">
                    <Button variant="outline">{t.blog.back}</Button>
                </Link>
            </div>
        );
    }

    const readingTime = Math.ceil((post.content?.length || 0) / 1000);

    return (
        <div className="min-h-screen relative flex flex-col">
            <AnimatedBackground />
            <Header />

            {/* Hero Image Background & Title Overlay */}
            <div className="relative w-full h-[55vh] min-h-[450px] lg:h-[60vh] flex items-end justify-center overflow-hidden pb-32 mt-20">
                {/* Background Image */}
                <div className="absolute inset-0">
                    {post.cover_image ? (
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-accent/20" />
                    )}
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                </div>

                {/* Back Button */}
                <div className="absolute top-24 left-4 md:left-8 z-30">
                    <Link to="/blog">
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors gap-2 rounded-xl backdrop-blur-sm">
                            <ArrowLeft className="w-4 h-4" /> {t.blog.back}
                        </Button>
                    </Link>
                </div>

                {/* Content Overlay */}
                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto space-y-5"
                    >
                        {/* Tags */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {post.tags?.map(tag => (
                                <Badge key={tag} className="bg-primary/80 hover:bg-primary text-white border-0 backdrop-blur-sm shadow-lg px-3 py-1">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg text-balance tracking-tight">
                            {post.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex items-center justify-center gap-4 text-white/80 text-sm font-medium pt-2">
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(post.created_at), t.blog.dateFormat, { locale: language === 'vi' ? vi : undefined })}
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                <Clock className="w-4 h-4" />
                                {readingTime} {t.blog.minRead}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 relative z-20 max-w-5xl -mt-24 mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                    
                    {/* Main Article */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 md:p-10 lg:p-12 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40"
                    >
                        <div
                            className="prose prose-invert prose-lg max-w-none
                                prose-headings:font-bold prose-headings:tracking-tight
                                prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:mt-8
                                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-5 prose-h2:mt-12 prose-h2:pb-3 prose-h2:border-b prose-h2:border-primary/20
                                prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-8
                                prose-p:leading-[1.9] prose-p:mb-5 prose-p:text-foreground/85
                                prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-8
                                prose-strong:text-primary prose-strong:font-bold
                                prose-a:text-primary prose-a:underline-offset-4
                                prose-ul:my-5 prose-ul:space-y-2
                                prose-ol:my-5 prose-ol:space-y-2
                                prose-li:leading-relaxed
                                prose-hr:border-none prose-hr:my-12
                                prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
                                marker:text-primary"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />

                        {/* Share / Footer of Article */}
                        <div className="mt-16 pt-8 border-t border-white/10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-muted-foreground font-medium text-center md:text-left">
                                    {t.blog.thanks}
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="hover:bg-primary/20 hover:text-primary transition-colors border-white/10 rounded-xl" 
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                        }}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" /> {t.blog.share}
                                    </Button>
                                    <Link to="/blog">
                                        <Button variant="outline" size="sm" className="border-white/10 rounded-xl hover:bg-primary/10">
                                            <ArrowLeft className="w-4 h-4 mr-2" /> {language === 'vi' ? 'Xem thêm bài viết' : 'More articles'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.article>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6 lg:sticky lg:top-28 lg:self-start"
                    >
                        {/* Text-to-Speech Widget */}
                        <TextToSpeech content={post.content || ''} />

                        {/* Bài viết Info Card */}
                        <div className="glass-card rounded-2xl p-5 border border-primary/20 space-y-4">
                            <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                {language === 'vi' ? 'Thông tin bài viết' : 'Article Info'}
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{language === 'vi' ? 'Thời gian đọc' : 'Reading time'}</span>
                                    <span className="font-semibold text-foreground">{readingTime} {t.blog.minRead}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{language === 'vi' ? 'Ngày đăng' : 'Published'}</span>
                                    <span className="font-semibold text-foreground">
                                        {format(new Date(post.created_at), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                {post.tags && post.tags.length > 0 && (
                                    <div className="pt-3 border-t border-primary/10">
                                        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs rounded-lg">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA Card */}
                        <div className="glass-card rounded-2xl p-5 border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
                            <h4 className="font-bold text-sm mb-2">
                                {language === 'vi' ? '🚀 Khám phá DTA Studio' : '🚀 Explore DTA Studio'}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                {language === 'vi' 
                                    ? 'Hệ sinh thái công cụ tự động hóa giúp bạn tiết kiệm thời gian và tăng hiệu suất.' 
                                    : 'Automation tool ecosystem to save time and boost productivity.'}
                            </p>
                            <Link to="/#apps">
                                <Button className="w-full btn-neon rounded-xl text-background text-xs font-bold py-4">
                                    {language === 'vi' ? 'Xem tất cả công cụ' : 'View all tools'}
                                </Button>
                            </Link>
                        </div>
                    </motion.aside>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BlogPostPage;
