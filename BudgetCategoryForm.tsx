import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetApi } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Amount must be a positive number",
  }),
  period: z.string(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetCategoryFormProps {
  onClose: () => void;
  onSave: () => void;
  period: string;
}

const categories = [
  { value: "housing", label: "Housing" },
  { value: "food", label: "Food" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "health", label: "Health" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment" },
  { value: "gift", label: "Gift" },
  { value: "other", label: "Other" }
];

const BudgetCategoryForm = ({ onClose, onSave, period }: BudgetCategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      amount: "",
      period: period,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: BudgetFormValues) => {
    setIsSubmitting(true);
    try {
      const today = new Date();
      let endDate = new Date();

      if (values.period === 'monthly') {
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else if (values.period === 'quarterly') {
        endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
      } else if (values.period === 'annual') {
        endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      }

      const response = await budgetApi.create({
        category: values.category,
        amount: parseFloat(values.amount),
        period: values.period,
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      if (response.status === 201) {
        onSave();
        onClose();
      } else {
        throw new Error('Failed to create budget');
      }
    } catch (error) {
      console.error("Failed to create budget:", error);
      toast.error("Failed to create budget", {
        description: "There was an issue saving your budget. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetCategoryForm;