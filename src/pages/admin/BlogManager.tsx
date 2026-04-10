
import { useState } from 'react';
import { useBlog, type BlogPost } from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Eye, LayoutDashboard, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';
import PostEditor from '@/components/admin/PostEditor';
import { AIWriterModal } from '@/components/admin/AIWriterModal';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { AISettingsModal } from '@/components/admin/AISettingsModal';
import { AIImageGenerator } from '@/components/admin/AIImageGenerator';

const BlogManager = () => {
    const { posts, isLoading, createPost, updatePost, deletePost } = useBlog();
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isAIImageOpen, setIsAIImageOpen] = useState(false);
    const [isKeysOpen, setIsKeysOpen] = useState(false);
    const [aiMode, setAiMode] = useState<'generate' | 'paraphrase'>('generate');

    // Form states
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [featured, setFeatured] = useState(false);

    const resetForm = () => {
        setTitle('');
        setSlug('');
        setContent('');
        setExcerpt('');
        setCoverImage('');
        setIsPublished(false);
        setFeatured(false);
        setSelectedPost(null);
    };

    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content || '');
        setExcerpt(post.excerpt || '');
        setCoverImage(post.cover_image || '');
        setIsPublished(post.is_published);
        setFeatured(post.featured);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD') // Remove accents
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!selectedPost) { // Only auto-generate slug for new posts
            setSlug(generateSlug(newTitle));
        }
    };

    const handleSubmit = async () => {
        if (!title || !slug) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and Slug are required.' });
            return;
        }

        const postData = {
            title,
            slug,
            content,
            excerpt,
            cover_image: coverImage,
            is_published: isPublished,
            featured: featured,
            author_id: user?.id
        };

        try {
            if (selectedPost) {
                await updatePost.mutateAsync({ id: selectedPost.id, ...postData });
            } else {
                await createPost.mutateAsync(postData);
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save post:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost.mutateAsync(id);
        }
    };

    if (isDialogOpen) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
                <div className="flex justify-between items-center bg-background/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-primary/20 rounded-2xl glass-card">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            ← Trở về
                        </Button>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-red">
                            {selectedPost ? 'Chỉnh Sửa Bài Viết' : 'Sáng Tạo Bài Mới'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setIsKeysOpen(true)} className="border-neon-blue text-neon-blue">
                            Cấu hình API Key
                        </Button>
                        <Button onClick={handleSubmit} className="btn-neon" disabled={createPost.isPending || updatePost.isPending}>
                            {createPost.isPending || updatePost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Lưu Bài Viết
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Content Area */}
                    <div className="xl:col-span-3 space-y-8">
                        <div className="glass-card p-6 rounded-2xl border-t-4 border-t-neon-blue">
                            <Label className="text-xl mb-4 block text-muted-foreground">Tiêu Đề (Title)</Label>
                            <Input
                                className="text-4xl font-black h-20 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/30"
                                placeholder="Nhập tiêu đề ấn tượng..."
                                value={title}
                                onChange={handleTitleChange}
                            />
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-primary/10">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-xl text-muted-foreground">Nội Dung Chính</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" className="gap-2 text-neon-blue border-neon-blue/30" onClick={() => setIsAIImageOpen(true)}>
                                        <ImageIcon className="w-4 h-4" /> Tạo Ảnh AI
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="gap-2 bg-neon-blue/10 text-neon-blue border-neon-blue" onClick={() => { setAiMode('generate'); setIsAIModalOpen(true); }}>
                                        <Sparkles className="w-4 h-4" /> Nhờ AI Viết Bài
                                    </Button>
                                </div>
                            </div>
                            <PostEditor content={content} onChange={setContent} />
                            {content && (
                                <Button type="button" variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground" onClick={() => { setAiMode('paraphrase'); setIsAIModalOpen(true); }}>
                                    <Sparkles className="w-3 h-3 mr-2" /> Nhờ AI trau chuốt lại nội dung...
                                </Button>
                            )}
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-primary/10">
                            <Label className="text-xl mb-4 block text-muted-foreground">Đoạn Trích Hiển Thị (Excerpt)</Label>
                            <Input
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Dòng mô tả ngắn xuất hiện ở trang chủ..."
                                className="h-14 text-lg bg-background/50"
                            />
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-2xl space-y-6 border border-primary/10">
                            <h3 className="font-bold text-lg text-neon-red border-b border-primary/10 pb-2">Publishing</h3>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="published">Công Bố (Published)</Label>
                                <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="featured">Ghim (Featured)</Label>
                                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl space-y-6 border border-primary/10">
                            <h3 className="font-bold text-lg text-neon-blue border-b border-primary/10 pb-2">SEO & Đường Dẫn</h3>
                            <div className="space-y-4">
                                <Label>Slug (Đường dẫn tĩnh)</Label>
                                <div className="flex gap-2">
                                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-background/50" />
                                    <Button variant="outline" size="icon" onClick={() => setSlug(generateSlug(title))}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Nên để tự sinh tự động từ Title.</p>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl space-y-6 border border-primary/10">
                            <h3 className="font-bold text-lg text-neon-blue border-b border-primary/10 pb-2">Ảnh Bìa (Media)</h3>
                            <div className="space-y-4">
                                <Label>Link URL Ảnh Khách Của Bài</Label>
                                <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="bg-background/50" />
                                {coverImage && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-video shadow-lg">
                                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <AIImageGenerator isOpen={isAIImageOpen} onClose={() => setIsAIImageOpen(false)} onInsert={(url) => setContent(prev => prev + `<p><img src="${url}" alt="AI" /></p>`)} />
                <AIWriterModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} mode={aiMode} initialTopic={aiMode === 'generate' ? title : content} onInsert={(generatedContent) => {
                    if (aiMode === 'generate') setContent((prev) => prev ? prev + '\n\n' + generatedContent : generatedContent);
                    else setContent(generatedContent);
                }} />
                <AISettingsModal isOpen={isKeysOpen} onClose={() => setIsKeysOpen(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Blog Manager
                        </h1>
                        <p className="text-muted-foreground">Manage your blog posts and content</p>
                    </div>
                </div>
                <Button onClick={handleCreate} className="btn-neon gap-2">
                    <Plus className="w-4 h-4" /> New Post
                </Button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-primary/5">
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : posts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No posts found. Create your first one!
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts?.map((post) => (
                                <TableRow key={post.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{post.title}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[300px]">{post.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant={post.is_published ? "default" : "secondary"} className={post.is_published ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}>
                                                {post.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                            {post.featured && (
                                                <Badge variant="outline" className="border-primary/50 text-primary">Featured</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                                                <Pencil className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AIImageGenerator isOpen={isAIImageOpen} onClose={() => setIsAIImageOpen(false)} onInsert={(url) => setContent(prev => prev + `<p><img src="${url}" alt="AI Generated" /></p>`)} />
            <AIWriterModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} mode={aiMode} initialTopic={aiMode === 'generate' ? title : content} onInsert={(generatedContent) => {
                if (aiMode === 'generate') setContent((prev) => prev ? prev + '\n\n' + generatedContent : generatedContent);
                else setContent(generatedContent);
            }} />
            <AISettingsModal isOpen={isKeysOpen} onClose={() => setIsKeysOpen(false)} />
        </div>
    );
};

export default BlogManager;
