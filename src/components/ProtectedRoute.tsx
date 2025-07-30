
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-sage-600 handwritten">Cargando...</p>
        </div>
      </div>
    );
  }

  // Pequeño delay antes de redirigir para evitar conflictos con OAuth
  if (!user) {
    setTimeout(() => {
      if (!user) return;
    }, 100);
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
