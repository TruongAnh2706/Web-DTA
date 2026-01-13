import { useState, useEffect } from 'react';
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
        formData.title,
        lang === 'vi' ? formData.description_vi || '' : formData.description || '',
        lang,
        apiKey
      );

      if (lang === 'vi') {
        setFormData(prev => ({ ...prev, description_vi: content }));
      } else {
        setFormData(prev => ({ ...prev, description: content }));
      }
      toast({ title: 'Content Generated Successfully' });
    } catch (error: any) {
      toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
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
        await createApp.mutateAsync(formData as any);
        toast({ title: texts.success, description: texts.appCreated });
      } else if (editingApp) {
        await updateApp.mutateAsync({ ...formData, id: editingApp.id } as any);
        toast({ title: texts.success, description: texts.appUpdated });
      }
      setEditingApp(null);
      setIsCreating(false);
      setFormData({});
    } catch (error: any) {
      toast({ title: texts.error, description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(texts.confirmDelete)) return;
    try {
      await deleteApp.mutateAsync(id);
      toast({ title: texts.success, description: texts.appDeleted });
    } catch (error: any) {
      toast({ title: texts.error, description: error.message, variant: 'destructive' });
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

      <div className="relative z-10 px-4 py-8">
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
              <TabsList className="grid w-full grid-cols-2 glass-card p-1 rounded-xl mb-8 h-auto">
                <TabsTrigger value="apps" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Monitor className="w-4 h-4 mr-2" />
                  {texts.apps}
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-lg py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Users className="w-4 h-4 mr-2" />
                  {texts.users}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apps">
                <div className="grid lg:grid-cols-2 gap-8">
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
                      <div className="space-y-3">
                        {apps?.map((app) => {
                          const Icon = getIconComponent(app.icon_name);
                          return (
                            <motion.div
                              key={app.id}
                              layout
                              className={`glass-card p-4 rounded-xl flex items-center justify-between ${editingApp?.id === app.id ? 'neon-border' : ''
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg gradient-neon flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-background" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{language === 'vi' ? app.title_vi : app.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {app.platform === 'web' ? <Globe className="w-3 h-3 mr-1" /> : <Monitor className="w-3 h-3 mr-1" />}
                                      {app.platform}
                                    </Badge>
                                    {app.featured && (
                                      <Badge className="gradient-neon text-background text-xs">Featured</Badge>
                                    )}
                                    {!app.is_active && (
                                      <Badge variant="destructive" className="text-xs">Inactive</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(app)}
                                  className="rounded-lg hover:bg-primary/10"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(app.id)}
                                  className="rounded-lg hover:bg-destructive/10 text-destructive"
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

                  {/* Edit Form */}
                  <AnimatePresence mode="wait">
                    {(editingApp || isCreating) && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="glass-card neon-border p-6 rounded-2xl sticky top-8"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold">
                            {isCreating ? texts.create : texts.edit}
                          </h2>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => { setEditingApp(null); setIsCreating(false); }}
                            className="rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                          {isCreating && (
                            <div className="space-y-2">
                              <Label>ID (slug)</Label>
                              <Input
                                value={formData.id || ''}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="my-app"
                                className="rounded-xl"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{texts.appTitle}</Label>
                              <Input
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{texts.appTitleVi}</Label>
                              <Input
                                value={formData.title_vi || ''}
                                onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                                className="rounded-xl"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>{texts.description}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-primary"
                                onClick={() => handleGenerateAI('en')}
                                disabled={generating}
                              >
                                {generating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                AI Write
                              </Button>
                            </div>
                            <Textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="rounded-xl"
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>{texts.descriptionVi}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-primary"
                                onClick={() => handleGenerateAI('vi')}
                                disabled={generating}
                              >
                                {generating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                AI Write (VN)
                              </Button>
                            </div>
                            <Textarea
                              value={formData.description_vi || ''}
                              onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                              className="rounded-xl"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{texts.platform}</Label>
                              <Select
                                value={formData.platform || 'desktop'}
                                onValueChange={(value) => setFormData({ ...formData, platform: value as 'web' | 'desktop' })}
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="web">Web</SelectItem>
                                  <SelectItem value="desktop">Desktop</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{texts.icon}</Label>
                              <Select
                                value={formData.icon_name || 'Monitor'}
                                onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {iconOptions.map((icon) => (
                                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>{texts.categories}</Label>
                            <div className="flex flex-wrap gap-2">
                              {['web', 'desktop', 'automation'].map((cat) => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.categories?.includes(cat)}
                                    onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{cat}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              {texts.url}
                            </Label>
                            <Input
                              value={formData.url || ''}
                              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                              placeholder="https://..."
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Github className="w-4 h-4" />
                              {texts.githubUrl}
                            </Label>
                            <Input
                              value={formData.github_url || ''}
                              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                              placeholder="https://github.com/..."
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              {texts.downloadUrl}
                            </Label>
                            <Input
                              value={formData.download_url || ''}
                              onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                              placeholder="https://..."
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{texts.imageUrl}</Label>
                            <Input
                              value={formData.image_url || ''}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                              placeholder="https://..."
                              className="rounded-xl"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={formData.featured || false}
                                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                              />
                              <Label>{texts.featured}</Label>
                            </div>
                            {!isCreating && (
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={formData.is_active ?? true}
                                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label>{texts.active}</Label>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={handleSave}
                              className="flex-1 btn-neon rounded-xl text-background"
                              disabled={updateApp.isPending || createApp.isPending}
                            >
                              {(updateApp.isPending || createApp.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              {isCreating ? texts.create : texts.save}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => { setEditingApp(null); setIsCreating(false); }}
                              className="rounded-xl"
                            >
                              {texts.cancel}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="glass-card p-8 rounded-xl text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">User Management System</h3>
                  <p className="text-muted-foreground mb-6">This module is currently under development. It will verify users and manage licenses.</p>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
