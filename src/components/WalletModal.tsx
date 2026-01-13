import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
}

const WalletModal = ({ isOpen, onClose, balance }: WalletModalProps) => {
    const { language } = useLanguage();
    const [amount, setAmount] = useState('');
    const [showQR, setShowQR] = useState(false);

    const t = {
        vi: {
            title: 'Ví Của Bạn',
            balance: 'Số dư hiện tại',
            deposit: 'Nạp Tiền',
            method: 'Phương thức thanh toán',
            bankTransfer: 'Chuyển khoản ngân hàng',
            card: 'Thẻ tín dụng / Ghi nợ',
            amount: 'Số tiền muốn nạp',
            submit: 'Tạo Yêu Cầu Nạp',
            note: 'Hệ thống sẽ xử lý trong 5-10 phút.',
        },
        en: {
            title: 'Your Wallet',
            balance: 'Current Balance',
            deposit: 'Deposit Funds',
            method: 'Payment Method',
            bankTransfer: 'Bank Transfer',
            card: 'Credit / Debit Card',
            amount: 'Amount to deposit',
            submit: 'Request Deposit',
            note: 'System processes in 5-10 minutes.',
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
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-md h-fit z-50"
                    >
                        <div className="glass-card neon-border rounded-2xl p-6 mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-neon flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-background" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{texts.title}</h2>
                                        <p className="text-xs text-muted-foreground font-mono">ID: 8839-2910</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="bg-primary/10 rounded-xl p-6 mb-6 text-center border border-primary/20">
                                <div className="text-sm text-muted-foreground mb-1">{texts.balance}</div>
                                <div className="text-4xl font-bold gradient-text">
                                    {(balance || 0).toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">{texts.amount}</label>
                                    <Input
                                        type="number"
                                        placeholder="100,000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="rounded-xl text-lg"
                                    />
                                </div>

                                {showQR ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl">
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021238570010A00000072701270006970425011319036324830150208QRIBFTTA53037045802VN6304CA77" alt="VietQR" className="w-full h-full" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-primary">Ngân hàng TMCP Việt Nam</p>
                                            <p>STK: <span className="font-mono">1903632483015</span></p>
                                            <p>Chủ TK: DTA STUDIO</p>
                                            <p className="text-xs text-muted-foreground mt-2">Nội dung: <span className="font-mono font-bold text-accent">NAP {(parseInt(amount) || 0)}</span></p>
                                        </div>
                                        <Button variant="outline" onClick={() => setShowQR(false)} className="w-full">
                                            Quay lại / Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium mb-2 block">{texts.method}</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="h-auto py-4 flex flex-col gap-2 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => setShowQR(true)}
                                                >
                                                    <Wallet className="w-6 h-6" />
                                                    <span className="text-xs">{texts.bankTransfer}</span>
                                                </Button>
                                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary">
                                                    <CreditCard className="w-6 h-6" />
                                                    <span className="text-xs">{texts.card}</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full btn-neon rounded-xl py-6 font-bold text-background mt-4"
                                            onClick={() => setShowQR(true)}
                                        >
                                            {texts.submit} <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </>
                                )}

                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    {texts.note}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WalletModal;
