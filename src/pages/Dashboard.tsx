import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    CreditCard,
    Wallet,
    Package,
    History,
    Key,
    ShieldCheck,
    AlertCircle,
    Copy,
    CheckCircle2,
    Download,
    Terminal,
    ShoppingCart
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard, Transaction, License } from '@/hooks/useDashboard';
import { useDownloadHistory } from '@/hooks/useDownloadHistory';
import { getIconComponent } from '@/hooks/useApps';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { data, loading: dataLoading, usingMock } = useDashboard();
    const { toast } = useToast();
    const { language } = useLanguage();
    const { history } = useDownloadHistory();

    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [copiedOrderIdx, setCopiedOrderIdx] = useState<number | null>(null);

    const parseResourceOrder = (desc: string) => {
        if (!desc || !desc.trim().startsWith('{')) return null;
        try {
            const parsed = JSON.parse(desc);
            if (parsed && parsed.isResource) {
                return parsed;
            }
        } catch (e) {
            // Không phải JSON
        }
        return null;
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        toast({
            title: "Copied!",
            description: "License key copied to clipboard.",
        });
        setTimeout(() => setCopiedKey(null), 2000);
    };

    if (authLoading || dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AnimatedBackground />
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AnimatedBackground />
                <Card className="glass-card w-full max-w-md p-6 text-center">
                    <h2 className="text-xl font-bold mb-4">Access Denied</h2>
                    <Link to="/auth">
                        <Button className="btn-neon w-full">Login Required</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const walletBalance = data?.wallet.balance || 0;

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <AnimatedBackground />
            <Header />

            <main className="pt-32 pb-24 px-4 min-h-screen">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {language === 'vi' ? 'Xin chào, ' : 'Welcome back, '}
                                <span className="gradient-text">{user.email?.split('@')[0]}</span>
                            </h1>
                            <p className="text-muted-foreground">
                                {language === 'vi' ? 'Quản lý ứng dụng và tài khoản của bạn.' : 'Manage your apps and account settings.'}
                            </p>
                        </div>

                        <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase font-bold">
                                    {language === 'vi' ? 'Số dư' : 'Balance'}
                                </div>
                                <div className="text-2xl font-bold gradient-text">
                                    {walletBalance.toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                            <Link to="/pricing">
                                <Button size="sm" className="btn-neon rounded-lg">
                                    + {language === 'vi' ? 'Nạp tiền' : 'Deposit'}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {usingMock && (
                        <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Demo Mode / Mock Data</AlertTitle>
                            <AlertDescription>
                                Database tables for Wallet/Licenses were not found. Showing mock data for demonstration.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 glass-card p-1 rounded-xl mb-8 h-auto gap-1">
                            <TabsTrigger value="overview" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Wallet className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Tổng Quan' : 'Overview'}
                            </TabsTrigger>
                            <TabsTrigger value="apps" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Package className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Ứng Dụng' : 'My Apps'}
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Tài Nguyên' : 'Resources'}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <History className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Lịch Sử Tải' : 'Downloads'}
                            </TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview">
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {/* Stat Cards */}
                                <div className="glass-card p-6 rounded-xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary/10 rounded-lg text-primary"><Package /></div>
                                        <div className="text-sm font-semibold text-muted-foreground">{language === 'vi' ? 'Ứng dụng' : 'Apps Owned'}</div>
                                    </div>
                                    <div className="text-3xl font-bold">{data?.licenses.length}</div>
                                </div>
                                <div className="glass-card p-6 rounded-xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-accent/10 rounded-lg text-accent"><ShieldCheck /></div>
                                        <div className="text-sm font-semibold text-muted-foreground">{language === 'vi' ? 'Giấy phép' : 'Active Licenses'}</div>
                                    </div>
                                    <div className="text-3xl font-bold">{data?.licenses.filter(l => l.status === 'active').length}</div>
                                </div>
                                <div className="glass-card p-6 rounded-xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CreditCard /></div>
                                        <div className="text-sm font-semibold text-muted-foreground">{language === 'vi' ? 'Tổng chi tiêu' : 'Total Spent'}</div>
                                    </div>
                                    <div className="text-3xl font-bold">
                                        {Math.abs(data?.transactions.filter(t => t.type === 'purchase').reduce((acc, curr) => acc + curr.amount, 0) || 0).toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* MY APPS TAB */}
                        <TabsContent value="apps">
                            <div className="grid gap-6">
                                {data?.licenses.length === 0 ? (
                                    <div className="text-center py-12 glass-card rounded-xl">
                                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-bold mb-2">No Apps Found</h3>
                                        <Link to="/pricing">
                                            <Button variant="outline">Browse Store</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    data?.licenses.map((license) => {
                                        const Icon = getIconComponent(license.app.icon_name || 'Monitor');
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={license.id}
                                                className="glass-card p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-xl gradient-neon flex items-center justify-center">
                                                        <Icon className="w-8 h-8 text-background" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                                            {license.app.title}
                                                            <Badge variant="outline" className="border-green-500 text-green-500">
                                                                {license.status}
                                                            </Badge>
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">Purchased on {new Date(license.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                                    <div className="glass bg-background/50 p-3 rounded-lg flex items-center justify-between gap-4 min-w-[300px]">
                                                        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                                                            <Key className="w-4 h-4" />
                                                            {license.license_key}
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(license.license_key, license.id)}
                                                            className="h-8 w-8 hover:text-primary"
                                                        >
                                                            {copiedKey === license.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                    <Button className="w-full">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Stable
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </TabsContent>

                        {/* HISTORY TAB */}
                        <TabsContent value="history">
                            <div className="glass-card rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-primary/20 bg-primary/5">
                                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === 'vi' ? 'Ứng dụng' : 'Application'}</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === 'vi' ? 'Loại' : 'Action Type'}</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === 'vi' ? 'Thời gian' : 'Date'}</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === 'vi' ? 'Hành động' : 'Action'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/10">
                                            {history.length > 0 ? (
                                                history.map((item) => {
                                                    const Icon = getIconComponent(item.icon_name);
                                                    return (
                                                        <tr key={`${item.id}-${item.timestamp}`} className="hover:bg-primary/5 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center">
                                                                    <Icon className="w-4 h-4 text-background" />
                                                                </div>
                                                                <Link to={`/app/${item.id}`} className="hover:text-primary font-bold transition-colors">
                                                                    {item.title}
                                                                </Link>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <Badge variant="secondary" className="capitalize">
                                                                    {item.action_type}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-muted-foreground">
                                                                {new Date(item.timestamp).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                <Link to={`/app/${item.id}`}>
                                                                    <Button size="sm" variant="ghost" className="hover:text-primary">
                                                                        <Download className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                        {language === 'vi' ? 'Chưa có lịch sử tải xuống.' : 'No download history found.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        {/* RESOURCES TAB (LỊCH SỬ MUA TÀI NGUYÊN) */}
                        <TabsContent value="resources">
                            <div className="glass-card rounded-xl overflow-hidden p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[hsl(var(--neon-cyan))]">
                                    <ShoppingCart className="w-5 h-5" />
                                    {language === 'vi' ? 'Đơn Hàng Tài Nguyên Đã Mua' : 'Resource Purchase History'}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-6">
                                    {language === 'vi' 
                                        ? 'Xem lại tài khoản/mật khẩu các tài nguyên bạn đã mua và thông tin hỗ trợ bảo hành.' 
                                        : 'Review credentials of purchased resources and warranty support details.'}
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-primary/20 bg-primary/5 text-xs text-muted-foreground font-mono">
                                                <th className="px-6 py-3 font-bold uppercase tracking-wider">{language === 'vi' ? 'Sản phẩm' : 'Product'}</th>
                                                <th className="px-6 py-3 font-bold uppercase tracking-wider">{language === 'vi' ? 'Số lượng' : 'Qty'}</th>
                                                <th className="px-6 py-3 font-bold uppercase tracking-wider">{language === 'vi' ? 'Tổng chi' : 'Total Cost'}</th>
                                                <th className="px-6 py-3 font-bold uppercase tracking-wider">{language === 'vi' ? 'Ngày mua' : 'Date'}</th>
                                                <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">{language === 'vi' ? 'Chi tiết' : 'Action'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/10 text-sm">
                                            {data?.transactions.filter(t => t.type === 'purchase' && parseResourceOrder(t.description) !== null).length > 0 ? (
                                                data.transactions
                                                    .filter(t => t.type === 'purchase')
                                                    .map((t) => {
                                                        const order = parseResourceOrder(t.description);
                                                        if (!order) return null;

                                                        return (
                                                            <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="font-bold text-foreground">{order.productName}</div>
                                                                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{order.variantName}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-xs">
                                                                    {order.amount}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-xs text-[hsl(var(--neon-cyan))]">
                                                                    {Math.abs(t.amount).toLocaleString('vi-VN')} đ
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                                                                    {new Date(t.created_at).toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-primary/20 hover:border-[hsl(var(--neon-cyan))]/0.3 hover:text-[hsl(var(--neon-cyan))]"
                                                                        onClick={() => {
                                                                            setSelectedOrder(order);
                                                                            setIsOrderOpen(true);
                                                                        }}
                                                                    >
                                                                        {language === 'vi' ? 'Xem tài nguyên' : 'View Account'}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-mono text-xs">
                                                        {language === 'vi' ? 'Bạn chưa mua tài nguyên nào.' : 'No resource purchases found.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* DIALOG CHI TIẾT TÀI NGUYÊN ĐÃ MUA */}
                <Dialog open={isOrderOpen} onOpenChange={(open) => {
                    setIsOrderOpen(open);
                    if (!open) {
                        setSelectedOrder(null);
                        setCopiedOrderIdx(null);
                    }
                }}>
                    <DialogContent className="max-w-xl glass border-[hsl(var(--neon-cyan)/0.3)] bg-[#070913]/95 text-foreground rounded-3xl p-6 shadow-[0_0_25px_rgba(0,255,255,0.08)]">
                        <DialogHeader className="border-b border-primary/10 pb-3">
                            <DialogTitle className="text-lg font-black text-[hsl(var(--neon-cyan))] flex items-center gap-2 uppercase tracking-wide">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                                Tài Nguyên Đã Bàn Giao
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Chi tiết tài khoản/mật khẩu và thông tin bảo hành đơn hàng của bạn.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-4 py-2 w-full min-w-0 text-left">
                                {/* Box thông tin sản phẩm */}
                                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 w-full min-w-0">
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm leading-snug break-words whitespace-normal">
                                            {selectedOrder.productName}
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                            Gói: <strong className="text-foreground">{selectedOrder.variantName}</strong>
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <span className="text-[10px] text-muted-foreground font-mono block">
                                            Số lượng: <strong className="text-foreground">{selectedOrder.amount}</strong>
                                        </span>
                                        <span className="text-xs font-mono font-black text-[hsl(var(--neon-cyan))] block">
                                            {(selectedOrder.price * selectedOrder.amount).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>

                                {/* Box Mã đơn hàng & Bảo hành */}
                                <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl space-y-2 w-full min-w-0">
                                    <div className="flex justify-between items-center text-xs font-bold text-yellow-500 uppercase tracking-wider font-mono">
                                        <span>Thông tin bảo hành đơn hàng</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-normal break-words">
                                        Nếu tài khoản bị lỗi hoặc cần hỗ trợ, vui lòng gửi mã giao dịch dưới đây cho Admin Đức Trường (Zalo: 0962.775.506) để được đổi trả/bảo hành 24/7.
                                    </p>
                                    <div className="bg-background/80 p-2.5 rounded-xl border border-primary/5 flex items-center justify-between gap-3 min-w-0">
                                        <div className="text-xs font-mono font-bold text-foreground truncate min-w-0">
                                            Mã GD: <span className="text-yellow-500">{selectedOrder.shopminiTransId}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-7 hover:text-yellow-500 text-muted-foreground py-1 px-2.5 rounded-lg border border-primary/10 bg-transparent shrink-0 font-mono text-[10px] uppercase font-bold"
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedOrder.shopminiTransId);
                                                toast({
                                                    title: "Copied!",
                                                    description: "Mã giao dịch đã được copy.",
                                                });
                                            }}
                                        >
                                            Copy mã
                                        </Button>
                                    </div>
                                </div>

                                {/* Danh sách tài khoản bàn giao */}
                                <div className="space-y-2 w-full min-w-0">
                                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                        <span>Thông tin tài khoản bàn giao</span>
                                        <Button
                                            variant="link"
                                            className="text-[hsl(var(--neon-cyan))] p-0 h-auto font-mono text-[10px] lowercase font-bold hover:no-underline"
                                            onClick={() => {
                                                const allText = selectedOrder.deliveredData.join('\n');
                                                navigator.clipboard.writeText(allText);
                                                toast({
                                                    title: "Copied All!",
                                                    description: "Toàn bộ tài khoản đã được copy.",
                                                });
                                            }}
                                        >
                                            Copy tất cả ({selectedOrder.deliveredData.length} dòng)
                                        </Button>
                                    </div>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin w-full">
                                        {selectedOrder.deliveredData.map((item: string, idx: number) => (
                                            <div 
                                                key={idx}
                                                className="p-3 bg-background/50 border border-primary/5 rounded-xl flex items-center justify-between gap-4 w-full min-w-0 text-xs font-mono hover:border-primary/20 transition-all"
                                            >
                                                <span className="text-foreground select-all truncate min-w-0 flex-1">{item}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-[hsl(var(--neon-cyan))] border border-primary/5 shrink-0"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(item);
                                                        setCopiedOrderIdx(idx);
                                                        toast({
                                                            title: "Copied Line!",
                                                            description: `Đã copy dòng thứ ${idx + 1}.`,
                                                        });
                                                        setTimeout(() => setCopiedOrderIdx(null), 2000);
                                                    }}
                                                >
                                                    {copiedOrderIdx === idx ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end w-full">
                                    <Button
                                        onClick={() => {
                                            setIsOrderOpen(false);
                                            setSelectedOrder(null);
                                        }}
                                        className="rounded-xl px-5 py-4 text-xs font-bold bg-primary/10 text-foreground border border-primary/10 hover:bg-primary/20"
                                    >
                                        Đóng lại
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
