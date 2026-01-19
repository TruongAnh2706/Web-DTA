import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { syncUserToGoogleSheets } from '@/utils/googleSheets';

export const useAuth = () => {
  const authContext = useAuthContext();

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          phone: phone || '',
          account_type: 'Free',
          subscription_level: 'None',
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;

    if (data.user && data.user.email) {
      // Sync to Google Sheets với đầy đủ thông tin
      syncUserToGoogleSheets({
        email: data.user.email,
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        provider: 'Credentials',
        account_type: 'Free',
        subscription_level: 'None',
      });
    }
    return { data, error: null };
  };

  return {
    ...authContext,
    signUp,
  };
};
