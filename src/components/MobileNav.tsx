
import { useState } from 'react';
import { Menu, X, LogOut, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-sage-200 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-sage-200">
                <div>
                  <h2 className="font-serif-elegant text-lg text-sage-800">Menu</h2>
                  <p className="text-sm text-sage-600 handwritten">Opciones</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-4 space-y-4">
                <Button
                  onClick={handleAddMoment}
                  className="w-full bg-rose-400 hover:bg-rose-500 text-white justify-start h-12 text-base"
                >
                  <Menu className="w-5 h-5 mr-3" />
                  Nuevo momento
                </Button>

                <div className="flex items-center justify-between p-3 bg-sage-50/50 rounded-lg border border-sage-200/50">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-sage-600" />
                    <span className="text-sage-700 font-medium">Compartidos</span>
                  </div>
                  <span className="text-sage-600 font-semibold">
                    {loadingSharedCount ? '...' : sharedMomentsCount}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-sage-200">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-sage-300 text-sage-600 hover:bg-sage-50 justify-start h-12 text-base"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
