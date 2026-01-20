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
    Terminal
} from 'lucide-react';
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
                                    ${walletBalance.toFixed(2)}
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
                        <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-xl mb-8 h-auto">
                            <TabsTrigger value="overview" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Wallet className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Tổng Quan' : 'Overview'}
                            </TabsTrigger>
                            <TabsTrigger value="apps" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Package className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Ứng Dụng' : 'My Apps'}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <History className="w-4 h-4 mr-2" />
                                {language === 'vi' ? 'Lịch Sử' : 'History'}
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
                                        ${Math.abs(data?.transactions.filter(t => t.type === 'purchase').reduce((acc, curr) => acc + curr.amount, 0) || 0).toFixed(2)}
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
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
