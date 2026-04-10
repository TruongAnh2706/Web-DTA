import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIKeys } from '@/hooks/useAIKeys';
import { Key, Plus, Trash2, ShieldCheck, ShieldAlert, Power, Activity, CheckCircle2, XCircle, LayoutDashboard, RotateCcw } from 'lucide-react';
import { AIProvider, markKeyValidSync, markKeyInvalidSync, resetAllKeysValidity } from '@/lib/aiUtils';
import { useToast } from '@/hooks/use-toast';

export function AISettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { keys, primaryProvider, changePrimaryProvider, addKeysBulk, removeKey, toggleKeyActivity, refreshKeys } = useAIKeys();
  const [bulkKeys, setBulkKeys] = useState('');
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const handleAddBulk = (provider: AIProvider) => {
    if (!bulkKeys.trim()) return;
    const count = addKeysBulk(provider, bulkKeys);
    setBulkKeys('');
    toast({ title: `Đã nạp thành công ${count} key vào hệ thống!` });
  };

  // Reset toàn bộ key về trạng thái sống
  const handleResetKeys = (provider: AIProvider) => {
    resetAllKeysValidity(provider);
    refreshKeys();
    toast({ title: 'Đã phục hồi toàn bộ Key!', description: 'Tất cả key đã được đặt lại về trạng thái hoạt động.' });
  };

  const handleTestKeys = async (provider: AIProvider) => {
    setTesting(true);
    let successCount = 0;
    let failCount = 0;
    const keysToTest = keys.filter(k => k.provider === provider && k.isActive);

    for (const keyObj of keysToTest) {
      try {
        let response;
        if (provider === 'gemini') {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyObj.key}`);
        } else {
          response = await fetch('https://api.deepseek.com/user/balance', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${keyObj.key}` }
          });
        }

        if (response.status === 200) {
          // ✅ Key sống → GHI LẠI trạng thái sống vào localStorage
          markKeyValidSync(keyObj.key);
          successCount++;
        } else {
          // ❌ Key chết → Đánh dấu hỏng trong localStorage
          markKeyInvalidSync(keyObj.key);
          failCount++;
        }
      } catch (error) {
        // Lỗi mạng → Đánh dấu hỏng
        markKeyInvalidSync(keyObj.key);
        failCount++;
      }
    }

    setTesting(false);
    toast({ 
      title: 'Hoàn tất kiểm tra mạng!',
      description: `✅ Sống: ${successCount} Key | ❌ Lỗi/Chết: ${failCount} Key`
    });
    refreshKeys(); // Cập nhật giao diện sau khi đã ghi kết quả
  };

  const currentProviderKeys = keys.filter(k => k.provider === primaryProvider);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl glass-card rounded-2xl border-neon-blue/30 h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between">
          <div>
             <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-red">
               <Key className="w-6 h-6 text-neon-blue" />
               Trạm Cấu Hình Trí Tuệ Nhân Tạo
             </DialogTitle>
             <DialogDescription className="mt-2">
               Hệ thống tự động xoay vòng đa Key xuyên suốt mạng lưới ứng dụng. (Chống Rate Limit 429).
             </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6">
          <Tabs defaultValue="gemini" value={primaryProvider} onValueChange={(v) => changePrimaryProvider(v as AIProvider)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 glass-card bg-black/40">
              <TabsTrigger value="gemini" className="data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue transition-all">
                Google Gemini API
              </TabsTrigger>
              <TabsTrigger value="deepseek" className="data-[state=active]:bg-neon-red/20 data-[state=active]:text-neon-red transition-all">
                DeepSeek API
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={primaryProvider}>
              <div className="space-y-6">
                
                {/* Nạp Bulk Key */}
                <div className="bg-secondary/20 p-5 rounded-xl border border-primary/10 space-y-4">
                   <Label className="flex items-center gap-2 text-primary uppercase tracking-wider text-xs font-bold">
                     <LayoutDashboard className="w-4 h-4" /> Nạp Hàng Loạt API Key Mới ({primaryProvider === 'gemini' ? 'AIza...' : 'sk-...'})
                   </Label>
                   <Textarea 
                     value={bulkKeys}
                     onChange={(e) => setBulkKeys(e.target.value)}
                     placeholder="Dán mã key vào đây. Mỗi mã nằm trên 1 dòng..." 
                     className="bg-black/50 font-mono min-h-[100px] border-primary/20 resize-none"
                   />
                   <div className="flex justify-end pt-2">
                     <Button onClick={() => handleAddBulk(primaryProvider)} disabled={!bulkKeys.trim()} className="btn-neon">
                       <Plus className="w-4 h-4 mr-2" /> 
                       Nạp Số Lượng Lớn
                     </Button>
                   </div>
                </div>

                {/* Danh Sách Keys */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Danh sách Key Hoạt Động ({currentProviderKeys.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleResetKeys(primaryProvider)} 
                        disabled={testing || currentProviderKeys.length === 0}
                        className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        Phục hồi Key
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleTestKeys(primaryProvider)} 
                        disabled={testing || currentProviderKeys.length === 0}
                        className="border-primary/20 text-xs"
                      >
                        {testing ? <Activity className="w-3 h-3 mr-2 animate-spin" /> : <ShieldCheck className="w-3 h-3 mr-2 text-green-500" />}
                        Test Toàn Bộ Key (Khuyên dùng)
                      </Button>
                    </div>
                  </div>
                  
                  {currentProviderKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-primary/20">
                      <ShieldAlert className="w-10 h-10 mb-3 opacity-30" />
                      <p>Không có dữ liệu Key. Xin hãy nạp Key mới!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentProviderKeys.map((key, idx) => (
                        <div key={key.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${key.isActive && !key.isInvalid ? 'border-primary/30 bg-primary/5 hover:bg-primary/10' : 'border-red-500/30 bg-red-500/5 opacity-75'}`}>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`rounded-full h-8 w-8 ${key.isActive ? 'text-primary hover:text-primary/80 hover:bg-primary/20' : 'text-muted-foreground bg-black/20'}`}
                              onClick={() => toggleKeyActivity(key.id)}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <div>
                              <div className="font-bold flex items-center gap-2 font-mono text-sm">
                                {String(idx + 1).padStart(2, '0')}. {key.key.substring(0, 8)}•••••••••••••••••{key.key.substring(key.key.length - 4)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {key.isInvalid ? (
                              <span className="flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
                                <XCircle className="w-3 h-3" /> Lỗi / Chết
                              </span>
                            ) : key.isActive ? (
                              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
                                <CheckCircle2 className="w-3 h-3" /> Connect
                              </span>
                            ) : null}
                            <div className="w-px h-5 bg-border mx-1"></div>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 flex-shrink-0" onClick={() => removeKey(key.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

        </div>

        <div className="shrink-0 flex justify-end mt-4 pt-4 border-t border-primary/10">
          <Button onClick={onClose} className="rounded-xl px-8 shadow-neon-blue">Xác Nhận Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
