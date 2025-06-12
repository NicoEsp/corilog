
import { useState } from 'react';
import { Menu, X, LogOut, Share2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useSharedMomentsCount } from '@/hooks/useSharedMomentsCount';

interface MobileNavProps {
  onAddMoment: () => void;
}

const MobileNav = ({ onAddMoment }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { count: sharedMomentsCount, loading: loadingSharedCount } = useSharedMomentsCount();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleAddMoment = () => {
    onAddMoment();
    setIsOpen(false);
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
          <SheetTitle className="font-serif-elegant text-sage-800">
            Menú
          </SheetTitle>
          <p className="text-sm text-sage-600 handwritten">Opciones</p>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-6">
          <Button
            onClick={handleAddMoment}
            className="w-full bg-rose-400 hover:bg-rose-500 text-white justify-start h-12 text-base"
          >
            <Camera className="w-5 h-5 mr-3" />
            Nuevo momento
          </Button>

          <div className="flex items-center justify-between p-4 bg-sage-50/50 rounded-lg border border-sage-200/50">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-sage-600" />
              <span className="text-sage-700 font-medium">Compartidos</span>
            </div>
            <span className="text-sage-600 font-semibold">
              {loadingSharedCount ? '...' : sharedMomentsCount}
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
