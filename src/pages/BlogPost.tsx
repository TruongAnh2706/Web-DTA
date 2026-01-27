
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { BlogPost } from '@/hooks/useBlog';
import { Loader2, Calendar, ArrowLeft, Share2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AnimatedBackground />
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

    return (
        <div className="min-h-screen relative flex flex-col">
            <AnimatedBackground />
            <Header />

            {/* Hero Image Background & Title Overlay */}
            <div className="relative w-full h-[50vh] min-h-[400px] flex items-end justify-center overflow-hidden pb-32 mt-20">
                {/* Background Image */}
                <div className="absolute inset-0">
                    {post.cover_image && (
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/50" /> {/* Dark Overlay - Slightly lighter */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>

                {/* Back Button - Absolute Top Left */}
                <div className="absolute top-24 left-4 md:left-8 z-30">
                    <Link to="/blog">
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors gap-2">
                            <ArrowLeft className="w-4 h-4" /> {t.blog.back}
                        </Button>
                    </Link>
                </div>

                {/* Content Overlay */}
                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto space-y-4"
                    >
                        {/* Tags */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                            {post.tags?.map(tag => (
                                <Badge key={tag} className="bg-primary/80 hover:bg-primary text-white border-0 backdrop-blur-sm shadow-lg">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg text-balance">
                            {post.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex items-center justify-center gap-6 text-white/80 text-sm font-medium pt-2">
                            <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(post.created_at), t.blog.dateFormat, { locale: language === 'vi' ? vi : undefined })}
                            </span>
                            <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Clock className="w-4 h-4" />
                                {Math.ceil((post.content?.length || 0) / 1000)} {t.blog.minRead}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Card - Floating up overlapping the Hero */}
            <article className="container mx-auto px-4 relative z-20 max-w-4xl -mt-24 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40"
                >
                    <div
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />

                    {/* Share / Footer of Article */}
                    <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-muted-foreground font-medium">
                            {t.blog.thanks}
                        </div>
                        <Button variant="outline" size="sm" className="hover:bg-primary/20 hover:text-primary transition-colors border-white/10" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                        }}>
                            <Share2 className="w-4 h-4 mr-2" /> {t.blog.share}
                        </Button>
                    </div>
                </motion.div>
            </article>

            <Footer />
        </div>
    );
};

export default BlogPostPage;
