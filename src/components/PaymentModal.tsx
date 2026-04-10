import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: { name: string; price: string } | null;
    onSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, tier, onSuccess }: PaymentModalProps) => {
    const { language } = useLanguage();
    const [showQR, setShowQR] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Xử lý giá tiền để gen QR (ví dụ 199k -> 199000)
    let numericPrice = 0;
    if (tier?.price.includes('k')) {
        numericPrice = parseInt(tier.price.replace('k', '')) * 1000;
    } else if (tier?.price.includes('m')) {
        numericPrice = parseFloat(tier.price.replace('m', '')) * 1000000;
    }

    const handleConfirmPayment = () => {
        setIsSimulating(true);
        // Simulate checking transaction
        setTimeout(() => {
            setIsSimulating(false);
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
                setIsSuccess(false);
                setShowQR(false);
            }, 2000);
        }, 3000);
    };

    const t = {
        vi: {
            title: 'Thanh Toán',
            method: 'Chọn phương thức thanh toán',
            bankTransfer: 'Chuyển khoản VietQR',
            card: 'Thẻ tín dụng (Sắp có)',
            scan: 'Quét mã QR bằng ứng dụng ngân hàng',
            amount: 'Số tiền:',
            content: 'Nội dung:',
            confirming: 'Đang kiểm tra giao dịch...',
            confirmBtn: 'Tôi đã chuyển khoản',
            success: 'Thanh toán thành công!',
            back: 'Quay lại',
            forTier: 'Gói:',
        },
        en: {
            title: 'Payment',
            method: 'Select payment method',
            bankTransfer: 'VietQR Bank Transfer',
            card: 'Credit Card (Coming soon)',
            scan: 'Scan QR with your banking app',
            amount: 'Amount:',
            content: 'Message:',
            confirming: 'Checking transaction...',
            confirmBtn: 'I have paid',
            success: 'Payment successful!',
            back: 'Back',
            forTier: 'Plan:',
        },
    };

    const texts = t[language as keyof typeof t] || t.en;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={!isSimulating && !isSuccess ? onClose : undefined}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-md h-fit z-50"
                    >
                        <div className="glass-card neon-border rounded-2xl p-6 mx-4 relative overflow-hidden">
                            {isSuccess ? (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{texts.success}</h3>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold">{texts.title}</h2>
                                            <p className="text-sm text-muted-foreground">{texts.forTier} <span className="font-bold text-primary">{tier?.name}</span></p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" disabled={isSimulating}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {showQR ? (
                                        <div className="space-y-6">
                                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                                                <p className="font-medium mb-4 text-sm">{texts.scan}</p>
                                                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl mb-4">
                                                    <img
                                                        src={`https://img.vietqr.io/image/vib-995992999-compact.png?amount=${numericPrice}&addInfo=MUA ${tier?.name}&accountName=Pham Duc Truong`}
                                                        alt="VietQR"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="space-y-1 text-sm bg-background/50 rounded-lg p-3 inline-block text-left">
                                                    <p>Ngân hàng: <strong>VIB</strong></p>
                                                    <p>STK: <strong className="font-mono">995992999</strong></p>
                                                    <p>Chủ TK: Phạm Đức Trường</p>
                                                    <p>{texts.amount} <strong className="font-mono text-primary">{numericPrice.toLocaleString('vi-VN')} đ</strong></p>
                                                    <p>{texts.content} <strong className="font-mono text-accent">MUA {tier?.name}</strong></p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button variant="outline" onClick={() => setShowQR(false)} className="flex-1" disabled={isSimulating}>
                                                    {texts.back}
                                                </Button>
                                                <Button 
                                                    className="flex-1 btn-neon text-background font-bold" 
                                                    onClick={handleConfirmPayment}
                                                    disabled={isSimulating}
                                                >
                                                    {isSimulating ? texts.confirming : texts.confirmBtn}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-primary/10 rounded-xl p-4 mb-4 text-center border border-primary/20">
                                                <div className="text-sm text-muted-foreground mb-1">{texts.amount}</div>
                                                <div className="text-3xl font-bold gradient-text">{numericPrice.toLocaleString('vi-VN')} đ</div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-sm font-medium">{texts.method}</p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-auto p-4 justify-start gap-4 rounded-xl border-primary/20 hover:bg-primary/10 hover:border-primary/50"
                                                    onClick={() => setShowQR(true)}
                                                >
                                                    <div className="p-2 bg-primary/20 rounded-lg">
                                                        <Wallet className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <div className="font-bold">{texts.bankTransfer}</div>
                                                        <div className="text-xs text-muted-foreground">VietQR - Miễn phí</div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    disabled
                                                    className="w-full h-auto p-4 justify-start gap-4 rounded-xl opacity-50"
                                                >
                                                    <div className="p-2 bg-muted rounded-lg">
                                                        <CreditCard className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <div className="font-bold">{texts.card}</div>
                                                        <div className="text-xs text-muted-foreground">Visa, Mastercard</div>
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;
