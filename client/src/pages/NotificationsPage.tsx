import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, X, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface Notification {
  id: string;
  type: "appointment" | "result" | "reminder" | "alert";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "appointment",
      title: "تذكير: موعد الطبيب",
      message: "لديك موعد مع د. محمد أحمد غداً الساعة 10:00 صباحاً في عيادة التشخيص والأشعة",
      date: "2025-11-24",
      read: false
    },
    {
      id: "2",
      type: "result",
      title: "نتائج الفحوصات جاهزة",
      message: "نتائج أشعاتك السينية متاحة الآن. يرجى التواصل مع الطبيب لمناقشة النتائج.",
      date: "2025-11-23",
      read: false
    },
    {
      id: "3",
      type: "reminder",
      title: "تذكير: متابعة دورية",
      message: "أنت بحاجة لمراجعة دورية. يرجى حجز موعد مع د. فاطمة علي للمتابعة.",
      date: "2025-11-22",
      read: true
    },
    {
      id: "4",
      type: "alert",
      title: "تنبيه طبي مهم",
      message: "تم تحديث سجلك الطبي. يرجى المراجعة والتأكد من صحة البيانات.",
      date: "2025-11-21",
      read: true
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "result":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "reminder":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "alert":
        return <Bell className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      appointment: { label: "موعد", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
      result: { label: "نتيجة", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
      reminder: { label: "تذكير", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
      alert: { label: "تنبيه", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
    };
    return variants[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">🔔 الإشعارات</h1>
          <p className="text-muted-foreground text-lg">تابع آخر التحديثات والتنبيهات الطبية</p>
        </div>
        {unreadCount > 0 && (
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{unreadCount} إشعار جديد</p>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              data-testid="button-mark-all-read"
            >
              علّم الكل كمقروء
            </Button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">إجمالي الإشعارات</p>
            <p className="text-3xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">مواعيد</p>
            <p className="text-3xl font-bold text-blue-600">
              {notifications.filter(n => n.type === "appointment").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-green-900 dark:text-green-100 mb-2">نتائج</p>
            <p className="text-3xl font-bold text-green-600">
              {notifications.filter(n => n.type === "result").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-red-900 dark:text-red-100 mb-2">تنبيهات</p>
            <p className="text-3xl font-bold text-red-600">
              {notifications.filter(n => n.type === "alert").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", "appointment", "result", "reminder", "alert"].map(type => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type)}
            data-testid={`button-filter-notification-${type}`}
          >
            {type === "all" ? "الكل" : type === "appointment" ? "مواعيد" : type === "result" ? "نتائج" : type === "reminder" ? "تذكيرات" : "تنبيهات"}
            ({notifications.filter(n => type === "all" ? true : n.type === type).length})
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.filter(n => filterType === "all" ? true : n.type === filterType).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">لا توجد إشعارات</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => {
            const typeBadge = getTypeBadge(notification.type);
            return (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.read ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20 status-pending" : ""}`}
                role="article"
                aria-label={`${notification.title} - ${typeBadge.label}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <Badge variant="secondary" className="status-badge text-xs px-2 py-0.5 h-6 flex items-center gap-1">
                              <span>{typeBadge.label}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{notification.message}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="gap-2"
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        data-testid={`button-delete-notification-${notification.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
