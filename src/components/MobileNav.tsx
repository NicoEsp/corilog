
import { useState } from 'react';
import { Menu, LogOut, Camera, Crown, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import StreakCounter from './StreakCounter';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface MobileNavProps {
  onAddMoment: () => void;
}

const MobileNav = ({ onAddMoment }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleAddMoment = () => {
    onAddMoment();
    setIsOpen(false);
  };

  const handleGoHome = () => {
    navigate(ROUTES.HOME);
    setIsOpen(false);
  };

  const getRoleDisplay = () => {
    if (roleLoading) return 'Cargando...';
    switch (role) {
      case 'superadmin':
        return 'SuperAdmin';
      case 'premium':
        return 'Premium';
      case 'free':
        return 'Free';
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'superadmin':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'premium':
        return 'text-gold-600 bg-gold-50 border-gold-200';
      case 'free':
        return 'text-sage-600 bg-sage-50 border-sage-200';
      default:
        return 'text-sage-600 bg-sage-50 border-sage-200';
    }
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="text-left">
          <SheetTitle className="font-semibold text-sage-800">
            Menú
          </SheetTitle>
          <p className="text-sm text-sage-600 font-medium">Opciones</p>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex justify-center">
            <StreakCounter />
          </div>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-sage-300 text-sage-600 hover:bg-sage-50 justify-start h-12 text-base"
          >
            <Home className="w-5 h-5 mr-3" />
            Ir a Inicio
          </Button>
          
          <Button
            onClick={handleAddMoment}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white justify-start h-12 text-base"
          >
            <Camera className="w-5 h-5 mr-3" />
            Nuevo momento
          </Button>

          <div className={`flex items-center justify-between p-4 rounded-lg border ${getRoleColor()}`}>
            <div className="flex items-center gap-3">
              {role === 'superadmin' && <Crown className="w-5 h-5" />}
              <span className="font-medium">Plan actual</span>
            </div>
            <span className="font-semibold">
              {getRoleDisplay()}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full border-sage-300 text-sage-600 hover:bg-sage-50 justify-start h-12 text-base mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
