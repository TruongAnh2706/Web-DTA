import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Transaction {
    id: string;
    type: 'deposit' | 'purchase' | 'refund';
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export interface License {
    id: string;
    app_id: string;
    app: {
        title: string;
        icon_name: string;
    };
    license_key: string;
    status: 'active' | 'expired' | 'banned';
    expires_at: string | null;
    created_at: string;
}

export interface DashboardData {
    wallet: {
        balance: number;
    };
    transactions: Transaction[];
    licenses: License[];
}

// MOCK DATA
const MOCK_DATA: DashboardData = {
    wallet: {
        balance: 500.00,
    },
    transactions: [
        {
            id: '1',
            type: 'deposit',
            amount: 500.00,
            description: 'Bank Transfer (VCB)',
            status: 'completed',
            created_at: new Date().toISOString(),
        },
        {
            id: '2',
            type: 'purchase',
            amount: -19.00,
            description: 'Purchase: DTA Auto Clicker (Pro)',
            status: 'completed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
        }
    ],
    licenses: [
        {
            id: '1',
            app_id: 'app-1-uuid',
            app: {
                title: 'DTA Auto Clicker',
                icon_name: 'MousePointer2',
            },
            license_key: 'DTA-8B2A-9C3D-4E5F-XXXX',
            status: 'active',
            expires_at: null,
            created_at: new Date(Date.now() - 86400000).toISOString(),
        }
    ]
};

export const useDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [usingMock, setUsingMock] = useState(false);

    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // Note: These tables may not exist yet in DB schema
            // Using 'as any' to bypass TypeScript until tables are created

            // 1. Fetch Wallet
            const { data: walletData, error: walletError } = await (supabase as any)
                .from('user_wallets')
                .select('balance')
                .eq('user_id', user.id)
                .maybeSingle();

            if (walletError) {
                throw walletError;
            }

            // 2. Fetch Transactions
            const { data: txData, error: txError } = await (supabase as any)
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (txError) throw txError;

            // 3. Fetch Licenses
            const { data: licDataRaw, error: licError } = await (supabase as any)
                .from('licenses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (licError) throw licError;
            
            // 4. Fetch Apps manually for mapping
            const { data: appsData } = await supabase.from('apps').select('id, title, title_vi, icon_name');
            const appsList = appsData || [];
            
            // Map licData với apps data
            const licData = (licDataRaw || []).map((lic: any) => {
                const appInfo = appsList.find(a => a.id === lic.app_id || a.id.toString() === lic.app_id) || { title: 'Unknown App', icon_name: 'Box' };
                return {
                    ...lic,
                    app: { title: appInfo.title, icon_name: appInfo.icon_name }
                };
            });

            if (licError) throw licError;

            setData({
                wallet: walletData || { balance: 0 },
                transactions: (txData as Transaction[]) || [],
                licenses: (licData as License[]) || [],
            });
            setUsingMock(false);

        } catch (err) {
            console.warn('Failed to fetch dashboard data (Tables likely missing). Using Mock Data.', err);
            setData(MOCK_DATA);
            setUsingMock(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    return {
        data,
        loading,
        error,
        usingMock,
        refresh: fetchDashboardData,
        purchaseApp: async (appId: string, price: number, appTitle: string) => {
            if (!user) throw new Error('User not logged in');

            if (usingMock) {
                // (Giữ logic mock dự phòng nếu có lỗi db)
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, licenseKey: 'mock-key' };
            }

            // Real logic: Insert a pending transaction for admin to verify
            const newTx = {
                user_id: user.id,
                type: 'deposit', // using deposit as it requires manual money transfer check
                amount: price,
                description: `Chuyển khoản mua: ${appTitle}`,
                status: 'pending'
            };
            
            const { error: txError } = await (supabase as any).from('transactions').insert(newTx);
            if (txError) throw txError;
            
            // Re-fetch để update dashboard
            await fetchDashboardData();
            
            return { success: true, pending: true };
        }
    };
};
