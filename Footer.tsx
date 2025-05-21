import { useState } from "react";
import { 
  ChevronDown, 
  LogOut, 
  User as UserIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const { currentUser, activeAccounts, switchAccount, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <footer className="h-14 border-t bg-background flex items-center justify-between px-4">
      <div className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Centsible
      </div>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={currentUser?.avatar ? `http://localhost:8000${currentUser?.avatar}` : ""} 
              />
              <AvatarFallback className="bg-centsible-100 text-centsible-700">
                {currentUser?.name ? getInitials(currentUser.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{currentUser?.name || "User"}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuGroup>
            {activeAccounts.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Switch Account
                </p>
                {activeAccounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    onSelect={() => {
                      if (!account.isActive) {
                        switchAccount(account.id);
                      }
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 ${
                      account.isActive ? "bg-accent" : ""
                    }`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={account.avatar} />
                      <AvatarFallback className="text-xs bg-centsible-100 text-centsible-700">
                        {getInitials(account.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{account.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                logout();
                setIsOpen(false);
              }}
              className="text-red-500 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </footer>
  );
};

export default Footer;