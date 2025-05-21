import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, User, CreditCard, Globe, Lock, DollarSign } from "lucide-react";

const handleAvatarRemove = async (user: { name?: string | null }) => {
  try {
    const formData = new FormData();
    formData.set("name", user?.name || "");
    formData.set("avatar", "");
    await authApi.updateProfile(formData);
    toast.success("Avatar removed successfully");
  } catch (error) {
    toast.error("Failed to remove avatar");
  }
};

// Form validation schemas
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const preferencesFormSchema = z.object({
  notifications: z.object({
    emailAlerts: z.boolean(),
    weeklyReport: z.boolean(),
    budgetAlerts: z.boolean(),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

const currencies = [
  { label: "Peso", value: "PHP" },
];

const Settings = () => {
  const { currentUser: user, loading, setCurrentUser } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      notifications: {
        emailAlerts: user?.preferences?.notifications?.emailAlerts || true,
        weeklyReport: user?.preferences?.notifications?.weeklyReport || false,
        budgetAlerts: user?.preferences?.notifications?.budgetAlerts || true,
      },
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.set('email', data.email);
      formData.set('name', data.name);
      if (avatarFile) {
        formData.set('avatar', avatarFile);
      }

      const response = await authApi.updateProfile(formData);

      if (response.data) {
        // Update with complete server response including avatar URL
        const userData = response.data;
        if (userData.avatar && !userData.avatar.startsWith('http')) {
          userData.avatar = `http://localhost:8000${userData.avatar}`;
        }
        setCurrentUser(userData);
        
        // Force reload user data
        const userResponse = await authApi.getUser();
        if (userResponse.data) {
          const updatedUserData = userResponse.data;
          if (updatedUserData.avatar && !updatedUserData.avatar.startsWith('http')) {
            updatedUserData.avatar = `http://localhost:8000${updatedUserData.avatar}`;
          }
          setCurrentUser(updatedUserData);
        }
      }

      toast.success("Profile updated successfully!");
      setAvatarFile(null); // Reset avatar file after successful update
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile, please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

const fetchUserData = async () => {
  try {
    const response = await authApi.getUser();

    // ✅ Directly update `currentUser` using your context
    if (user) {
      Object.assign(user, response.data); // Update user data safely
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};





  const onSecuritySubmit = async (data: SecurityFormValues) => {
  setIsUpdating(true);
  try {
    await authApi.changePassword({
      current_password: data.currentPassword,
      new_password: data.newPassword,
    });
    toast.success("Password updated successfully");
  } catch (error) {
    console.error("Failed to update password:", error);
    toast.error("Check your current password and try again.");
  } finally {
    setIsUpdating(false);
  }
};

 const onPreferencesSubmit = async (data: PreferencesFormValues) => {
 setIsUpdating(true);
  try {
    await authApi.updatePreferences({ preferences: data });
    toast.success("Preferences updated successfully");
  } catch (error) {
    console.error("Failed to update preferences:", error);
    toast.error("Check your settings and try again.");
  } finally {
    setIsUpdating(false);
  }
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  setAvatarFile(file);
  console.log("Selected file:", file); // ✅ Debugging log
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={user?.avatar ? `http://localhost:8000${user?.avatar}` : ""} 
                    alt={user?.name || "User"} 
                  />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
  <h4 className="text-sm font-medium">Profile Picture</h4>
  <div className="flex gap-2">
    <input
      type="file"
      accept="image/*"
      className="hidden"
      id="avatarUpload"
      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} // ✅ Captures selected file
    />
    <Button size="sm" variant="outline" onClick={() => document.getElementById("avatarUpload")?.click()}>
      Upload
    </Button>
    <Button size="sm" variant="outline" onClick={() => handleAvatarRemove(user)}>
      Remove
    </Button>
  </div>
</div>
</div>
              <Separator />

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Change your password and manage security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;