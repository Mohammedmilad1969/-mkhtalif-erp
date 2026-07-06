'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers, useUpdateUser } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { MODULE_GROUPS } from '@/lib/modules';
import { User } from '@/types';
import { Shield, Save, Loader2, Users } from 'lucide-react';

export default function PermissionsPage() {
  const { data, isLoading: loadingUsers } = useUsers();
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const users = data?.data || [];
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [moduleAccess, setModuleAccess] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSelectUser = (u: User) => {
    setSelectedUserId(u.id);
    setModuleAccess(new Set(u.moduleAccess || []));
    setDirty(false);
  };

  const toggleModule = (key: string) => {
    setModuleAccess((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setDirty(true);
  };

  const toggleGroup = (groupKeys: string[], enabled: boolean) => {
    setModuleAccess((prev) => {
      const next = new Set(prev);
      for (const k of groupKeys) {
        if (enabled) next.add(k);
        else next.delete(k);
      }
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    try {
      await updateUser.mutateAsync({
        id: selectedUserId,
        data: { moduleAccess: Array.from(moduleAccess) },
      });
      toast({ title: 'Module access updated', description: `Updated modules for ${selectedUser?.name}` });
      setDirty(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to save', variant: 'destructive' });
    }
  };

  const isGroupFullyEnabled = (groupKeys: string[]) => groupKeys.every((k) => moduleAccess.has(k));
  const isGroupPartiallyEnabled = (groupKeys: string[]) => groupKeys.some((k) => moduleAccess.has(k)) && !isGroupFullyEnabled(groupKeys);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">User Module Access</h1>
            <p className="text-sm text-muted-foreground">Manage which modules each user can access</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Label className="text-sm font-medium mr-1">User:</Label>
        {loadingUsers ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          users.map((u) => (
            <Button
              key={u.id}
              variant={selectedUserId === u.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSelectUser(u)}
              className="capitalize"
            >
              <Avatar className="h-5 w-5 mr-1.5">
                <AvatarFallback className="text-[10px]">
                  {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {u.name}
            </Button>
          ))
        )}
      </div>

      <Separator />

      {!selectedUserId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a user to manage modules</p>
            <p className="text-sm">Choose a user above to view and toggle their module access</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MODULE_GROUPS.map((group) => {
              const groupKeys = group.modules.map((m) => m.key);
              return (
                <Card key={group.group} className="overflow-hidden">
                  <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
                    <span className="text-sm font-semibold uppercase tracking-wider">{group.label}</span>
                    <Checkbox
                      checked={isGroupFullyEnabled(groupKeys)}
                      onCheckedChange={(checked) => toggleGroup(groupKeys, !!checked)}
                      aria-label={`Toggle all ${group.label}`}
                    />
                  </div>
                  <div className="divide-y">
                    {group.modules.map((mod) => (
                      <label
                        key={mod.key}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 cursor-pointer text-sm transition-colors"
                      >
                        <Checkbox
                          checked={moduleAccess.has(mod.key)}
                          onCheckedChange={() => toggleModule(mod.key)}
                        />
                        <span>{mod.label}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-muted/20 rounded-lg p-4 border">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedUser?.name}</span> —{' '}
              {moduleAccess.size === 0 ? 'No module restrictions (all modules accessible)' : `${moduleAccess.size} module${moduleAccess.size !== 1 ? 's' : ''} restricted`}
            </div>
            <Button onClick={handleSave} disabled={updateUser.isPending || !dirty}>
              {updateUser.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
