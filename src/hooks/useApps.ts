import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Globe, Zap, MousePointer2, Eye, Video, FileCode, Sparkles, type LucideIcon } from 'lucide-react';
import type { AccountType } from '@/contexts/AuthContext';

export type Platform = 'web' | 'desktop';

export interface AppData {
  id: string;
  title: string;
  title_vi: string;
  description: string;
  description_vi: string;
  icon_name: string;
  platform: Platform;
  categories: string[];
  url: string | null;
  github_url: string | null;
  download_url: string | null;
  image_url: string | null;
  featured: boolean;
  is_active: boolean;
  required_subscription: AccountType; // Cấp độ cần thiết để truy cập: 'Free', 'VIP1', 'VIP2'
  created_at: string;
  updated_at: string;
}

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Globe,
  Zap,
  MousePointer2,
  Eye,
  Video,
  FileCode,
  Sparkles,
};

export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Monitor;
};

export const useApps = () => {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as AppData[];
    },
  });
};

export const useApp = (id: string) => {
  return useQuery({
    queryKey: ['app', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as AppData | null;
    },
    enabled: !!id,
  });
};

export const useUpdateApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (app: Partial<AppData> & { id: string }) => {
      const { data, error } = await supabase
        .from('apps')
        .update(app)
        .eq('id', app.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
};

export const useCreateApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (app: Omit<AppData, 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('apps')
        .insert(app)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
};

export const useDeleteApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
};
