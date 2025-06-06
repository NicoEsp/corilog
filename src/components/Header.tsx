import { Camera, LogOut, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AccountDropdown from './AccountDropdown';
import { useSharedMomentsCount } from '@/hooks/useSharedMomentsCount';
interface HeaderProps {
  onAddMoment: () => void;
}
const Header = ({
  onAddMoment
}: HeaderProps) => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    count: sharedMomentsCount,
    loading: loadingSharedCount
  } = useSharedMomentsCount();
  const handleSignOut = async () => {
    await signOut();
  };
  return <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-sage-200/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif-elegant text-sage-800 mb-1">
            Corilog
          </h1>
          <p className="text-sm text-sage-600 handwritten">Tu diario privado digital</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user && <Button variant="outline" size="sm" className="border-sage-300 text-sage-600 hover:bg-sage-50 bg-sage-50/50" disabled>
              <Share2 className="w-4 h-4 mr-2" />
              {loadingSharedCount ? '...' : sharedMomentsCount} compartidos
            </Button>}
          
          {user && <AccountDropdown />}
          
          <Button onClick={onAddMoment} className="bg-rose-400 hover:bg-rose-500 text-white shadow-sm transition-all duration-200 hover:scale-105" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Nuevo momento
          </Button>

          {user && <Button variant="outline" size="sm" onClick={handleSignOut} className="border-sage-300 text-sage-600 hover:bg-sage-50">
              <LogOut className="w-4 h-4" />
            </Button>}
        </div>
      </div>
    </header>;
};
export default Header;