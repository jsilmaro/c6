
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const { toast } = useToast();

  // Get the return URL from location state
  const from = location.state?.from || "/dashboard";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate(from);
    } catch (error) {
      console.error("Login error:", error);
      // Toast notification is handled in the login function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-centsible-600" />
              <span className="text-xl font-bold text-centsible-800">centsible</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-centsible-600 hover:text-centsible-700 font-medium">
              Sign Up
            </Link>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-centsible-600">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;