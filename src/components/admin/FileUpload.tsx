import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
    label: string;
    bucket: 'app-assets' | 'app-builds';
    accept?: string;
    maxSizeMB?: number;
    onUploadSuccess: (url: string) => void;
    currentUrl?: string;
}

const FileUpload = ({
    label,
    bucket,
    accept = '*',
    maxSizeMB = 50,
    onUploadSuccess,
    currentUrl
}: FileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState(currentUrl || '');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > maxSizeMB) {
            setError(`File quá lớn! Tối đa ${maxSizeMB}MB.`);
            toast({ title: 'Lỗi', description: `File quá lớn! Tối đa ${maxSizeMB}MB.`, variant: 'destructive' });
            return;
        }

        setError('');
        setUploading(true);
        setProgress(0);

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setUploadedUrl(publicUrl);
            onUploadSuccess(publicUrl);
            setProgress(100);

            toast({ title: 'Thành công', description: 'Upload file thành công!' });
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload thất bại');
            toast({ title: 'Lỗi', description: err.message || 'Upload thất bại', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setUploadedUrl('');
        onUploadSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {!uploadedUrl ? (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id={`file-upload-${bucket}`}
                    />
                    <label
                        htmlFor={`file-upload-${bucket}`}
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${uploading ? 'border-primary/50 bg-primary/5' : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'}
              ${error ? 'border-destructive/50 bg-destructive/5' : ''}
            `}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Đang upload... {progress}%</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Click để chọn file</span>
                                <span className="text-xs text-muted-foreground">Tối đa {maxSizeMB}MB</span>
                            </div>
                        )}
                    </label>
                </div>
            ) : (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-500">Upload thành công!</p>
                        <p className="text-xs text-muted-foreground truncate">{uploadedUrl}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
