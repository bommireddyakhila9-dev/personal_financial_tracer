import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import DashboardPage from "@/pages/DashboardPage";
import ExpensesPage from "@/pages/ExpensesPage";
import IncomePage from "@/pages/IncomePage";
import BudgetsPage from "@/pages/BudgetsPage";
import SavingsPage from "@/pages/SavingsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import HealthScorePage from "@/pages/HealthScorePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Navigate to="/sign-in" replace />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
            <Route path="/expenses" element={<ProtectedLayout><ExpensesPage /></ProtectedLayout>} />
            <Route path="/income" element={<ProtectedLayout><IncomePage /></ProtectedLayout>} />
            <Route path="/budgets" element={<ProtectedLayout><BudgetsPage /></ProtectedLayout>} />
            <Route path="/savings" element={<ProtectedLayout><SavingsPage /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>} />
            <Route path="/health" element={<ProtectedLayout><HealthScorePage /></ProtectedLayout>} />
            <Route path="*" element={<ProtectedLayout><NotFound /></ProtectedLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
