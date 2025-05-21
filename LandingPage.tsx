
import { useNavigate } from "react-router-dom";
import { ArrowRight, PiggyBank, Shield, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-centsible-600" />
            <span className="text-xl font-bold text-centsible-800">Centsible</span>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Take Control of Your <span className="gradient-text">Finances</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Centsible helps you track expenses, manage budgets, and reach your financial goals with ease.
          </p>
          <div className="flex gap-4 pt-4">
            <Button 
              size="lg" 
              className="gap-2" 
              onClick={() => navigate("/signup")}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-centsible-400 to-centsible-600 rounded-lg blur opacity-25"></div>
            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-feature">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Monthly Overview</h3>
                  <span className="text-sm text-muted-foreground">June 2023</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-centsible-50 rounded-lg">
                    <p className="text-sm text-centsible-600">Income</p>
                    <p className="text-2xl font-bold text-finance-income">$4,250</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-centsible-600">Expenses</p>
                    <p className="text-2xl font-bold text-finance-expense">$2,830</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Budget Status</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Housing</span>
                        <span>$800 / $1000</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-centsible-500 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Food</span>
                        <span>$350 / $400</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-centsible-500 rounded-full" style={{ width: "87.5%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Entertainment</span>
                        <span>$120 / $200</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-centsible-500 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-centsible-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features That Make a Difference</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed to help you make smarter financial decisions every day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-feature">
              <div className="h-12 w-12 bg-centsible-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-centsible-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
              <p className="text-muted-foreground">
                Easily log and categorize your expenses to see where your money is going.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-feature">
              <div className="h-12 w-12 bg-centsible-100 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="h-6 w-6 text-centsible-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Management</h3>
              <p className="text-muted-foreground">
                Set budgets for different categories and track your progress in real-time.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-feature">
              <div className="h-12 w-12 bg-centsible-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-centsible-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Accounts</h3>
              <p className="text-muted-foreground">
                Switch seamlessly between multiple accounts with industry-leading security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start Your Financial Journey Today</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who have transformed their financial habits with centsible.
          </p>
          <Button 
            size="lg" 
            className="gap-2" 
            onClick={() => navigate("/signup")}
          >
            Get Started for Free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-centsible-600" />
              <span className="font-semibold">centsible</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} centsible. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;