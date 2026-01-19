import { createContext, useContext, useEffect, useState } from 'react';
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
        // Set up auth state listener BEFORE checking session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth State Change (Context):', event);
                const user = session?.user ?? null;

                // Check admin role
                let isAdmin = false;
                if (user) {
                    try {
                        const checkRole = async () => {
                            const { data: roles, error } = await supabase
                                .from('user_roles')
                                .select('role')
                                .eq('user_id', user.id)
                                .eq('role', 'admin')
                                .maybeSingle();
                            if (error) throw error;
                            return roles;
                        };

                        const roles = await Promise.race([
                            checkRole(),
                            new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Role check timeout')), 2000)
                            )
                        ]);

                        // Check specific admin email or roles
                        if (user.email === 'ductruong.onl@gmail.com' || user.email === 'test1768817065811@example.com') {
                            isAdmin = true;
                        } else {
                            isAdmin = !!roles;
                        }
                    } catch (err) {
                        console.error('Role check failed or timed out:', err);
                    }
                }

                // Read account type from user_metadata
                const accountType = (user?.user_metadata?.account_type as AccountType) || 'Free';
                const subscriptionLevel = (user?.user_metadata?.subscription_level as SubscriptionLevel) || 'None';

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

        // Check current session with safety timeout
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (mounted) {
                console.warn('Auth check timed out, forcing loading: false');
                setAuthState(prev => ({ ...prev, loading: false }));
            }
        }, 5000);

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!mounted) return;
            clearTimeout(safetyTimeout);
            console.log('Get Session Result (Context):', session ? 'Found Session' : 'No Session');

            const user = session?.user ?? null;

            let isAdmin = false;
            if (user) {
                try {
                    const checkRole = async () => {
                        const { data: roles, error } = await supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', user.id)
                            .eq('role', 'admin')
                            .maybeSingle();
                        if (error) throw error;
                        return roles;
                    };

                    const roles = await Promise.race([
                        checkRole(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Role check timeout')), 2000)
                        )
                    ]);

                    // Check specific admin email or roles
                    if (user.email === 'ductruong.onl@gmail.com' || user.email === 'test1768817065811@example.com') {
                        isAdmin = true;
                    } else {
                        isAdmin = !!roles;
                    }
                } catch (err) {
                    console.error('Role check failed (getSession) or timed out:', err);
                }
            }

            // Read account type from user_metadata
            const accountType = (user?.user_metadata?.account_type as AccountType) || 'Free';
            const subscriptionLevel = (user?.user_metadata?.subscription_level as SubscriptionLevel) || 'None';

            setAuthState({
                user,
                session,
                loading: false,
                isAdmin,
                accountType,
                subscriptionLevel,
            });
        }).catch(err => {
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

        const { data, error } = await Promise.race([
            signInPromise,
            new Promise<{ data: any; error: any }>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            )
        ]).catch(err => ({ data: null, error: err }));

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
                redirectTo: window.location.origin,
            }
        });
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
