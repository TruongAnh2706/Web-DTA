import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useToast } from '@/hooks/use-toast';
import PaymentModal from '@/components/PaymentModal';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const Pricing = () => {
    const { t } = useTranslation();
    const { purchaseApp, usingMock } = useDashboard();
    const { user } = useAuth();
    const { toast } = useToast();
    const [purchasing, setPurchasing] = useState<string | null>(null);
    
    // State cho Modal thanh toán
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<{name: string; price: string} | null>(null);

    const handlePurchase = (tier: any) => {
        if (!user) {
            toast({ title: "Đăng nhập bắt buộc", description: "Vui lòng đăng nhập để nâng cấp", variant: "destructive" });
            return;
        }
        if (tier.price === '0') return;

        setSelectedTier(tier);
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = async () => {
        if (!selectedTier) return;
        setPurchasing(selectedTier.name);
        try {
            // Giá Demo
            const price = selectedTier.name.includes('Pro') ? 199000 : 2500000;
            // Ở đây gọi API thật hoặc Dashboard Hook
            await purchaseApp('vip-subscription', price, selectedTier.name);
            toast({ title: "Nâng cấp thành công!", description: "Gói VIP đã được kích hoạt trong Dashboard." });
        } catch (error: any) {
            toast({ title: "Lỗi kích hoạt", description: error.message, variant: "destructive" });
        } finally {
            setPurchasing(null);
            setSelectedTier(null);
        }
    };

    const tiers = [
        {
            name: t('home.pricing_page.free.name'),
            price: '0',
            description: t('home.pricing_page.free.desc'),
            features: [
                t('home.pricing_page.free.f1'),
                t('home.pricing_page.free.f2'),
                t('home.pricing_page.free.f3'),
            ],
            icon: Zap,
            highlight: false,
        },
        {
            name: t('home.pricing_page.pro.name'),
            price: '199k',
            period: t('home.pricing_page.pro.period'),
            description: t('home.pricing_page.pro.desc'),
            features: [
                t('home.pricing_page.pro.f1'),
                t('home.pricing_page.pro.f2'),
                t('home.pricing_page.pro.f3'),
                t('home.pricing_page.pro.f4'),
            ],
            icon: Shield,
            highlight: true,
        },
        {
            name: t('home.pricing_page.vip.name'),
            price: '2.5m',
            period: t('home.pricing_page.vip.period'),
            description: t('home.pricing_page.vip.desc'),
            features: [
                t('home.pricing_page.vip.f1'),
                t('home.pricing_page.vip.f2'),
                t('home.pricing_page.vip.f3'),
                t('home.pricing_page.vip.f4'),
            ],
            icon: Crown,
            highlight: false,
        },
    ];

    return (
        <>
            <Helmet>
                <title>{t('nav.pricing')} - DTA Studio</title>
                <meta name="description" content={t('home.pricing_page.subtitle')} />
            </Helmet>

            <main className="pt-32 pb-24 px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            {t('home.pricing_page.title')}
                            <span className="gradient-text">{t('home.pricing_page.title_highlight')}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            {t('home.pricing_page.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`glass-card relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${tier.highlight ? 'border-[hsl(var(--neon-cyan))] shadow-[0_0_30px_rgba(var(--neon-cyan),0.2)] md:-translate-y-4' : 'hover:border-primary/50'
                                    }`}
                            >
                                {tier.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[hsl(var(--neon-cyan))] text-background px-6 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(var(--neon-cyan),0.5)]">
                                        {t('home.pricing_page.popular')}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl gradient-neon flex items-center justify-center">
                                        <tier.icon className="w-7 h-7 text-background" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{tier.name}</h3>
                                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <span className="text-5xl font-black gradient-text">{tier.price}</span>
                                    <span className="text-muted-foreground ml-2">{tier.period}</span>
                                </div>

                                <ul className="space-y-5 mb-10">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-base">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handlePurchase(tier)}
                                    disabled={!!purchasing}
                                    className={`w-full rounded-xl py-6 font-bold uppercase tracking-wide ${tier.highlight ? 'btn-neon text-background' : 'variant-outline border-primary/20 hover:bg-primary/10'
                                        }`}
                                >
                                    {purchasing === tier.name ? <Loader2 className="animate-spin" /> : t('home.pricing_page.get_started')}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <PaymentModal 
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedTier(null);
                }}
                tier={selectedTier}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
};

export default Pricing;
