import { motion } from 'framer-motion';
import { useApps } from '@/hooks/useApps';
import { Loader2, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getIconComponent } from '@/hooks/useApps';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

// Helper: Strip markdown characters cho mô tả sạch
const stripMarkdown = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/#{1,6}\s?/g, '')        // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic
        .replace(/`(.*?)`/g, '$1')       // Remove inline code
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Remove links, keep text
        .replace(/^[-*+]\s/gm, '')        // Remove list markers
        .replace(/^\d+\.\s/gm, '')        // Remove numbered lists
        .replace(/[✨🎯💡🚀⚡🔥]/g, '') // Remove emojis
        .replace(/\n{2,}/g, ' ')         // Multiple newlines to space
        .replace(/\n/g, ' ')             // Newlines to space
        .trim();
};

const WebTools = () => {
    const { data: apps, isLoading } = useApps();
    const { t, i18n } = useTranslation();
    const language = i18n.language;

    // Filter only Web Apps
    const webApps = apps?.filter(app => app.platform === 'web' && app.is_active) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{t('nav.tools')} - DTA Studio</title>
                <meta name="description" content={t('home.tools_page.subtitle')} />
            </Helmet>

            <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        <span className="gradient-text">{t('home.tools_page.title')}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('home.tools_page.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {webApps.map((app, index) => {
                        const Icon = getIconComponent(app.icon_name);
                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card neon-border p-6 rounded-3xl flex flex-col hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 group"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl gradient-neon flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                        <Icon className="w-8 h-8 text-background" />
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <Globe className="w-5 h-5 text-primary" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {language === 'vi' ? app.title_vi : app.title}
                                </h3>
                                <p className="text-muted-foreground mb-8 flex-1 line-clamp-3 leading-relaxed">
                                    {stripMarkdown(language === 'vi' ? app.description_vi : app.description)}
                                </p>

                                <Link to={`/app/${app.id}`}>
                                    <Button className="w-full btn-neon rounded-xl py-6 font-bold uppercase tracking-wider text-background">
                                        {t('home.tools_page.use_tool')}
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {webApps.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">
                            {t('home.tools_page.no_tools')}
                        </p>
                    </div>
                )}
            </main>
        </>
    );
};

export default WebTools;
