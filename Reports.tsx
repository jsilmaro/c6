import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  DownloadIcon, 
  PieChart, 
  BarChart, 
  LineChart,
  ArrowUpIcon,
  ArrowDownIcon,
  Wallet
} from "lucide-react";
import { format } from "date-fns";
import { reportsApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

const formatCurrency = (amount: number) => {
  return `₱${amount.toFixed(2)}`;
};

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)),
    to: new Date()
  });
  
  const [activeChart, setActiveChart] = useState("spending");

  const formatDate = (date: Date) => format(date, "yyyy-MM-dd");
  
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["spending-by-category", formatDate(dateRange.from), formatDate(dateRange.to)],
    queryFn: () => reportsApi.getSpendingByCategory({
      start_date: formatDate(dateRange.from),
      end_date: formatDate(dateRange.to)
    }).then(res => res.data),
  });
  
  const { data: timeData, isLoading: timeLoading } = useQuery({
    queryKey: ["spending-over-time", formatDate(dateRange.from), formatDate(dateRange.to)],
    queryFn: () => reportsApi.getSpendingOverTime({
      start_date: formatDate(dateRange.from),
      end_date: formatDate(dateRange.to)
    }).then(res => res.data),
  });

  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ["income-by-category", formatDate(dateRange.from), formatDate(dateRange.to)],
    queryFn: () => reportsApi.getIncomeByCategory({
      start_date: formatDate(dateRange.from),
      end_date: formatDate(dateRange.to)
    }).then(res => res.data),
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (!dateRange.from || !dateRange.to) {
        toast.error("Please select a date range first");
        return;
      }

      // Map the activeChart to the correct report type
      const reportType = activeChart === 'spending' ? 'spending' : 
                        activeChart === 'income' ? 'income' : 'trends';

      const response = await reportsApi.exportReport(reportType, format, {
        start_date: formatDate(dateRange.from),
        end_date: formatDate(dateRange.to),
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeChart}-report-${formatDate(dateRange.from)}-to-${formatDate(dateRange.to)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your spending and income patterns
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  <>
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleExport('csv')}
              title="Export as CSV"
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleExport('pdf')}
              title="Export as PDF"
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-finance-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-income">
              {formatCurrency(timeData?.income?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-finance-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-expense">
              {formatCurrency(timeData?.expenses?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (timeData?.income?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0) -
                (timeData?.expenses?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Net for selected period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spending" onValueChange={setActiveChart}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="spending">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Where your money is going</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {categoryLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : !categoryData?.length ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={({ category, percent }) => 
                        `${category}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>Your sources of income</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {incomeLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : !incomeData?.length ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                    <Bar dataKey="amount" fill="#82ca9d" name="Income" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Spending & Income Trends</CardTitle>
              <CardDescription>How your finances change over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {timeLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : !timeData?.length ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#incomeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;