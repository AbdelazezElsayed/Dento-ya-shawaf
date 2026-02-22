import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Download } from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

const revenueData = [
  { month: "يناير", revenue: 15000, expenses: 8000 },
  { month: "فبراير", revenue: 18000, expenses: 9000 },
  { month: "مارس", revenue: 22000, expenses: 10000 },
  { month: "أبريل", revenue: 25000, expenses: 11000 },
  { month: "مايو", revenue: 28000, expenses: 12000 },
  { month: "يونيو", revenue: 32000, expenses: 13000 }
];

const categoryData = [
  { name: "علاج", value: 40, fill: "#3B82F6" },
  { name: "تشخيص", value: 25, fill: "#10B981" },
  { name: "تنظيف", value: 20, fill: "#F59E0B" },
  { name: "تجميل", value: 15, fill: "#8B5CF6" }
];

export default function FinancialManagementPage() {
  const [invoices] = useState<Invoice[]>([
    { id: "INV001", date: "2025-10-15", service: "فحص عام وأشعات", amount: 250, status: "paid" },
    { id: "INV002", date: "2025-10-28", service: "جلسة تنظيف", amount: 150, status: "paid" },
    { id: "INV003", date: "2025-11-10", service: "حشو تجميلي", amount: 400, status: "pending" }
  ]);

  const [expenses] = useState<Expense[]>([
    { id: "EXP001", description: "رواتب الموظفين", category: "رواتب", amount: 5000, date: "2025-11-01" },
    { id: "EXP002", description: "إيجار العيادة", category: "عقارات", amount: 3000, date: "2025-11-01" },
    { id: "EXP003", description: "معدات وأدوات", category: "معدات", amount: 1500, date: "2025-11-15" }
  ]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = paidAmount - totalExpenses;
  const profitMargin = ((profit / paidAmount) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">💰 الإدارة المالية</h1>
        <p className="text-muted-foreground text-lg">تتبع الإيرادات والمصروفات والأرباح</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-primary">{totalRevenue} ج.م</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-900 dark:text-orange-100 mb-1">إجمالي المصروفات</p>
                <p className="text-3xl font-bold text-orange-600">{totalExpenses} ج.م</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-900 dark:text-green-100 mb-1">الربح الصافي</p>
                <p className="text-3xl font-bold text-green-600">{profit} ج.م</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-1">نسبة الربح</p>
                <p className="text-3xl font-bold text-blue-600">{profitMargin}%</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="expenses">المصروفات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="taxes">الضرائب</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات والمصروفات - 6 أشهر</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="الإيرادات" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="المصروفات" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الخدمات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملخص الحالة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <p>إجمالي الإيرادات</p>
                  <p className="font-bold text-primary">{totalRevenue} ج.م</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <p>المدفوع</p>
                  <Badge variant="default">{paidAmount} ج.م</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <p>قيد الانتظار</p>
                  <Badge variant="secondary">{pendingAmount} ج.م</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <p>المصروفات</p>
                  <p className="font-bold text-orange-600">{totalExpenses} ج.م</p>
                </div>
                <div className="flex justify-between items-center pt-2 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <p className="font-semibold">الربح الصافي</p>
                  <p className="font-bold text-green-600">{profit} ج.م</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-6 space-y-4">
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-sm text-muted-foreground">{invoice.id}</p>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="status-badge text-xs">
                          {invoice.status === "paid" ? "✓ مدفوع" : "⏳ قيد الانتظار"}
                        </Badge>
                      </div>
                      <p className="font-semibold">{invoice.service}</p>
                      <p className="text-sm text-muted-foreground mt-2">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{invoice.amount} ج.م</p>
                      <Button variant="outline" size="sm" className="mt-2 gap-2">
                        <Download className="h-4 w-4" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses" className="mt-6 space-y-4">
          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                      </div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">{expense.date}</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{expense.amount} ج.م</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>تقرير الربح والخسارة</CardTitle>
                <CardDescription>الفترة: أكتوبر - نوفمبر 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between pb-2 border-b">
                  <p>الإيرادات</p>
                  <p className="font-bold text-green-600">+{totalRevenue} ج.م</p>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <p>المصروفات</p>
                  <p className="font-bold text-orange-600">-{totalExpenses} ج.م</p>
                </div>
                <div className="flex justify-between pt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p className="font-semibold">الربح الصافي</p>
                  <p className="font-bold text-primary">{profit} ج.م</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الرسوم والعمولات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <p>عمولة بطاقة الائتمان</p>
                  <p className="text-muted-foreground">2.5%</p>
                </div>
                <div className="flex justify-between">
                  <p>رسوم المنصة</p>
                  <p className="text-muted-foreground">1%</p>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <p className="font-semibold">إجمالي الرسوم</p>
                  <p className="font-bold">3.5%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تحميل التقارير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                تحميل تقرير PDF
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                تحميل تقرير Excel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Taxes */}
        <TabsContent value="taxes" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حساب الضرائب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b">
                  <p>الإيرادات الخاضعة للضريبة</p>
                  <p className="font-bold">{totalRevenue} ج.م</p>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <p>المصروفات المسموحة</p>
                  <p className="font-bold">{totalExpenses} ج.م</p>
                </div>
                <div className="flex justify-between pb-2 border-b bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p className="font-semibold">الدخل الخاضع للضريبة</p>
                  <p className="font-bold text-primary">{profit} ج.م</p>
                </div>
                <div className="flex justify-between pt-2">
                  <p className="font-semibold">الضريبة (22%)</p>
                  <p className="font-bold text-orange-600">{(profit * 0.22).toFixed(0)} ج.م</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
