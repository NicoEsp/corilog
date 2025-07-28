import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import { ROUTES } from '@/config/constants';

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