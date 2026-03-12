import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChecklistProvider } from "@/context/ChecklistContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipNav } from "@/components/SkipNav";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MyRequests from "./pages/MyRequests";
import ChecklistItemDetail from "./pages/ChecklistItemDetail";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminTemplates from "./pages/AdminTemplates";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChecklistProvider>
          <SkipNav />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/requests" element={<MyRequests />} />
              <Route path="/item/:id" element={<ChecklistItemDetail />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/admin" element={<AdminTemplates />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ChecklistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
