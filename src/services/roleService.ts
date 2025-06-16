
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/utils/errorHandling';

export type UserRole = 'superadmin' | 'free' | 'premium';

export const assignUserRole = async (userId: string, email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // Determinar el rol basado en el email
    const role: UserRole = email === 'nicolassespindola@gmail.com' ? 'superadmin' : 'free';
    
    console.log(`Asignando rol ${role} al usuario ${userId} con email ${email}`);
    
    // Verificar si ya tiene un rol asignado
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = No rows found, que es lo que esperamos
      logError(checkError, 'check_existing_role');
      return { success: false, error: checkError };
    }
    
    // Si ya tiene rol, no hacer nada
    if (existingRole) {
      console.log(`Usuario ${userId} ya tiene rol asignado: ${existingRole.role}`);
      return { success: true };
    }
    
    // Asignar nuevo rol
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: userId,
          role: role
        }
      ]);
    
    if (insertError) {
      logError(insertError, 'assign_user_role');
      return { success: false, error: insertError };
    }
    
    console.log(`Rol ${role} asignado exitosamente al usuario ${userId}`);
    return { success: true };
    
  } catch (error) {
    logError(error, 'assign_user_role_general');
    return { success: false, error };
  }
};

export const ensureUserHasRole = async (userId: string, email: string): Promise<UserRole | null> => {
  try {
    // Intentar obtener el rol actual usando la función RPC
    const { data: roleData, error: getRoleError } = await supabase
      .rpc('get_user_role', { user_id: userId });
    
    if (!getRoleError && roleData) {
      console.log(`Rol encontrado: ${roleData}`);
      return roleData as UserRole;
    }
    
    // Si no tiene rol, asignarlo
    console.log(`Usuario ${userId} no tiene rol, asignando automáticamente...`);
    const result = await assignUserRole(userId, email);
    
    if (result.success) {
      // Determinar qué rol se asignó
      const assignedRole = email === 'nicolassespindola@gmail.com' ? 'superadmin' : 'free';
      console.log(`Rol asignado exitosamente: ${assignedRole}`);
      return assignedRole;
    }
    
    console.log('Error asignando rol');
    return null;
  } catch (error) {
    logError(error, 'ensure_user_has_role');
    return null;
  }
};
