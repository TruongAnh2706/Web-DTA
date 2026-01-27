
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BlogPost } from '@/hooks/useBlog';
import { useLanguage } from '@/contexts/LanguageContext';

const BlogPage = () => {
    const { t, language } = useLanguage();

    const { data: posts, isLoading } = useQuery({
        queryKey: ['public-blog-posts'],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from('posts' as any)
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false }));

            if (error) throw error;
            return data as unknown as BlogPost[];
        }
    });

    const featuredPost = posts?.find(p => p.featured);
    const otherPosts = posts?.filter(p => p.id !== featuredPost?.id);

    return (
        <div className="min-h-screen relative flex flex-col">
            <AnimatedBackground />
            <Header />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
                <div className="text-center mb-16 space-y-4 mt-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
                    >
                        {t.blog.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        {t.blog.subtitle}
                    </motion.p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 glass-card rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Featured Post */}
                        {featuredPost && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-3xl overflow-hidden grid md:grid-cols-2 gap-8 p-6 md:p-8 hover:bg-white/5 transition-colors group"
                            >
                                <div className="rounded-2xl overflow-hidden aspect-video md:aspect-auto border border-white/10 relative">
                                    <img
                                        src={featuredPost.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">{t.blog.featured}</Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(featuredPost.created_at), t.blog.dateFormat, { locale: language === 'vi' ? vi : undefined })}
                                            </span>
                                            {featuredPost.tags && featuredPost.tags.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-primary">{featuredPost.tags[0]}</span>
                                                </>
                                            )}
                                        </div>
                                        <Link to={`/blog/${featuredPost.slug}`}>
                                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90 group-hover:to-primary transition-all">
                                                {featuredPost.title}
                                            </h2>
                                        </Link>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-3 text-lg leading-relaxed">
                                        {featuredPost.excerpt || "Click to read more about this amazing topic..."}
                                    </p>
                                    <Link to={`/blog/${featuredPost.slug}`}>
                                        <Badge variant="outline" className="pl-4 pr-2 py-2 text-sm rounded-full group-hover:border-primary/50 transition-colors">
                                            {t.blog.readMore} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Badge>
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* Other Posts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherPosts?.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300"
                                >
                                    <Link to={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
                                        <img
                                            src={post.cover_image || `https://images.unsplash.com/photo-${1600000000000 + idx}?w=800&auto=format&fit=crop`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    </Link>
                                    <div className="p-6 flex-1 flex flex-col space-y-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {format(new Date(post.created_at), t.blog.dateFormat, { locale: language === 'vi' ? vi : undefined })}
                                            </span>
                                            {post.tags?.slice(0, 2).map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
                                            ))}
                                        </div>
                                        <Link to={`/blog/${post.slug}`} className="block">
                                            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {posts?.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>{t.blog.noPosts}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;
