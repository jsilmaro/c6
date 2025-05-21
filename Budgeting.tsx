import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";
import { budgetApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BudgetCategoryForm from "@/components/budgeting/BudgetCategoryForm";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  start_date: string;
  end_date: string;
}

const Budgeting = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Get budgets and their spent amounts from the backend
  const { data: budgets, isLoading, error, refetch } = useQuery({
    queryKey: ["budgets", selectedPeriod],
    queryFn: async () => {
      try {
        const response = await budgetApi.getAll();
        return response.data.filter((budget: Budget) => budget.period === selectedPeriod);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load budgets", {
        description: "Please try again later"
      });
    }
  }, [error]);

  const handleBudgetSaved = () => {
    setShowForm(false);
    refetch();
    toast.success("Budget saved successfully");
  };

  const renderProgressBar = (budget: Budget) => {
    const percentage = Math.min(Math.round((budget.spent / budget.amount) * 100), 100);
    const isOverBudget = budget.spent > budget.amount;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>${Number(budget.spent).toFixed(2)} spent</span>
          <span>${Number(budget.amount).toFixed(2)} budgeted</span>
        </div>
        <div className="relative">
          <Progress 
            value={percentage} 
            className={`h-2 ${
              isOverBudget 
                ? "bg-red-100 dark:bg-red-950 [&>[data-progress]]:bg-red-500" 
                : percentage > 80 
                ? "bg-yellow-100 dark:bg-yellow-950 [&>[data-progress]]:bg-yellow-500" 
                : "bg-green-100 dark:bg-green-950 [&>[data-progress]]:bg-green-500"
            }`}
          />
          {isOverBudget && (
            <div className="absolute top-0 right-0 -mt-1 text-destructive flex items-center gap-1 text-xs">
              <AlertTriangle size={14} />
              <span>Over budget</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getCategoryDisplayName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgeting</h1>
          <p className="text-muted-foreground">
            Manage your monthly budgets and track your spending.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Budget
        </Button>
      </div>

      <Tabs defaultValue="monthly" onValueChange={setSelectedPeriod}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50" />
              <CardContent className="h-24 bg-muted/30" />
            </Card>
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget: Budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle>{getCategoryDisplayName(budget.category)}</CardTitle>
                <CardDescription>
                  {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderProgressBar(budget)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Budgets Set</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven't set any budgets yet. Click the "New Budget" button to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <BudgetCategoryForm 
          onClose={() => setShowForm(false)}
          onSave={handleBudgetSaved}
          period={selectedPeriod}
        />
      )}
    </div>
  );
};

export default Budgeting;