import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Phone, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredLevel: string;
}

const UpgradeModal = ({ isOpen, onClose, requiredLevel }: UpgradeModalProps) => {
    const { language } = useLanguage();

    const t = {
        vi: {
            title: 'Nâng Cấp Tài Khoản',
            description: 'Tính năng này yêu cầu gói',
            contact: 'Vui lòng liên hệ Admin để nâng cấp tài khoản:',
            phone: 'Hotline',
            zalo: 'Nhắn tin Zalo',
            facebook: 'Nhắn tin Facebook',
            close: 'Đóng',
        },
        en: {
            title: 'Upgrade Required',
            description: 'This feature requires',
            contact: 'Please contact Admin to upgrade your account:',
            phone: 'Hotline',
            zalo: 'Message on Zalo',
            facebook: 'Message on Facebook',
            close: 'Close',
        },
    };

    const texts = t[language as keyof typeof t] || t.en;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="glass-card neon-border p-8 rounded-2xl relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="w-16 h-16 rounded-full gradient-neon flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8 text-background" />
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-center mb-2">
                                {texts.title}
                            </h2>

                            {/* Description */}
                            <p className="text-muted-foreground text-center mb-6">
                                {texts.description} <span className="font-bold text-primary">{requiredLevel}</span>.
                                <br />
                                {texts.contact}
                            </p>

                            {/* Contact Options */}
                            <div className="space-y-3">
                                <a
                                    href="tel:09662775506"
                                    className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">{texts.phone}</div>
                                        <div className="font-bold">0966 277 506</div>
                                    </div>
                                </a>

                                <a
                                    href="https://zalo.me/09662775506"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold">{texts.zalo}</span>
                                </a>

                                <a
                                    href="https://www.facebook.com/phamductruong17/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="font-semibold">{texts.facebook}</span>
                                </a>
                            </div>

                            {/* Close Button */}
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full mt-6 rounded-xl py-5"
                            >
                                {texts.close}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
