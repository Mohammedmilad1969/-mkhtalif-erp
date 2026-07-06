import { create } from 'zustand';
import { User } from '@/types';
import { post as apiPost, get as apiGet } from '@/lib/api';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiPost<{ accessToken: string; user: Record<string, unknown> }>('/auth/login', { email, password });
          const apiUser = response.user;
          const permissions = (apiUser.permissions as string[]) || [];
          const mappedUser: User = {
            id: apiUser.id as string,
            email: apiUser.email as string,
            name: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
            role: ((apiUser.role as { code: string })?.code || 'admin') as User['role'],
            department: (apiUser.department as { name: string })?.name || (apiUser.departmentId as string),
            moduleAccess: (apiUser.moduleAccess as string[]) || [],
            avatar: apiUser.avatarUrl as string | undefined,
            permissions,
            isActive: apiUser.isActive as boolean,
            lastLogin: apiUser.lastLogin as string | undefined,
            createdAt: apiUser.createdAt as string,
            updatedAt: apiUser.updatedAt as string,
          };
          localStorage.setItem('mkhtalif_token', response.accessToken);
          localStorage.setItem('mkhtalif_user', JSON.stringify(mappedUser));
          set({
            user: mappedUser,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('mkhtalif_token');
        localStorage.removeItem('mkhtalif_user');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/auth/login';
      },

      fetchUser: async () => {
        try {
          const response = await apiGet<Record<string, unknown>>('/auth/me');
          const permissions = (response.permissions as string[]) || [];
          const mappedUser: User = {
            id: response.id as string,
            email: response.email as string,
            name: `${response.firstName || ''} ${response.lastName || ''}`.trim(),
            role: ((response.role as { code: string })?.code || 'admin') as User['role'],
            department: (response.department as { name: string })?.name || (response.departmentId as string),
            moduleAccess: (response.moduleAccess as string[]) || [],
            avatar: response.avatarUrl as string | undefined,
            permissions,
            isActive: response.isActive as boolean,
            lastLogin: response.lastLogin as string | undefined,
            createdAt: response.createdAt as string,
            updatedAt: response.updatedAt as string,
          };
          set({ user: mappedUser, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'mkhtalif_auth',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const token = localStorage.getItem('mkhtalif_token');
          const user = localStorage.getItem('mkhtalif_user');
          if (token && user) {
            return JSON.stringify({ state: { token, user: JSON.parse(user), isAuthenticated: true } });
          }
          return null;
        },
        setItem: (name, value) => {
          const parsed = JSON.parse(value);
          if (parsed.state.token) localStorage.setItem('mkhtalif_token', parsed.state.token);
          if (parsed.state.user) localStorage.setItem('mkhtalif_user', JSON.stringify(parsed.state.user));
        },
        removeItem: () => {
          localStorage.removeItem('mkhtalif_token');
          localStorage.removeItem('mkhtalif_user');
        },
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function usePermissions(): string[] {
  return useAuthStore((s) => s.user?.permissions || []);
}

export function can(permission: string): boolean {
  const perms = useAuthStore.getState().user?.permissions || [];
  return perms.includes(permission);
}
