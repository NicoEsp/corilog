
import { Camera, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import AccountDropdown from './AccountDropdown';
import MobileNav from './MobileNav';
import ReconnectionBanner from './ReconnectionBanner';

interface HeaderProps {
  onAddMoment: () => void;
}

const Header = ({ onAddMoment }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading } = useRole();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleDisplay = () => {
    if (roleLoading) return '...';
    switch (role) {
      case 'superadmin':
        return 'SuperAdmin';
      case 'premium':
        return 'Premium';
      case 'free':
        return 'Free';
      default:
        return '';
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

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-sage-200/50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo - Responsive sizing */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-sage-800 mb-0 sm:mb-1">
              Corilog
            </h1>
            <p className="text-xs sm:text-sm text-sage-600 font-medium hidden sm:block">
              Tu diario privado digital
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user && role && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
                {getRoleDisplay()}
              </div>
            )}
            
            {user && <AccountDropdown />}
            
            <Button 
              onClick={onAddMoment} 
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all duration-200 hover:scale-105" 
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nuevo momento</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>

            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut} 
                className="border-sage-300 text-sage-600 hover:bg-sage-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              onClick={onAddMoment} 
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm" 
              size="sm"
            >
              <Camera className="w-4 h-4 mr-1" />
              <span className="text-sm">Nuevo</span>
            </Button>
            
            <MobileNav onAddMoment={onAddMoment} />
          </div>
        </div>
      </header>
      
      {/* Banner de reconexión fuera del header sticky */}
      <ReconnectionBanner />
    </>
  );
};

export default Header;
