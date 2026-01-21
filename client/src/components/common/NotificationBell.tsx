import { useState } from "react";
import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: "appointment" | "message" | "payment" | "general";
    read: boolean;
}

interface NotificationBellProps {
    language?: "ar" | "en";
    onNotificationClick?: (type: string) => void;
}

export function NotificationBell({ language = "ar", onNotificationClick }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: language === "ar" ? "رسالة جديدة" : "New Message",
            message: language === "ar" ? "لديك رسالة من د. محمد" : "Message from Dr. Mohamed",
            time: language === "ar" ? "منذ 5 دقائق" : "5 mins ago",
            type: "message",
            read: false,
        },
        {
            id: "2",
            title: language === "ar" ? "موعد قادم" : "Upcoming Appointment",
            message: language === "ar" ? "موعدك غداً الساعة 10:00 صباحاً" : "Your appointment tomorrow at 10:00 AM",
            time: language === "ar" ? "منذ ساعة" : "1 hour ago",
            type: "appointment",
            read: false,
        },
        {
            id: "3",
            title: language === "ar" ? "تذكير دفع" : "Payment Reminder",
            message: language === "ar" ? "لديك مبلغ مستحق 500 ج.م" : "You have EGP 500 due",
            time: language === "ar" ? "منذ 3 ساعات" : "3 hours ago",
            type: "payment",
            read: true,
        },
    ]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "appointment":
                return "📅";
            case "message":
                return "💬";
            case "payment":
                return "💳";
            default:
                return "🔔";
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);

        // Navigate based on notification type
        const navigationMap: Record<string, string> = {
            appointment: "appointments",
            message: "chat",
            payment: "payment",
            general: "home",
        };

        onNotificationClick?.(navigationMap[notification.type] || "home");
    };

    return (
        <DropdownMenu dir={language === "ar" ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    data-testid="notification-bell"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            variant="destructive"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={language === "ar" ? "start" : "end"}
                className="w-80"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-base">
                        {language === "ar" ? "الإشعارات" : "Notifications"}
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-7"
                        >
                            {language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                                {language === "ar" ? "لا توجد إشعارات" : "No notifications"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`p-4 cursor-pointer ${!notification.read ? "bg-primary/5" : ""}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3 w-full">
                                        <div className="flex-shrink-0 text-2xl">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => onNotificationClick?.("notifications")}
                        >
                            {language === "ar" ? "عرض جميع الإشعارات" : "View all notifications"}
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
