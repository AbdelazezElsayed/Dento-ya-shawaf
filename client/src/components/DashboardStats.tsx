import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  testId?: string;
}

function StatCard({ title, value, icon: Icon, trend, testId }: StatCardProps) {
  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const stats = [
    {
      title: "إجمالي المرضى",
      value: "1,234",
      icon: Users,
      trend: "+12% من الشهر الماضي",
      testId: "stat-total-patients",
    },
    {
      title: "المواعيد اليوم",
      value: "42",
      icon: Calendar,
      trend: "15 موعد قادم",
      testId: "stat-appointments",
    },
    {
      title: "التقارير المعلقة",
      value: "8",
      icon: FileText,
      trend: "تحتاج مراجعة",
      testId: "stat-pending-reports",
    },
    {
      title: "الخطط العلاجية النشطة",
      value: "156",
      icon: TrendingUp,
      trend: "+8% هذا الأسبوع",
      testId: "stat-treatment-plans",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.testId} {...stat} />
      ))}
    </div>
  );
}
