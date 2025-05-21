
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Sidebar from "@/components/layouts/Sidebar";
import Footer from "@/components/layouts/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthGuard from "@/components/auth/AuthGuard";

const AppLayout = () => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      navigate('/signin', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={false}>
        <div className="h-screen flex flex-col w-full">
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
          <Footer />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default AppLayout;