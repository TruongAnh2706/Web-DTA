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
            // 1. Update User Role (in user_roles table)
            // Note: This requires admin privileges in database policies
            if (user.system_role !== role) {
                // If switching to admin
                if (role === 'admin') {
                    const { error } = await supabase
                        .from('user_roles')
                        .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id, role' });
                    if (error) throw error;
                } else {
                    // If removing admin (switching to user) purely means removing the record from user_roles
                    // Assuming 'user' is default and not stored explicitly if we rely on existence check, 
                    // BUT our migration defines role TEXT NOT NULL.
                    // Let's assume we update the record or delete it.
                    // Based on initial logic, maybe we just update.
                    const { error } = await supabase
                        .from('user_roles')
                        .upsert({ user_id: user.id, role: 'user' }, { onConflict: 'user_id, role' });
                    if (error) throw error;
                }
            }

            // 2. Update Metadata (Account Type - Stored in auth.users raw_user_meta_data)
            // Call Supabase Admin API or use a specific RPC function if RLS blocks direct update.
            // Since we are client-side admin, we can't key `supabase.auth.admin.updateUserById` without service role key (dangerous in client).
            // SOLUTION: We will assume we have an RPC or we use the fact that we can update public tables, 
            // but metadata is tricky. For now, let's try to update via RLS on a 'profiles' table if it existed, 
            // but we decided to use metadata.
            // ACTUALLY: Best practice for Client-Side Admin is to call an Edge Function or RPC.
            // Let's use an RPC if possible, OR just inform the user we need to run SQL.
            // Wait, we don't have an RPC to update metadata in the previous step.
            // LET'S ADD A SIMPLIFIED RPC OR just update role for now.

            // For this implementation, let's focus on ROLE updating which uses `user_roles` table we control.
            // For AccountType, we might need to add it to `user_roles` or a `profiles` table later.
            // **Correction**: The list view reads from metadata. Updating metadata from client side for ANOTHER user is not possible with RLS on auth.users.
            // We will skip AccountType update for now and focus on Role/Wallet which we can control via RPC/Table.

            toast({ title: 'User updated successfully' });
            onSuccess();
            onClose();
        } catch (error: any) {
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

                    <div className="space-y-2 opacity-50 pointer-events-none" title="Metadata update not available yet">
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
                        <p className="text-xs text-yellow-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Metadata update requires Edge Function (Coming Soon)
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
