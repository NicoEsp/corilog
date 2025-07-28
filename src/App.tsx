
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { queryClient } from "@/lib/queryClient";
import { Suspense, lazy } from "react";

// Lazy loading para componentes pesados
const Home = lazy(() => import("./pages/Home"));
const Diario = lazy(() => import("./pages/Diario"));
const Auth = lazy(() => import("./pages/Auth"));
const SharedMoment = lazy(() => import("./pages/SharedMoment"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componente de loading optimizado
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RoleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/shared/:token" element={<SharedMoment />} />
                <Route path="/home" element={<Home />} />
                <Route path="/diario" element={
                  <ProtectedRoute>
                    <Diario />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </RoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
