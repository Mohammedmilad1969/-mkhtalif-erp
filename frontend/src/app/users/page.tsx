'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import DataTable from '@/components/tables/data-table';
import { useUsers, useRoles, useCreateUser, useUpdateUser, useDeactivateUser } from '@/hooks/useApi';
import { User } from '@/types';
import { MODULE_GROUPS } from '@/lib/modules';
import { Plus, Search, MoreHorizontal, Edit, UserX, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
    moduleAccess: [] as string[],
    isActive: true,
  });

  const { toast } = useToast();
  const { data, isLoading } = useUsers({ search, roleId: roleFilter === 'all' ? '' : roleFilter });
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  const users = data?.data || [];

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', phone: '', roleId: '', moduleAccess: [], isActive: true });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setForm({
      firstName: u.name.split(' ')[0] || '',
      lastName: u.name.split(' ').slice(1).join(' ') || '',
      email: u.email,
      password: '',
      phone: '',
      roleId: roles?.find((r) => r.code.toUpperCase() === u.role)?.id || '',
      moduleAccess: u.moduleAccess || [],
      isActive: u.isActive,
    });
    setEditingUser(u);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        };
        if (form.phone) payload.phone = form.phone;
        if (form.roleId) payload.roleId = form.roleId;
        payload.isActive = form.isActive;
        if (form.password) payload.password = form.password;
        if (form.moduleAccess.length > 0) payload.moduleAccess = form.moduleAccess;
        await updateUser.mutateAsync({ id: editingUser.id, data: payload });
        toast({ title: 'User updated', description: 'User has been updated successfully' });
      } else {
        const payload: Record<string, unknown> = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        };
        if (form.phone) payload.phone = form.phone;
        if (form.roleId) payload.roleId = form.roleId;
        payload.isActive = form.isActive;
        if (form.moduleAccess.length > 0) payload.moduleAccess = form.moduleAccess;
        await createUser.mutateAsync(payload);
        toast({ title: 'User created', description: 'User has been created successfully' });
      }
      setIsCreateOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error', description: err?.response?.data?.message || 'Operation failed', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      if (u.isActive) {
        await deactivateUser.mutateAsync(u.id);
        toast({ title: 'User deactivated', description: `${u.name} has been deactivated` });
      } else {
        await updateUser.mutateAsync({ id: u.id, data: { isActive: true } });
        toast({ title: 'User activated', description: `${u.name} has been activated` });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Operation failed', variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (u: User) => <span className="font-medium">{u.name}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (u: User) => u.email,
    },
    {
      key: 'role',
      label: 'Role',
      render: (u: User) => (
        <Badge variant="secondary" className="capitalize">
          {u.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'department',
      label: 'Module Access',
      render: (u: User) => {
        const modules = u.moduleAccess || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {modules.length > 0
              ? modules.slice(0, 3).map((m) => (
                  <Badge key={m} variant="outline" className="text-xs">
                    {MODULE_GROUPS.flatMap((g) => g.modules).find((mod) => mod.key === m)?.label || m}
                  </Badge>
                ))
              : <span className="text-xs text-muted-foreground">All modules</span>}
            {modules.length > 3 && (
              <Badge variant="outline" className="text-xs">+{modules.length - 3}</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (u: User) => (
        <Badge variant={u.isActive ? 'success' : 'secondary'}>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (u: User) => u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
    },
    {
      key: 'actions',
      label: '',
      render: (u: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { handleOpenEdit(u); setIsCreateOpen(true); }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handleToggleActive(u)}>
              <UserX className="mr-2 h-4 w-4" />
              {u.isActive ? 'Disable' : 'Enable'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setEditingUser(null); }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user details and permissions' : 'Add a new user to the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
                  </Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? 'New password' : 'Password'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+966 5X XXX XXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                  <Label className="text-xs">Module Access</Label>
                  <div className="border rounded-md p-2 max-h-[180px] overflow-y-auto space-y-2">
                    {MODULE_GROUPS.map((group) => (
                      <div key={group.group}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{group.label}</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {group.modules.map((mod) => (
                            <label key={mod.key} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-muted rounded px-1 py-0.5">
                              <Checkbox
                                checked={form.moduleAccess.includes(mod.key)}
                                onCheckedChange={(checked) => {
                                  setForm({
                                    ...form,
                                    moduleAccess: checked
                                      ? [...form.moduleAccess, mod.key]
                                      : form.moduleAccess.filter((k) => k !== mod.key),
                                  });
                                }}
                              />
                              {mod.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              {editingUser && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="isActive">Active</Label>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingUser(null); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={createUser.isPending || updateUser.isPending}>
                {(createUser.isPending || updateUser.isPending) ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles?.map((r) => (
              <SelectItem key={r.id} value={r.id} className="capitalize">{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={users}
            loading={isLoading}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
