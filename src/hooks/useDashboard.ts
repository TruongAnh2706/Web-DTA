// @ts-nocheck
import { useState, useEffect } from 'react';
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
            // 1. Fetch Wallet
            const { data: walletData, error: walletError } = await supabase
                .from('user_wallets')
                .select('balance')
                .eq('user_id', user.id)
                .maybeSingle();

            if (walletError) {
                // If table doesn't exist or error, throw to trigger catch and use mock
                throw walletError;
            }

            // 2. Fetch Transactions
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (txError) throw txError;

            // 3. Fetch Licenses
            // Note: This requires complex join, simplifying for now or assumes view
            // For this implementation, we will try to fetch from a view or raw table
            const { data: licData, error: licError } = await supabase
                .from('licenses')
                .select('*, app:apps(title, icon_name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (licError) throw licError;

            setData({
                wallet: walletData || { balance: 0 },
                transactions: txData || [],
                licenses: licData || [],
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

            // Mock Purchase Logic
            if (usingMock) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                if ((data?.wallet.balance || 0) < price) {
                    throw new Error('Insufficient balance');
                }

                // Update local mock data
                const newTx: Transaction = {
                    id: Math.random().toString(),
                    type: 'purchase',
                    amount: -price,
                    description: `Purchase: ${appTitle}`,
                    status: 'completed',
                    created_at: new Date().toISOString(),
                };

                const newLicense: License = {
                    id: Math.random().toString(),
                    app_id: appId,
                    app: { title: appTitle, icon_name: 'Box' },
                    license_key: `mock-key-${Math.random().toString(36).substring(7)}`,
                    status: 'active',
                    expires_at: null,
                    created_at: new Date().toISOString(),
                };

                setData(prev => prev ? ({
                    ...prev,
                    wallet: { balance: prev.wallet.balance - price },
                    transactions: [newTx, ...prev.transactions],
                    licenses: [newLicense, ...prev.licenses]
                }) : null);

                return { success: true, licenseKey: newLicense.license_key };
            }

            // Real logic would go here (call RPC or API)
            throw new Error('Real purchase not implemented. Please run DB migration.');
        }
    };
};
