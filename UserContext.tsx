import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: {
    currency?: string;
    notifications?: {
      emailAlerts?: boolean;
      weeklyReport?: boolean;
      budgetAlerts?: boolean;
    };
  };
};

type ActiveAccount = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
};

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeAccounts: ActiveAccount[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;
  setCurrentUser: (user: User | ((prevUser: User | null) => User | null)) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeAccounts, setActiveAccounts] = useState<ActiveAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authApi.getUser();
        const userData = response.data;

        // Ensure full avatar URL
        if (userData.avatar && !userData.avatar.startsWith("http")) {
          userData.avatar = `http://localhost:8000${userData.avatar}`;
        }

        setCurrentUser(userData);
        setIsAuthenticated(true);

        // Fetch active accounts
        const accountsResponse = await authApi.getActiveAccounts();
        setActiveAccounts(accountsResponse.data);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  };

  checkAuth();
}, []);

  
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
  
      if (!response.data.token) {
        throw new Error("Login failed: No token received.");
      }
  
      // Step 1: Save the token
      localStorage.setItem("token", response.data.token);
  
      // Step 2: Fetch user details after login
      const userResponse = await authApi.getUser();
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
  
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userResponse.data.name}!`,
      });
  
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
    }
  };
  

  const register = async (email: string, password: string, name: string) => {
    console.log("Register function in context called:", { email, name });
    try {
      const response = await authApi.register({ email, password, name });
      localStorage.setItem("token", response.data.token);
      
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      
      // Set active accounts with just this new account
      setActiveAccounts([
        {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar,
          isActive: true,
        }
      ]);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      });
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Could not create your account. Please try again.",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      setCurrentUser(null);
      setIsAuthenticated(false);
      setActiveAccounts([]);
      toast({
        title: "Logout Successful",
        description: "You have been logged out successfully.",
      });
    }
  };

  const switchAccount = async (accountId: string) => {
    try {
      const response = await authApi.switchAccount(accountId);
  
      if (!response.data.token) {
        throw new Error("Account switch failed: No token received.");
      }
  
      localStorage.setItem("token", response.data.token);
  
      const userResponse = await authApi.getUser();
      setCurrentUser(userResponse.data);
  
      toast({
        title: "Account Switched",
        description: `You are now using ${userResponse.data.name}'s account.`,
      });
  
    } catch (error) {
      console.error("Account switch failed:", error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "Account Switch Failed",
        description: "Could not switch accounts. Please try again.",
      });
    }
  };
  

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        activeAccounts,
        loading,
        login,
        register,
        logout,
        switchAccount,
        setCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


// Removed duplicate checkAuth function as it is already defined inside useEffect in the UserProvider component.