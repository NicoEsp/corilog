
import { useRole } from '@/contexts/RoleContext';

export type UserRole = 'superadmin' | 'free' | 'premium';

export const useUserRole = () => {
  return useRole();
};
