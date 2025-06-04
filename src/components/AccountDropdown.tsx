
import React from 'react';
import { User, Calendar, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AccountDropdown = () => {
  const { user } = useAuth();

  if (!user) return null;

  // For now, we'll use placeholder data for invitation info
  // This would come from user_profiles table in a real implementation
  const memberSince = user.created_at ? new Date(user.created_at) : new Date();
  const formattedDate = format(memberSince, "d 'de' MMMM, yyyy", { locale: es });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-sage-600 hover:text-sage-800 hover:bg-sage-50"
        >
          <User className="w-4 h-4 mr-2" />
          Mi cuenta
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white border border-sage-200 shadow-lg">
        <DropdownMenuLabel className="font-serif-elegant text-sage-800">
          Información de cuenta
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-2 p-3 cursor-default">
          <Mail className="w-4 h-4 text-sage-500" />
          <div>
            <p className="text-sm font-medium text-sage-800">{user.email}</p>
            <p className="text-xs text-sage-500">Email principal</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2 p-3 cursor-default">
          <Calendar className="w-4 h-4 text-sage-500" />
          <div>
            <p className="text-sm font-medium text-sage-800">Miembro desde</p>
            <p className="text-xs text-sage-500">{formattedDate}</p>
          </div>
        </DropdownMenuItem>
        
        {/* Placeholder for invitation info - would be populated from database */}
        <DropdownMenuItem className="flex items-center gap-2 p-3 cursor-default opacity-50">
          <User className="w-4 h-4 text-sage-500" />
          <div>
            <p className="text-sm font-medium text-sage-800">Invitado por</p>
            <p className="text-xs text-sage-500">No disponible</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
