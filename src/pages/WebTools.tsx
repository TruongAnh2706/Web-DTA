
import { motion } from 'framer-motion';
import { useApps } from '@/hooks/useApps';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getIconComponent } from '@/hooks/useApps';

const WebTools = () => {
    const { data: apps, isLoading } = useApps();
    const { language } = useLanguage();

    // Filter only Web Apps
    const webApps = apps?.filter(app => app.platform === 'web' && app.is_active) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AnimatedBackground />
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <AnimatedBackground />
            <Header />

            <main className="pt-32 pb-24 px-4 container mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Web <span className="gradient-text">Tools</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {language === 'vi'
                            ? 'Bộ sưu tập các công cụ trực tuyến tiện ích, chạy ngay trên trình duyệt của bạn.'
                            : 'Collection of useful online tools, running directly in your browser.'}
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
                                className="glass-card p-6 rounded-2xl flex flex-col hover:border-primary/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl gradient-neon flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-background" />
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Globe className="w-4 h-4 text-primary" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                    {language === 'vi' ? app.title_vi : app.title}
                                </h3>
                                <p className="text-muted-foreground mb-6 flex-1 line-clamp-3">
                                    {language === 'vi' ? app.description_vi : app.description}
                                </p>

                                <Link to={`/app/${app.id}`}>
                                    <Button className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        {language === 'vi' ? 'Sử dụng ngay' : 'Use Tool'}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {webApps.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">
                            {language === 'vi' ? 'Chưa có công cụ nào.' : 'No tools available yet.'}
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default WebTools;
