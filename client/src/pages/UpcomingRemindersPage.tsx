import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "appointment" | "medication" | "followup" | "payment";
  priority: "high" | "medium" | "low";
  read: boolean;
}

export default function UpcomingRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "موعد الفحص الشامل",
      description: "فحص شامل للأسنان مع د. أحمد محمد",
      date: "2025-12-05",
      time: "10:00 AM",
      type: "appointment",
      priority: "high",
      read: false,
    },
    {
      id: "2",
      title: "تناول الدواء",
      description: "تناول المضاد الحيوي أموكسيسيلين",
      date: "2025-11-30",
      time: "08:00 AM",
      type: "medication",
      priority: "high",
      read: false,
    },
    {
      id: "3",
      title: "متابعة بعد الجراحة",
      description: "موعد المتابعة بعد جراحة الفم",
      date: "2025-12-10",
      time: "02:00 PM",
      type: "followup",
      priority: "medium",
      read: true,
    },
    {
      id: "4",
      title: "استحقاق دفعة من التقسيط",
      description: "الدفعة الثانية من خطة التقسيط",
      date: "2025-12-15",
      time: "11:59 PM",
      type: "payment",
      priority: "high",
      read: false,
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "low":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      default:
        return "";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "medication":
        return <AlertCircle className="h-4 w-4" />;
      case "followup":
        return <CheckCircle className="h-4 w-4" />;
      case "payment":
        return <Bell className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "appointment":
        return "موعد";
      case "medication":
        return "دواء";
      case "followup":
        return "متابعة";
      case "payment":
        return "دفع";
      default:
        return "";
    }
  };

  const unreadCount = reminders.filter((r) => !r.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">التذكيرات القادمة</h1>
          <p className="text-muted-foreground">
            {unreadCount} تذكيرات غير مقروءة
          </p>
        </div>
        <Button variant="outline" data-testid="button-mark-all-read">
          تعليم الكل كمقروء
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي التذكيرات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">غير المقروءة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">الأولوية العالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter((r) => r.priority === "high").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">المواعيد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter((r) => r.type === "appointment").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder, idx) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`hover-elevate transition-all ${
                !reminder.read
                  ? "border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10"
                  : "opacity-70"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {reminder.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(reminder.priority)}>
                      {reminder.priority === "high"
                        ? "عاجل"
                        : reminder.priority === "medium"
                        ? "متوسط"
                        : "منخفض"}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeLabel(reminder.type)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {reminder.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {reminder.time}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    data-testid={`button-dismiss-reminder-${reminder.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
