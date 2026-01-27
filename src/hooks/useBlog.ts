
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image: string | null;
    author_id: string | null;
    is_published: boolean;
    featured: boolean;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

export const useBlog = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['blog-posts'],
        queryFn: async () => {
            // Cast to any to avoid TS errors until types are generated
            const { data, error } = await (supabase
                .from('posts' as any)
                .select('*')
                .order('created_at', { ascending: false }));

            if (error) throw error;
            return data as BlogPost[];
        },
    });

    const createPost = useMutation({
        mutationFn: async (newPost: Partial<BlogPost>) => {
            const { data, error } = await (supabase
                .from('posts' as any)
                .insert([newPost])
                .select()
                .single());

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
            toast({ title: 'Success', description: 'Post created successfully' });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });

    const updatePost = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
            const { data, error } = await (supabase
                .from('posts' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single());

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
            toast({ title: 'Success', description: 'Post updated successfully' });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });

    const deletePost = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase
                .from('posts' as any)
                .delete()
                .eq('id', id));

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
            toast({ title: 'Success', description: 'Post deleted successfully' });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });

    return {
        posts,
        isLoading,
        error,
        createPost,
        updatePost,
        deletePost
    };
};
