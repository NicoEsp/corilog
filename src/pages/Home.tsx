import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import UserStatsCard from '@/components/UserStatsCard';
import StreakCounter from '@/components/StreakCounter';
import { ROUTES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, BookOpen, Twitter, Linkedin, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleAddMoment = () => {
    navigate(ROUTES.DIARIO, { state: { showAddForm: true } });
  };

  const handleNavigateToAuth = (isLogin: boolean) => {
    navigate(ROUTES.AUTH, { state: { isLogin } });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with auth buttons */}
      <header className="w-full border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center gap-3">
            {/* Branding card */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
              <span className="text-sm text-muted-foreground">
                <span className="hidden sm:inline">Un producto por </span>
                <span className="font-medium text-foreground">NicoProducto</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/nicoproducto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/nicolas-espindola/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <StreakCounter />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(ROUTES.DIARIO)}
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Diario</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {user && (
          <div className="mb-8">
            <UserStatsCard />
          </div>
        )}
        
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