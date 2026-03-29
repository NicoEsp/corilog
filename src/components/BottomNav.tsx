import { useState } from 'react';
import { Home, BookOpen, Flame, User, LogOut, Crown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const BottomNav = () => {
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { currentStreak } = useStreak();

  if (!user) return null;

  const isDiario = location.pathname === ROUTES.DIARIO;
  const isHome = location.pathname === ROUTES.HOME;

  const getRoleDisplay = () => {
    if (roleLoading) return '...';
    switch (role) {
      case 'superadmin': return 'SuperAdmin';
      case 'premium': return 'Premium';
      case 'free': return 'Free';
      default: return '';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'superadmin': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'premium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-sage-600 bg-sage-50 border-sage-200';
    }
  };

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'text-purple-600';
    if (currentStreak >= 7) return 'text-amber-500';
    if (currentStreak > 0) return 'text-rose-500';
    return 'text-sage-400';
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t border-sage-200/50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Inicio */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-manipulation min-w-[60px] ${
              isHome ? 'text-rose-600' : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            <Home className={`w-5 h-5 ${isHome ? 'fill-rose-600' : ''}`} />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          {/* Diario */}
          <button
            onClick={() => navigate(ROUTES.DIARIO)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-manipulation min-w-[60px] ${
              isDiario ? 'text-rose-600' : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${isDiario ? 'fill-rose-100 stroke-rose-600' : ''}`} />
            <span className="text-[10px] font-medium">Diario</span>
          </button>

          {/* Racha */}
          <button
            onClick={() => setAccountOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-manipulation min-w-[60px] text-sage-500"
          >
            <div className="relative">
              <Flame className={`w-5 h-5 ${getStreakColor()}`} />
              {currentStreak > 0 && (
                <span className={`absolute -top-1.5 -right-2 text-[9px] font-bold leading-none ${getStreakColor()}`}>
                  {currentStreak}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Racha</span>
          </button>

          {/* Cuenta */}
          <button
            onClick={() => setAccountOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-manipulation min-w-[60px] text-sage-500 hover:text-sage-700"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Cuenta</span>
          </button>
        </div>
      </nav>

      {/* Account Sheet */}
      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-sage-800">Mi cuenta</SheetTitle>
            <p className="text-sm text-sage-500 truncate">{user.email}</p>
          </SheetHeader>

          <div className="flex flex-col gap-3">
            {/* Plan badge */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${getRoleColor()}`}>
              <div className="flex items-center gap-2">
                {role === 'superadmin' && <Crown className="w-4 h-4" />}
                <span className="text-sm font-medium">Plan actual</span>
              </div>
              <span className="text-sm font-semibold">{getRoleDisplay()}</span>
            </div>

            {/* Streak summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-sage-50 border border-sage-200/50">
              <div className="flex items-center gap-2 text-sage-700">
                <Flame className={`w-4 h-4 ${getStreakColor()}`} />
                <span className="text-sm font-medium">Racha actual</span>
              </div>
              <span className={`text-sm font-bold ${getStreakColor()}`}>
                {currentStreak} {currentStreak === 1 ? 'día' : 'días'}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={async () => {
                setAccountOpen(false);
                await signOut();
              }}
              className="w-full border-sage-300 text-sage-600 hover:bg-sage-50 h-12 text-base justify-start mt-2"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar sesión
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
