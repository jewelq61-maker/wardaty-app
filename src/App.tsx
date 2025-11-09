import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import '@/lib/i18n';
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Stats from "./pages/Stats";
import Articles from "./pages/Articles";
import Profile from "./pages/Profile";
import FastingQada from "./pages/FastingQada";
import BeautyPlanner from "./pages/BeautyPlanner";
import Welcome from "./pages/Onboarding/Welcome";
import Persona from "./pages/Onboarding/Persona";
import Language from "./pages/Onboarding/Language";
import CycleSetup from "./pages/Onboarding/CycleSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">{/* Loading spinner */}</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/onboarding/welcome" element={<Welcome />} />
              <Route path="/onboarding/persona" element={<Persona />} />
              <Route path="/onboarding/language" element={<Language />} />
              <Route path="/onboarding/cycle-setup" element={<CycleSetup />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/fasting-qada" element={<ProtectedRoute><FastingQada /></ProtectedRoute>} />
              <Route path="/beauty" element={<ProtectedRoute><BeautyPlanner /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
