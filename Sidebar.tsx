
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  PiggyBank, 
  FileBarChart, 
  Settings,
  CreditCard,
  User
} from "lucide-react";
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/services/api";

const items = [
  {
    icon: Home,
    label: "Dashboard",
    path: "/dashboard",
    description: "Overview of your finances"
  },
  {
    icon: CreditCard,
    label: "Transactions",
    path: "/transactions",
    description: "View and manage your transactions"
  },
  {
    icon: PiggyBank,
    label: "Budgeting",
    path: "/budgeting",
    description: "Set and track your budgets"
  },
  {
    icon: FileBarChart,
    label: "Reports",
    path: "/reports",
    description: "Financial reports and analytics"
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    description: "Manage your account settings"
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser: user, loading } = useUser();
  const { state, setOpen } = useSidebar();
  
  // Set sidebar to collapsed by default
  React.useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <ShadSidebar 
      className="border-r group"
      collapsible="icon" // Use icon collapsible mode
    >
      <SidebarHeader className="flex h-14 items-center border-b px-4 pt-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-coral-500" />
          <span className="font-semibold text-lg">Centsible</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center gap-2",
                      location.pathname === item.path 
                        ? "bg-accent text-coral-500 hover:text-coral-500" 
                        : "hover:text-coral-500"
                    )}
                    tooltip={state === "collapsed" ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground hidden md:inline-block">
                        {item.description}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {!loading && user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-coral-500/10 text-coral-500">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name || "User"}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </ShadSidebar>
  );
};

export default Sidebar;