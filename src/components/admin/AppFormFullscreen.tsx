import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Save, X, Loader2,
    Globe, Monitor, ExternalLink, Github, Download, Sparkles,
    Youtube, BookOpen, Crown, Settings, Image, HardDrive, Play, Shield, CloudDownload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateAppContent } from '@/lib/deepseek';
import FileUpload from '@/components/admin/FileUpload';
import MultiFileUpload from '@/components/admin/MultiFileUpload';
import type { AppData } from '@/hooks/useApps';
import type { AccountType } from '@/contexts/AuthContext';
import { getIconComponent } from '@/hooks/useApps';

const iconOptions = [
    'Monitor', 'Globe', 'Zap', 'MousePointer2', 'Eye', 'Video', 'FileCode', 'Sparkles',
    'Download', 'Settings', 'Image', 'HardDrive', 'Play', 'Shield', 'CloudDownload'
];

const iconLabels: Record<string, string> = {
    Monitor: 'Màn hình',
    Globe: 'Website',
    Zap: 'Năng lượng',
    MousePointer2: 'Con trỏ',
    Eye: 'Con mắt',
    Video: 'Camera/Video',
    FileCode: 'Mã nguồn',
    Sparkles: 'Lấp lánh',
    Download: 'Tải về',
    Settings: 'Cài đặt',
    Image: 'Hình ảnh',
    HardDrive: 'Ổ cứng/Disk',
    Play: 'Phát/Play',
    Shield: 'Bảo mật',
    CloudDownload: 'Tải đám mây'
};

interface AppFormFullscreenProps {
    isOpen: boolean;
    isCreating: boolean;
    initialData: Partial<AppData>;
    onSave: (data: Partial<AppData>) => Promise<void>;
    onClose: () => void;
    saving?: boolean;
}

const AppFormFullscreen = ({
    isOpen,
    isCreating,
    initialData,
    onSave,
    onClose,
    saving = false
}: AppFormFullscreenProps) => {
    const { language } = useLanguage();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<AppData>>(initialData);
    const [generating, setGenerating] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');

    const texts = {
        en: {
            create: 'Create App',
            edit: 'Edit App',
            save: 'Save Changes',
            cancel: 'Cancel',
            basicInfo: 'Basic Information',
            content: 'Content & Description',
            links: 'Links, Media & Guide',
            settings: 'Settings & Permissions',
            appTitle: 'Title (EN)',
            appTitleVi: 'Title (VI)',
            description: 'Description (EN)',
            descriptionVi: 'Description (VI)',
            platform: 'Platform',
            icon: 'Icon',
            categories: 'Categories',
            url: 'App URL',
            githubUrl: 'GitHub URL',
            downloadUrl: 'Download URL',
            videoUrl: 'YouTube Video URL',
            guide: 'Installation Guide (Markdown)',
            screenshots: 'Screenshots',
            subscription: 'Required Subscription',
            featured: 'Featured',
            active: 'Active',
            apiKeyPlaceholder: 'DeepSeek API Key...',
        },
        vi: {
            create: 'Tạo Ứng Dụng Mới',
            edit: 'Chỉnh Sửa Ứng Dụng',
            save: 'Lưu Thay Đổi',
            cancel: 'Hủy Bỏ',
            basicInfo: 'Thông Tin Cơ Bản',
            content: 'Nội Dung & Mô Tả',
            links: 'Liên Kết, Media & Hướng Dẫn',
            settings: 'Cài Đặt & Phân Quyền',
            appTitle: 'Tiêu đề (EN)',
            appTitleVi: 'Tiêu đề (VI)',
            description: 'Mô tả (EN)',
            descriptionVi: 'Mô tả (VI)',
            platform: 'Nền tảng',
            icon: 'Icon',
            categories: 'Danh mục',
            url: 'URL Ứng dụng',
            githubUrl: 'URL GitHub',
            downloadUrl: 'URL Tải về',
            videoUrl: 'Link Video YouTube',
            guide: 'Hướng Dẫn Cài Đặt (Markdown)',
            screenshots: 'Ảnh Chụp Màn Hình',
            subscription: 'Yêu Cầu Gói',
            featured: 'Nổi bật',
            active: 'Hoạt động',
            apiKeyPlaceholder: 'DeepSeek API Key...',
        }
    };

    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [aiTargetLang, setAiTargetLang] = useState<'vi' | 'en'>('vi');
    const [aiContext, setAiContext] = useState('');
    const [aiStyle, setAiStyle] = useState('apple');

    const t = texts[language];

    const openAIDialog = (lang: 'vi' | 'en') => {
        setAiTargetLang(lang);
        setAiDialogOpen(true);
    };

    // Sync initialData to local state when it changes
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleGenerateAI = async () => {
        if (!apiKey) {
            toast({ title: 'Vui lòng nhập DeepSeek API Key', variant: 'destructive' });
            return;
        }

        setGenerating(true);
        try {
            localStorage.setItem('deepseek_api_key', apiKey);
            const content = await generateAppContent(
                formData.title || 'App',
                aiContext,
                aiStyle,
                aiTargetLang,
                apiKey
            );

            if (aiTargetLang === 'en') {
                setFormData({ ...formData, description: content });
            } else {
                setFormData({ ...formData, description_vi: content });
            }

            toast({ title: 'Đã tạo nội dung thành công!', description: 'Nội dung đã được điền vào ô mô tả.' });
            setAiDialogOpen(false);
        } catch (error: any) {
            toast({ title: 'Lỗi AI', description: error.message, variant: 'destructive' });
        } finally {
            setGenerating(false);
        }
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const current = formData.categories || [];
        if (checked) {
            setFormData({ ...formData, categories: [...current, category] });
        } else {
            setFormData({ ...formData, categories: current.filter(c => c !== category) });
        }
    };

    const handleSubmit = async () => {
        // Strip ID if creating new to allow UUID generation
        const dataToSave = { ...formData };
        if (isCreating) {
            delete dataToSave.id;
        }
        await onSave(dataToSave);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md overflow-y-auto"
        >
            <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/50 z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{isCreating ? t.create : t.edit}</h1>
                            {formData.title && (
                                <p className="text-muted-foreground text-sm">{formData.title}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="rounded-xl"
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t.cancel}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="btn-neon rounded-xl text-background"
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {t.save}
                        </Button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Info & Settings */}
                    <div className="space-y-6">
                        {/* Basic Info Section */}
                        <div className="glass-card p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-primary" />
                                {t.basicInfo}
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t.appTitle}</Label>
                                    <Input
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t.appTitleVi}</Label>
                                    <Input
                                        value={formData.title_vi || ''}
                                        onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t.platform}</Label>
                                    <Select
                                        value={formData.platform || 'desktop'}
                                        onValueChange={(value) => setFormData({ ...formData, platform: value as 'web' | 'desktop' })}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            <SelectItem value="web">Web</SelectItem>
                                            <SelectItem value="desktop">Desktop</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t.icon}</Label>
                                    <Select
                                        value={formData.icon_name || 'Monitor'}
                                        onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            {iconOptions.map((iconName) => {
                                                const Icon = getIconComponent(iconName);
                                                return (
                                                    <SelectItem key={iconName} value={iconName}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="w-4 h-4" />
                                                            <span>
                                                                {language === 'vi' ? (iconLabels[iconName] || iconName) : iconName}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t.categories}</Label>
                                <div className="flex flex-wrap gap-3">
                                    {['web', 'desktop', 'automation'].map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer glass-card px-3 py-2 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.categories?.includes(cat)}
                                                onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                                                className="rounded border-primary/50 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm capitalize font-medium">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Links, Media & Guide Section */}
                        <div className="glass-card p-6 rounded-2xl space-y-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-primary" />
                                {t.links}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        {t.url}
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
                                        <Youtube className="w-4 h-4 text-red-500" />
                                        {t.videoUrl}
                                    </Label>
                                    <Input
                                        value={formData.video_url || ''}
                                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Github className="w-4 h-4" />
                                    {t.githubUrl}
                                </Label>
                                <Input
                                    value={formData.github_url || ''}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                    placeholder="https://github.com/username/repo"
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    {t.downloadUrl}
                                </Label>
                                <Input
                                    value={formData.download_url || ''}
                                    onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                                    placeholder="Download link..."
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t.guide}
                                </Label>
                                <Textarea
                                    value={formData.guide || ''}
                                    onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                                    className="rounded-xl min-h-[120px] font-mono text-sm"
                                    placeholder="# Installation Guide&#10;1. Step one...&#10;2. Step two...&#10;&#10;Use Markdown for formatting!"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-border/50">
                                <FileUpload
                                    label="Icon / Cover Image"
                                    bucket="app-assets"
                                    accept="image/*"
                                    maxSizeMB={5}
                                    currentUrl={formData.image_url}
                                    onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                                />

                                <MultiFileUpload
                                    label={t.screenshots}
                                    bucket="app-assets"
                                    accept="image/*"
                                    maxSizeMB={5}
                                    maxFiles={6}
                                    currentUrls={formData.screenshots}
                                    onUploadSuccess={(urls) => setFormData({ ...formData, screenshots: urls })}
                                />
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="glass-card p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Crown className="w-5 h-5 text-primary" />
                                {t.settings}
                            </h2>
                            <div className="flex flex-wrap gap-6 items-center">
                                <div className="space-y-2 min-w-[150px]">
                                    <Label>{t.subscription}</Label>
                                    <Select
                                        value={formData.required_subscription || 'Free'}
                                        onValueChange={(value) => setFormData({ ...formData, required_subscription: value as AccountType })}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            <SelectItem value="Free">Free</SelectItem>
                                            <SelectItem value="VIP1">VIP1</SelectItem>
                                            <SelectItem value="VIP2">VIP2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <Switch
                                        checked={formData.featured || false}
                                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                                    />
                                    <Label>{t.featured}</Label>
                                </div>
                                {!isCreating && (
                                    <div className="flex items-center gap-2 pt-6">
                                        <Switch
                                            checked={formData.is_active ?? true}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label>{t.active}</Label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-6">
                        {/* AI API Key */}
                        <div className="glass-card p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <Input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={t.apiKeyPlaceholder}
                                    className="rounded-xl flex-1"
                                />
                            </div>
                        </div>

                        {/* Description EN */}
                        <div className="glass-card p-6 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-lg font-semibold">{t.description}</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-primary border-primary/30"
                                    onClick={() => openAIDialog('en')}
                                    disabled={generating}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI Write Tool
                                </Button>
                            </div>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="rounded-xl min-h-[300px] text-base leading-relaxed font-sans"
                                rows={12}
                                placeholder="Enter English description..."
                            />
                        </div>

                        {/* Description VI */}
                        <div className="glass-card p-6 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-lg font-semibold">{t.descriptionVi}</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-primary border-primary/30 hover:bg-primary/10"
                                    onClick={() => openAIDialog('vi')}
                                    disabled={generating}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI Write Tool (VN)
                                </Button>
                            </div>
                            <Textarea
                                value={formData.description_vi || ''}
                                onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                                className="rounded-xl min-h-[300px] text-base leading-relaxed font-sans"
                                rows={12}
                                placeholder="Nhập mô tả tiếng Việt..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Generation Dialog */}
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent className="sm:max-w-[600px] z-[200] border-primary/20 bg-background/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl gradient-text">
                            <Sparkles className="w-5 h-5 text-primary" />
                            AI Content Generator
                        </DialogTitle>
                        <DialogDescription>
                            Tạo mô tả chuyên nghiệp cho {aiTargetLang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.
                            AI sẽ tự động nghiên cứu và viết theo phong cách bạn chọn.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Context & Ý tưởng cốt lõi</Label>
                            <Textarea
                                placeholder="VD: App tự động tải video từ YouTube, hỗ trợ 4K, tự động gắn thẻ, giao diện Dark Mode..."
                                value={aiContext}
                                onChange={(e) => setAiContext(e.target.value)}
                                className="h-24 resize-none"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Cung cấp càng nhiều chi tiết, AI viết càng chính xác. Nếu để trống, AI sẽ tự "phịa" dựa trên tên App.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phong cách viết</Label>
                                <Select value={aiStyle} onValueChange={setAiStyle}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[250]">
                                        <SelectItem value="apple">Apple (Sang trọng, Tối giản)</SelectItem>
                                        <SelectItem value="notion">Notion/Linear (Chuyên nghiệp)</SelectItem>
                                        <SelectItem value="fun">Gen Z (Vui vẻ, Emoji)</SelectItem>
                                        <SelectItem value="professional">Enterprise (Nghiêm túc)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ngôn ngữ</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted/50 text-sm cursor-not-allowed text-muted-foreground">
                                    {aiTargetLang === 'vi' ? 'Tiếng Việt (Vietnamese)' : 'Tiếng Anh (English)'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleGenerateAI} disabled={generating} className="btn-neon text-background">
                            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                            Bắt đầu viết
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div >
    );
};

export default AppFormFullscreen;
