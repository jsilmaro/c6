
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();

  if (loading) {
    // You can replace this with a loading spinner
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;