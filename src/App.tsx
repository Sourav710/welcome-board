import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChecklistProvider } from "@/context/ChecklistContext";
import { AuditLogProvider } from "@/context/AuditLogContext";
import { NotesProvider } from "@/context/NotesContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipNav } from "@/components/SkipNav";
import { SessionTimeoutProvider } from "@/components/SessionTimeout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
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
          <AuditLogProvider>
          <NotesProvider>
            <SkipNav />
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <SessionTimeoutProvider>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<EmployeeDashboard />} />
                  <Route path="/requests" element={<MyRequests />} />
                  <Route path="/item/:id" element={<ChecklistItemDetail />} />
                  <Route path="/manager" element={<ManagerDashboard />} />
                  <Route path="/admin" element={<AdminTemplates />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SessionTimeoutProvider>
            </BrowserRouter>
          </NotesProvider>
          </AuditLogProvider>
        </ChecklistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
