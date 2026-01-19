import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Wallet, Shield, Star, DollarSign, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

export interface AdminUser {
    id: string;
    email: string;
    system_role: string; // Renamed from role
    balance: number;
    created_at: string;
    last_sign_in_at: string | null;
    account_type: string;
    subscription_level: string;
}

interface UserTableProps {
    users: AdminUser[];
    onEdit: (user: AdminUser) => void;
    onUpdateWallet: (user: AdminUser) => void;
    loading: boolean;
}

const UserTable = ({ users, onEdit, onUpdateWallet, loading }: UserTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search users by email or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-xl"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-primary/20 overflow-hidden bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-primary/5">
                            <TableHead>User Info</TableHead>
                            <TableHead>Role & Plan</TableHead>
                            <TableHead>Wallet Balance</TableHead>
                            <TableHead>Joined / Last Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading users...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{user.email}</span>
                                            <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]" title={user.id}>
                                                {user.id}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            <div className="flex gap-1">
                                                {user.system_role === 'admin' && <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Admin</Badge>}
                                                <Badge variant="outline" className="border-primary/20 text-xs">
                                                    {user.account_type || 'Free'}
                                                </Badge>
                                            </div>
                                            {user.subscription_level !== 'None' && (
                                                <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-500">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {user.subscription_level}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-green-500 flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            {user.balance?.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-muted-foreground">
                                            <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                                            <span>Last: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onUpdateWallet(user)}
                                                className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg"
                                                title="Update Wallet"
                                            >
                                                <Wallet className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(user)}
                                                className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredUsers.length} users
            </div>
        </div>
    );
};

export default UserTable;
