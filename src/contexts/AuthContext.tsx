import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AccountType = 'Free' | 'VIP1' | 'VIP2';
export type SubscriptionLevel = 'None' | 'Pro' | 'Lifetime';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    accountType: AccountType;
    subscriptionLevel: SubscriptionLevel;
    signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
    signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
    signOut: () => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Admin emails whitelist
const ADMIN_EMAILS = ['ductruong.onl@gmail.com', 'test1768817065811@example.com'];

// Helper function to check admin role - DRY principle
const checkUserRole = async (userId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle();

        if (error) {
            console.warn('user_roles table error:', error.message);
            return false;
        }
        return !!data;
    } catch (err) {
        console.error('Role check failed:', err);
        return false;
    }
};

// Helper to process user authentication state
const processUserAuth = async (user: User | null) => {
    let isAdmin = false;

    if (user) {
        // Check whitelist first (fast path)
        if (ADMIN_EMAILS.includes(user.email || '')) {
            isAdmin = true;
        } else {
            // Check database roles
            isAdmin = await checkUserRole(user.id);
        }
    }

    const accountType = (user?.user_metadata?.account_type as AccountType) || 'Free';
    const subscriptionLevel = (user?.user_metadata?.subscription_level as SubscriptionLevel) || 'None';

    return { isAdmin, accountType, subscriptionLevel };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<{
        user: User | null;
        session: Session | null;
        loading: boolean;
        isAdmin: boolean;
        accountType: AccountType;
        subscriptionLevel: SubscriptionLevel;
    }>({
        user: null,
        session: null,
        loading: true,
        isAdmin: false,
        accountType: 'Free',
        subscriptionLevel: 'None',
    });

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            console.warn('[Auth] Session check timed out, forcing load completion');
            if (mounted) {
                setAuthState(prev => ({ ...prev, loading: false }));
            }
        }, 3000);

        // Auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;

                const user = session?.user ?? null;
                const { isAdmin, accountType, subscriptionLevel } = await processUserAuth(user);

                setAuthState({
                    user,
                    session,
                    loading: false,
                    isAdmin,
                    accountType,
                    subscriptionLevel,
                });
            }
        );

        // Initial session check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!mounted) return;
            clearTimeout(safetyTimeout);

            const user = session?.user ?? null;
            const { isAdmin, accountType, subscriptionLevel } = await processUserAuth(user);

            setAuthState({
                user,
                session,
                loading: false,
                isAdmin,
                accountType,
                subscriptionLevel,
            });
        }).catch(err => {
            clearTimeout(safetyTimeout);
            console.error('Get Session Error:', err);
            if (mounted) {
                setAuthState(prev => ({ ...prev, loading: false }));
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const signInPromise = supabase.auth.signInWithPassword({
            email,
            password,
        });

        const { data, error } = await signInPromise;

        return { data, error };
    };

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        console.log('[Auth] Redirecting to:', `${window.location.origin}/`);
        return { data, error };
    };

    return (
        <AuthContext.Provider value={{ ...authState, signIn, signUp, signOut, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
