import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useToast } from '@/hooks/use-toast';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';

const Pricing = () => {
    const { language } = useLanguage();
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
            name: language === 'vi' ? 'Gói Trải Nghiệm' : 'Free Starter',
            price: '0',
            description: language === 'vi' ? 'Dành cho người mới tiếp cận' : 'For beginners',
            features: [
                language === 'vi' ? 'Truy cập các tool cơ bản' : 'Access basic tools',
                language === 'vi' ? 'Tốc độ tải xuống tiêu chuẩn' : 'Standard download speed',
                language === 'vi' ? 'Hỗ trợ cộng đồng' : 'Community support',
            ],
            icon: Zap,
            highlight: false,
        },
        {
            name: language === 'vi' ? 'Gói DTA Pro' : 'Pro Creator',
            price: '199k',
            period: language === 'vi' ? '/tháng' : '/month',
            description: language === 'vi' ? 'Dành cho người dùng chuyên sâu' : 'For power users',
            features: [
                language === 'vi' ? 'Mở khóa tất cả Premium tools' : 'Unlock all Premium tools',
                language === 'vi' ? 'Tốc độ tải xuống không giới hạn' : 'High-speed downloads',
                language === 'vi' ? 'Hỗ trợ ưu tiên 24/7' : 'Priority support',
                language === 'vi' ? 'Nhận bản cập nhật sớm nhất' : 'Early access updates',
            ],
            icon: Shield,
            highlight: true,
        },
        {
            name: language === 'vi' ? 'Độc Quyền (Lifetime)' : 'Lifetime VIP',
            price: '2.5m',
            period: language === 'vi' ? '/lần' : '/once',
            description: language === 'vi' ? 'Đầu tư 1 lần, lợi ích mãi mãi' : 'One-time payment',
            features: [
                language === 'vi' ? 'Sở hữu vĩnh viễn tính năng PRO' : 'All PRO features',
                language === 'vi' ? 'Đặc quyền tiếp cận mã nguồn' : 'Source code access',
                language === 'vi' ? 'Kênh hỗ trợ trực tiếp 1:1' : '1:1 Direct support',
                language === 'vi' ? 'Huy hiệu VIP siêu phẩm' : 'Exclusive VIP badge',
            ],
            icon: Crown,
            highlight: false,
        },
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <AnimatedBackground />
            <Header />

            <main className="pt-32 pb-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            {language === 'vi' ? 'Đầu Tư ' : 'Our '}
                            <span className="gradient-text">{language === 'vi' ? 'Thông Minh' : 'Pricing'}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            {language === 'vi'
                                ? 'Dù bạn là người mới hay chuyên gia, chúng tôi đều có giải pháp hoàn hảo dành riêng cho bạn.'
                                : 'Choose the best plan for your needs'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`glass-card relative rounded-2xl p-8 ${tier.highlight ? 'border-primary neon-border transform md:-translate-y-4' : ''
                                    }`}
                            >
                                {tier.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                                        Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-lg gradient-neon flex items-center justify-center">
                                        <tier.icon className="w-6 h-6 text-background" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{tier.name}</h3>
                                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold gradient-text">{tier.price}</span>
                                    <span className="text-muted-foreground">{tier.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-primary" />
                                            </div>
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handlePurchase(tier)}
                                    disabled={!!purchasing}
                                    className={`w-full rounded-xl py-6 font-bold ${tier.highlight ? 'btn-neon text-background' : 'variant-outline border-primary/20 hover:bg-primary/10'
                                        }`}
                                >
                                    {purchasing === tier.name ? <Loader2 className="animate-spin" /> : (language === 'vi' ? 'Bắt Đầu Ngay' : 'Get Started')}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />

            <PaymentModal 
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedTier(null);
                }}
                tier={selectedTier}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default Pricing;
