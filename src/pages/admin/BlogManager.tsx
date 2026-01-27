
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
import { Loader2, Plus, Pencil, Trash2, Eye, LayoutDashboard, Copy } from 'lucide-react';
import PostEditor from '@/components/admin/PostEditor';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const BlogManager = () => {
    const { posts, isLoading, createPost, updatePost, deletePost } = useBlog();
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle>{selectedPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    className="text-lg font-bold"
                                    placeholder="Enter post title..."
                                    value={title}
                                    onChange={handleTitleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Content</Label>
                                <PostEditor content={content} onChange={setContent} />
                            </div>

                            <div className="space-y-2">
                                <Label>Excerpt (Short description)</Label>
                                <Input
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Brief summary for list view..."
                                />
                            </div>
                        </div>

                        {/* Sidebar Settings */}
                        <div className="space-y-6">
                            <div className="glass-card p-4 rounded-xl space-y-4">
                                <h3 className="font-semibold text-lg">Publishing</h3>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="published">Published</Label>
                                    <Switch
                                        id="published"
                                        checked={isPublished}
                                        onCheckedChange={setIsPublished}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="featured">Featured Post</Label>
                                    <Switch
                                        id="featured"
                                        checked={featured}
                                        onCheckedChange={setFeatured}
                                    />
                                </div>
                            </div>

                            <div className="glass-card p-4 rounded-xl space-y-4">
                                <h3 className="font-semibold text-lg">SEO & URL</h3>
                                <div className="space-y-2">
                                    <Label>Slug (URL)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="post-url-slug"
                                        />
                                        <Button variant="outline" size="icon" onClick={() => setSlug(generateSlug(title))}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Unique identifier for the URL.</p>
                                </div>
                            </div>

                            <div className="glass-card p-4 rounded-xl space-y-4">
                                <h3 className="font-semibold text-lg">Media</h3>
                                <div className="space-y-2">
                                    <Label>Cover Image URL</Label>
                                    <Input
                                        value={coverImage}
                                        onChange={(e) => setCoverImage(e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {coverImage && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video">
                                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t bg-muted/20">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} className="btn-neon" disabled={createPost.isPending || updatePost.isPending}>
                            {createPost.isPending || updatePost.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Save Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BlogManager;
