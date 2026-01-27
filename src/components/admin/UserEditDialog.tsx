import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import { AdminUser } from './UserTable';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserEditDialogProps {
    user: AdminUser | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserEditDialog = ({ user, isOpen, onClose, onSuccess }: UserEditDialogProps) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Form states
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [accountType, setAccountType] = useState('Free');

    useEffect(() => {
        if (user) {
            setRole((user.system_role as 'admin' | 'user') || 'user');
            setAccountType(user.account_type || 'Free');
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Update User Role
            if (user.system_role !== role) {
                const { error } = await supabase
                    .from('user_roles')
                    .upsert({ user_id: user.id, role: role }, { onConflict: 'user_id, role' });
                
                if (error) throw error;
            }

            // 2. Update Metadata (Account Type - using RPC)
            // Note: Requires admin_update_user_metadata RPC function in database
            if (user.account_type !== accountType) {
                const { error: rpcError } = await supabase.rpc('admin_update_user_metadata', {
                    target_user_id: user.id,
                    new_metadata: { account_type: accountType }
                });

                if (rpcError) throw new Error(`Metadata Update Failed: ${rpcError.message}`);
            }

            // 3. Sync to Google Sheets
            // We sync if there are any changes to role or account type
            if (user.system_role !== role || user.account_type !== accountType) {
                // Import dynamically to avoid circular dependencies if any, 
                // but standard import is fine. We will use the imported function.
                const { updateUserInSheet } = await import('@/utils/googleSheets');
                
                // Preparing data for sync
                // Note: user.subscription_level is not edited here yet, so we keep old value
                await updateUserInSheet({
                   email: user.email,
                   account_type: accountType as any,
                   // If we had subscription level editing, we would pass it too
                   // ensuring accurate sync
                });
            }

            toast({ title: 'User updated successfully' });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update failed:', error);
            toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>{user?.email}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>System Role</Label>
                        <Select value={role} onValueChange={(val: 'admin' | 'user') => setRole(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Admins have full access to dashboard and database.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Account Type (Plan)</Label>
                        <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Free">Free</SelectItem>
                                <SelectItem value="VIP1">VIP1</SelectItem>
                                <SelectItem value="VIP2">VIP2</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Sets the user's plan level.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="btn-neon">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface WalletDialogProps {
    user: AdminUser | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const WalletUpdateDialog = ({ user, isOpen, onClose, onSuccess }: WalletDialogProps) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Admin adjustment');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleTransaction = async (type: 'deposit' | 'withdraw') => {
        if (!user || !amount) return;
        setLoading(true);

        const val = parseFloat(amount);
        const finalAmount = type === 'deposit' ? val : -val;

        try {
            // @ts-ignore
            const { data, error } = await supabase.rpc('admin_update_wallet', {
                target_user_id: user.id,
                amount_change: finalAmount,
                description: description
            });

            if (error) throw error;

            toast({ title: 'Transaction successful', description: `Wallet updated by ${finalAmount}$` });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({ title: 'Transaction failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Wallet Balance</DialogTitle>
                    <DialogDescription>
                        User: {user?.email} <br />
                        Current Balance: <span className="font-bold text-green-500">${user?.balance?.toLocaleString()}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-9"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Reason for adjustment..."
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    <Button
                        variant="destructive"
                        onClick={() => handleTransaction('withdraw')}
                        disabled={loading || !amount}
                        className="flex-1"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw (-)'}
                    </Button>
                    <Button
                        onClick={() => handleTransaction('deposit')}
                        disabled={loading || !amount}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deposit (+)'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UserEditDialog;
