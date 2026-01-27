import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Pencil, Trash2, Save, X, Loader2,
  Globe, Monitor, ExternalLink, Github, Download, LogOut, Sparkles, Key,
  Users, DollarSign, Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApps, useUpdateApp, useCreateApp, useDeleteApp, getIconComponent, type AppData } from '@/hooks/useApps';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import { generateAppContent } from '@/lib/deepseek';
import UserTable, { AdminUser } from '@/components/admin/UserTable';
import UserEditDialog, { WalletUpdateDialog } from '@/components/admin/UserEditDialog';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from '@/components/admin/FileUpload';
import AppFormFullscreen from '@/components/admin/AppFormFullscreen';
import BlogManager from '@/pages/admin/BlogManager';
import { FileText } from 'lucide-react';

const iconOptions = [
  'Monitor', 'Globe', 'Zap', 'MousePointer2', 'Eye', 'Video', 'FileCode', 'Sparkles'
];

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: apps, isLoading: appsLoading } = useApps();
  const updateApp = useUpdateApp();
  const createApp = useCreateApp();
  const deleteApp = useDeleteApp();
  const { toast } = useToast();
  const { language } = useLanguage();

  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<AppData>>({});

  // AI State
  const [generating, setGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // User Management State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      // @ts-expect-error RPC type definition is missing in supabase types
      const { data, error } = await supabase.rpc('get_admin_users');
      if (error) throw error;
      setUsers((data as AdminUser[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Failed to fetch users', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  useEffect(() => {
    const storedKey = localStorage.getItem('deepseek_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('deepseek_api_key', apiKey);
    setShowApiKeyInput(false);
    toast({ title: 'API Key Saved' });
  };

  const handleGenerateAI = async (lang: 'vi' | 'en') => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      toast({ title: 'Please enter DeepSeek API Key first', variant: 'destructive' });
      return;
    }
    if (!formData.title) {
      toast({ title: 'Please enter a title first', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      const content = await generateAppContent(
        formData.title || '',
        lang === 'vi' ? formData.description_vi || '' : formData.description || '',
        'apple',
        lang,
        apiKey
      );

      if (lang === 'vi') {
        setFormData(prev => ({ ...prev, description_vi: content }));
      } else {
        setFormData(prev => ({ ...prev, description: content }));
      }
      toast({ title: 'Content Generated Successfully' });
    } catch (error) {
      toast({ title: 'Generation Failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const t = {
    // ... existings translations
    en: {
      title: 'Admin Dashboard',
      subtitle: 'Manage your apps and products',
      addNew: 'Add New App',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save Changes',
      cancel: 'Cancel',
      create: 'Create App',
      appTitle: 'Title (EN)',
      appTitleVi: 'Title (VI)',
      description: 'Description (EN)',
      descriptionVi: 'Description (VI)',
      platform: 'Platform',
      icon: 'Icon',
      url: 'App URL',
      githubUrl: 'GitHub URL',
      downloadUrl: 'Download URL',
      imageUrl: 'Image URL',
      featured: 'Featured',
      active: 'Active',
      categories: 'Categories',
      success: 'Success',
      appUpdated: 'App updated successfully',
      appCreated: 'App created successfully',
      appDeleted: 'App deleted successfully',
      error: 'Error',
      confirmDelete: 'Are you sure you want to delete this app?',
      notAuthorized: 'Not authorized',
      logout: 'Logout',
      stats: 'Statistics',
      totalApps: 'Total Apps',
      totalUsers: 'Total Users',
      totalRevenue: 'Total Revenue',
      users: 'Users Management',
      apps: 'Apps Management',
      blog: 'Blog Management',
    },
    vi: {
      title: 'Trang Quản Trị',
      subtitle: 'Quản lý ứng dụng và sản phẩm',
      addNew: 'Thêm Ứng Dụng',
      edit: 'Sửa',
      delete: 'Xóa',
      save: 'Lưu Thay Đổi',
      cancel: 'Hủy',
      create: 'Tạo Ứng Dụng',
      appTitle: 'Tiêu đề (EN)',
      appTitleVi: 'Tiêu đề (VI)',
      description: 'Mô tả (EN)',
      descriptionVi: 'Mô tả (VI)',
      platform: 'Nền tảng',
      icon: 'Biểu tượng',
      url: 'URL Ứng dụng',
      githubUrl: 'GitHub URL',
      downloadUrl: 'URL Tải xuống',
      imageUrl: 'URL Hình ảnh',
      featured: 'Nổi bật',
      active: 'Hoạt động',
      categories: 'Danh mục',
      success: 'Thành công',
      appUpdated: 'Cập nhật ứng dụng thành công',
      appCreated: 'Tạo ứng dụng thành công',
      appDeleted: 'Xóa ứng dụng thành công',
      error: 'Lỗi',
      confirmDelete: 'Bạn có chắc muốn xóa ứng dụng này?',
      notAuthorized: 'Không có quyền truy cập',
      logout: 'Đăng xuất',
      stats: 'Thống kê',
      totalApps: 'Tổng Ứng dụng',
      totalUsers: 'Tổng Người dùng',
      totalRevenue: 'Tổng Doanh thu',
      users: 'Quản lý Người dùng',
      apps: 'Quản lý Ứng dụng',
      blog: 'Quản lý Bài viết',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="glass-card neon-border p-8 rounded-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">{texts.notAuthorized}</h1>
          <Link to="/">
            <Button className="btn-neon rounded-full text-background">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Về trang chủ' : 'Go Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEdit = (app: AppData) => {
    setEditingApp(app);
    setFormData(app);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingApp(null);
    setFormData({
      id: '',
      title: '',
      title_vi: '',
      description: '',
      description_vi: '',
      icon_name: 'Monitor',
      platform: 'desktop',
      categories: ['desktop'],
      url: '#',
      github_url: '',
      download_url: '',
      image_url: '',
      featured: false,
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const { id, ...createData } = formData;
        await createApp.mutateAsync(createData as unknown as Omit<AppData, 'created_at' | 'updated_at' | 'is_active'>);
        toast({ title: texts.success, description: texts.appCreated });
      } else if (editingApp) {
        await updateApp.mutateAsync({ ...formData, id: editingApp.id } as unknown as Partial<AppData> & { id: string });
        toast({ title: texts.success, description: texts.appUpdated });
      }
      setEditingApp(null);
      setIsCreating(false);
      setFormData({});
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Localize common errors
      if (errorMessage.includes('invalid input syntax for type uuid')) {
        errorMessage = language === 'vi'
          ? 'Lỗi: ID phải là dạng UUID chuẩn (không được tự đặt tên như "auto-down"). Hệ thống sẽ tự tạo ID.'
          : 'Error: ID must be a valid UUID. The system will auto-generate it.';
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = language === 'vi'
          ? 'Lỗi: Dữ liệu bị trùng lặp (có thể do ID hoặc tên).'
          : 'Error: Duplicate data entry (ID or title).';
      }

      toast({
        title: texts.error,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(texts.confirmDelete)) return;
    try {
      await deleteApp.mutateAsync(id);
      toast({ title: texts.success, description: texts.appDeleted });
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Localize delete errors if needed
      if (errorMessage.includes('violates foreign key constraint')) {
        errorMessage = language === 'vi'
          ? 'Không thể xóa: App này đang được sử dụng bởi user khác.'
          : 'Cannot delete: This app is in use by other users.';
      }
      toast({ title: texts.error, description: errorMessage, variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const current = formData.categories || [];
    if (checked) {
      setFormData({ ...formData, categories: [...current, category] });
    } else {
      setFormData({ ...formData, categories: current.filter(c => c !== category) });
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'vi' ? 'Quay lại' : 'Back'}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{texts.title}</h1>
                <p className="text-muted-foreground">{texts.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="rounded-full border-primary/20"
              >
                <Key className="w-4 h-4 mr-2" />
                API Key
              </Button>
              <Button onClick={handleCreate} className="btn-neon rounded-full text-background">
                <Plus className="w-4 h-4 mr-2" />
                {texts.addNew}
              </Button>
              <Button variant="outline" onClick={handleLogout} className="rounded-full">
                <LogOut className="w-4 h-4 mr-2" />
                {texts.logout}
              </Button>
            </div>
          </motion.div>

          {/* API Key Input */}
          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="glass-card p-4 rounded-xl flex items-end gap-4 max-w-md ml-auto">
                  <div className="flex-1 space-y-2">
                    <Label>DeepSeek API Key</Label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="rounded-xl"
                    />
                  </div>
                  <Button onClick={saveApiKey}>Save</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Monitor className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{texts.totalApps}</div>
                  <div className="text-3xl font-bold">{apps?.length || 0}</div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{texts.totalUsers}</div>
                  <div className="text-3xl font-bold">1,234</div>
                  <div className="text-xs text-green-500">+12% this month</div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{texts.totalRevenue}</div>
                  <div className="text-3xl font-bold">$12,450</div>
                  <div className="text-xs text-green-500">+8% this month</div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="apps" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-xl mb-8 h-auto">
                <TabsTrigger value="apps" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Monitor className="w-4 h-4 mr-2" />
                  {texts.apps}
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Users className="w-4 h-4 mr-2" />
                  {texts.users}
                </TabsTrigger>
                <TabsTrigger value="blog" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  {texts.blog}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apps">
                {/* App List */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-bold mb-4">
                    {language === 'vi' ? 'Danh sách ứng dụng' : 'App List'}
                  </h2>

                  {appsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {apps?.map((app) => {
                        const Icon = getIconComponent(app.icon_name);
                        return (
                          <motion.div
                            key={app.id}
                            layout
                            className={`glass-card rounded-xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${editingApp?.id === app.id ? 'neon-border' : ''
                              }`}
                          >
                            {/* Thumbnail / Header Area */}
                            <div className="aspect-video relative bg-secondary/30 flex items-center justify-center overflow-hidden">
                              {app.image_url ? (
                                <img
                                  src={app.image_url}
                                  alt={app.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    // Fallback if image fails
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('fallback-icon');
                                  }}
                                />
                              ) : null}

                              {/* Icon Overlay (Visible if no image or strictly as overlay) */}
                              <div className={`absolute inset-0 flex items-center justify-center ${app.image_url ? 'bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''}`}>
                                <div className="w-16 h-16 rounded-2xl gradient-neon flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                  <Icon className="w-8 h-8 text-background" />
                                </div>
                              </div>

                              {/* Status Badges */}
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                {app.featured && (
                                  <Badge className="gradient-neon text-background text-xs shadow-lg">
                                    {language === 'vi' ? 'Nổi bật' : 'Featured'}
                                  </Badge>
                                )}
                                {!app.is_active && (
                                  <Badge variant="destructive" className="text-xs shadow-lg">Inactive</Badge>
                                )}
                              </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-lg leading-tight line-clamp-1" title={language === 'vi' ? app.title_vi : app.title}>
                                  {language === 'vi' ? app.title_vi : app.title}
                                </h3>
                              </div>

                              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                                {language === 'vi' ? app.description_vi : app.description}
                              </p>

                              <div className="mt-auto pt-2 flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-[10px] h-5">
                                  {app.platform === 'web' ? <Globe className="w-3 h-3 mr-1" /> : <Monitor className="w-3 h-3 mr-1" />}
                                  {app.platform}
                                </Badge>
                                {app.categories?.slice(0, 2).map((cat: string) => (
                                  <Badge key={cat} variant="outline" className="text-[10px] h-5 border-primary/20">
                                    {cat}
                                  </Badge>
                                ))}
                                {(app.categories?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-[10px] h-5 border-primary/20">+{((app.categories?.length || 0) - 2)}</Badge>
                                )}
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 pt-0 mt-2 flex items-center justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(app)}
                                className="flex-1 bg-primary/5 hover:bg-primary/20 border-primary/20 hover:border-primary/50 text-xs font-medium h-9"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                {texts.edit}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(app.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="users">
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">User Management</h2>
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
                      {loadingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh List'}
                    </Button>
                  </div>

                  <UserTable
                    users={users}
                    loading={loadingUsers}
                    onEdit={(user) => {
                      setSelectedUser(user);
                      setShowEditUserDialog(true);
                    }}
                    onUpdateWallet={(user) => {
                      setSelectedUser(user);
                      setShowWalletDialog(true);
                    }}
                  />
                </div>

                <UserEditDialog
                  user={selectedUser}
                  isOpen={showEditUserDialog}
                  onClose={() => setShowEditUserDialog(false)}
                  onSuccess={fetchUsers}
                />

                <WalletUpdateDialog
                  user={selectedUser}
                  isOpen={showWalletDialog}
                  onClose={() => setShowWalletDialog(false)}
                  onSuccess={fetchUsers}
                />
              </TabsContent>

              <TabsContent value="blog">
                <BlogManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>


        {/* Fullscreen App Form */}
        <AppFormFullscreen
          isOpen={editingApp !== null || isCreating}
          isCreating={isCreating}
          initialData={formData}
          onSave={async (data) => {
            try {
              if (isCreating) {
                // Remove 'id' so Supabase generates a new UUID
                const { id, ...createData } = data;
                await createApp.mutateAsync(createData as unknown as Omit<AppData, 'created_at' | 'updated_at' | 'is_active'>);
                toast({ title: texts.success, description: texts.appCreated });
              } else if (editingApp) {
                await updateApp.mutateAsync({ ...data, id: editingApp.id } as unknown as Partial<AppData> & { id: string });
                toast({ title: texts.success, description: texts.appUpdated });
              }
              setEditingApp(null);
              setIsCreating(false);
              setFormData({});
            } catch (error) {
              let errorMessage = error instanceof Error ? error.message : 'Unknown error';

              // Localize common errors
              if (errorMessage.includes('invalid input syntax for type uuid')) {
                errorMessage = language === 'vi'
                  ? 'Lỗi: ID phải là dạng UUID chuẩn (không được tự đặt tên như "auto-down"). Hệ thống sẽ tự tạo ID.'
                  : 'Error: ID must be a valid UUID. The system will auto-generate it.';
              } else if (errorMessage.includes('duplicate key')) {
                errorMessage = language === 'vi'
                  ? 'Lỗi: Dữ liệu bị trùng lặp (có thể do ID hoặc tên).'
                  : 'Error: Duplicate data entry (ID or title).';
              } else if (errorMessage.includes('violates row-level security policy')) {
                errorMessage = language === 'vi'
                  ? 'Lỗi Quyền: Bạn cần chạy lệnh SQL cấp quyền Admin trong Supabase.'
                  : 'Permission Error: You need to run the SQL grant command in Supabase.';
              }

              toast({
                title: texts.error,
                description: errorMessage,
                variant: 'destructive'
              });
            }
          }}
          onClose={() => {
            setEditingApp(null);
            setIsCreating(false);
          }}
          saving={updateApp.isPending || createApp.isPending}
        />
      </div>
    </div>
  );
};

export default AdminPage;
