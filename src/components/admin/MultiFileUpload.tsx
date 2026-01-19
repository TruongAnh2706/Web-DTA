import { useState, useRef } from 'react';
import { Upload, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiFileUploadProps {
    label: string;
    bucket: 'app-assets' | 'app-builds';
    accept?: string;
    maxSizeMB?: number;
    maxFiles?: number;
    onUploadSuccess: (urls: string[]) => void;
    currentUrls?: string[];
}

const MultiFileUpload = ({
    label,
    bucket,
    accept = 'image/*',
    maxSizeMB = 5,
    maxFiles = 5,
    onUploadSuccess,
    currentUrls = []
}: MultiFileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [urls, setUrls] = useState<string[]>(currentUrls || []);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (urls.length + files.length > maxFiles) {
            toast({
                title: 'Quá giới hạn số lượng',
                description: `Chỉ được upload tối đa ${maxFiles} ảnh.`,
                variant: 'destructive'
            });
            return;
        }

        setUploading(true);

        try {
            const newUrls: string[] = [];

            for (const file of files) {
                // Validate size
                if (file.size / 1024 / 1024 > maxSizeMB) {
                    toast({
                        title: 'File quá lớn',
                        description: `File ${file.name} vượt quá ${maxSizeMB}MB`,
                        variant: 'destructive'
                    });
                    continue;
                }

                // Generate unique filename
                const timestamp = Date.now();
                const fileExt = file.name.split('.').pop();
                const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload
                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                // Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);

                newUrls.push(publicUrl);
            }

            const updatedUrls = [...urls, ...newUrls];
            setUrls(updatedUrls);
            onUploadSuccess(updatedUrls);

            toast({ title: 'Thành công', description: `Đã upload thêm ${newUrls.length} ảnh!` });

        } catch (err: any) {
            console.error('Upload error:', err);
            toast({ title: 'Lỗi upload', description: err.message, variant: 'destructive' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = (indexToRemove: number) => {
        const newUrls = urls.filter((_, index) => index !== indexToRemove);
        setUrls(newUrls);
        onUploadSuccess(newUrls);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label>{label} ({urls.length}/{maxFiles})</Label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading || urls.length >= maxFiles}
                    className="hidden"
                    id={`multi-upload-${bucket}`}
                />
                <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading || urls.length >= maxFiles}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8"
                >
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Thêm Ảnh
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <AnimatePresence>
                    {urls.map((url, index) => (
                        <motion.div
                            key={url}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
                        >
                            <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemove(index)}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {urls.length === 0 && (
                    <div className="col-span-3 flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm">Chưa có ảnh nào upload</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiFileUpload;
