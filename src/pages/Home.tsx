import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import { ROUTES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handleAddMoment = () => {
    navigate(ROUTES.DIARIO, { state: { showAddForm: true } });
  };

  const handleNavigateToAuth = (isLogin: boolean) => {
    navigate(ROUTES.AUTH, { state: { isLogin } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with auth buttons */}
      <header className="w-full border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-end items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateToAuth(false)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Regístrate</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleNavigateToAuth(true)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Ingresa</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <WelcomeScreen 
          onAddMoment={handleAddMoment}
          isCreating={false}
          onNavigateToAuth={handleNavigateToAuth}
        />
      </main>
    </div>
  );
};

export default Home;