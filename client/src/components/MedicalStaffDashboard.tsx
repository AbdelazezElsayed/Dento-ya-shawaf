import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Bell, Activity, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { apiGet } from "@/services/api";

interface MedicalStaffDashboardProps {
    userName: string;
    userType: string;
    userId?: string;
    onNavigate?: (page: string) => void;
    language?: "ar" | "en";
}

export default function MedicalStaffDashboard({
    userName,
    userType,
    userId,
    onNavigate,
    language = "ar"
}: MedicalStaffDashboardProps) {
    const today = new Date();
    const isDoctor = userType === "doctor";

    // State for real data
    const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPatients: 0,
        pendingPatients: 0,
        todayRevenue: 0,
        monthlyRevenue: 0
    });

    // Fetch real data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch today's appointments
                const appointmentsRes = await apiGet<any>('/appointments');
                if (appointmentsRes.success && appointmentsRes.data) {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];

                    // Filter appointments for today only
                    const todayAppts = appointmentsRes.data.filter((apt: any) => {
                        const aptDate = new Date(apt.date).toISOString().split('T')[0];
                        return aptDate === todayStr;
                    });

                    setTodayAppointments(todayAppts);

                    // Calculate stats
                    const pending = todayAppts.filter((apt: any) => apt.status === 'scheduled').length;
                    setStats(prev => ({
                        ...prev,
                        totalPatients: todayAppts.length,
                        pendingPatients: pending
                    }));
                }

                // TODO: Fetch revenue data when endpoint is available
                // For now, keep mock revenue data
                setStats(prev => ({
                    ...prev,
                    todayRevenue: isDoctor ? 3500 : 0,
                    monthlyRevenue: isDoctor ? 45000 : 0
                }));

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, isDoctor]);

    const dayNames = language === "ar"
        ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const monthNames = language === "ar"
        ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const greeting = () => {
        const hour = today.getHours();
        if (language === "ar") {
            if (hour < 12) return "صباح الخير";
            if (hour < 18) return "مساء الخير";
            return "مساء الخير";
        } else {
            if (hour < 12) return "Good Morning";
            if (hour < 18) return "Good Afternoon";
            return "Good Evening";
        }
    };

    const notifications = [
        { id: "1", type: "urgent", message: "مريض طوارئ بانتظارك - غرفة 3", time: "منذ 5 دقائق" },
        { id: "2", type: "info", message: "تم إلغاء موعد المريض محمد علي", time: "منذ 20 دقيقة" },
        { id: "3", type: "reminder", message: "اجتماع فريق طبي الساعة 4 مساءً", time: "منذ ساعة" },
    ];

    const quickActions = [
        { icon: <Calendar className="w-5 h-5" />, label: language === "ar" ? "مواعيد اليوم" : "Today's Schedule", page: "today-appointments", color: "bg-teal-500" },
        { icon: <Users className="w-5 h-5" />, label: language === "ar" ? "المرضى" : "Patients", page: "patients", color: "bg-blue-500" },
        { icon: <Activity className="w-5 h-5" />, label: language === "ar" ? "التحليلات" : "Analytics", page: "reports", color: "bg-purple-500" },
        ...(isDoctor ? [{ icon: <DollarSign className="w-5 h-5" />, label: language === "ar" ? "الأسعار" : "Pricing", page: "price-management", color: "bg-amber-500" }] : []),
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">{language === "ar" ? "مكتمل" : "Done"}</Badge>;
            case "in-progress":
                return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30">{language === "ar" ? "جاري" : "Active"}</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30">{language === "ar" ? "قادم" : "Pending"}</Badge>;
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Welcome Header */}
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-l from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-teal-100 text-sm mb-1">
                            {dayNames[today.getDay()]}، {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {greeting()}، {isDoctor ? "دكتور" : ""} {userName}! 👨‍⚕️
                        </h1>
                        <p className="text-teal-100">
                            {language === "ar"
                                ? `لديك ${stats.pendingPatients} ${stats.pendingPatients === 1 ? "مريض" : "مرضى"} في الانتظار`
                                : `You have ${stats.pendingPatients} patient${stats.pendingPatients > 1 ? "s" : ""} waiting`}
                        </p>
                    </div>
                    <div className="hidden md:block text-6xl">👨‍⚕️</div>
                </div>
            </motion.div>

            {/* Status Cards */}
            <div className={`grid grid-cols-2 ${isDoctor ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
                {/* Today's Patients */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all text-right w-full"
                    onClick={() => onNavigate?.("today-appointments")}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "مرضى اليوم" : "Today's Patients"}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{loading ? "..." : stats.totalPatients}</p>
                    <p className="text-sm text-teal-600 dark:text-teal-400">
                        {stats.pendingPatients} {language === "ar" ? "في الانتظار" : "waiting"}
                    </p>
                </motion.button>

                {/* Pending Queue */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all text-right w-full"
                    onClick={() => onNavigate?.("today-appointments")}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "قائمة الانتظار" : "Queue"}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{loading ? "..." : stats.pendingPatients}</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">{language === "ar" ? "مريض" : "patients"}</p>
                </motion.button>

                {/* Today Revenue (Doctor only) */}
                {isDoctor && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all text-right w-full"
                        onClick={() => onNavigate?.("financial")}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {language === "ar" ? "إيرادات اليوم" : "Today's Revenue"}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.todayRevenue}</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">{language === "ar" ? "جنيه مصري" : "EGP"}</p>
                    </motion.button>
                )}

                {/* Monthly Revenue (Doctor only) */}
                {isDoctor && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-right">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {language === "ar" ? "إيرادات الشهر" : "Monthly Revenue"}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.monthlyRevenue}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            +12% {language === "ar" ? "من الشهر الماضي" : "from last month"}
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-teal-500" />
                        {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-auto flex-col gap-2 p-4"
                                onClick={() => onNavigate?.(action.page)}
                            >
                                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                                    {action.icon}
                                </div>
                                <span className="text-xs">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {language === "ar" ? "📅 جدول اليوم" : "📅 Today's Schedule"}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate?.("today-appointments")}
                        >
                            {language === "ar" ? "عرض الكل ←" : "View All →"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    ) : todayAppointments.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{language === "ar" ? "لا توجد مواعيد اليوم" : "No appointments today"}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayAppointments.map((appointment) => {
                                // Format appointment data
                                const patient = appointment.patientId;
                                const patientName = typeof patient === 'object' ? patient.fullName : 'مريض';
                                const time = appointment.time || 'غير محدد';
                                const clinic = appointment.clinicId?.name || 'عيادة';
                                const status = appointment.status === 'completed' ? 'completed' :
                                    appointment.status === 'scheduled' ? 'pending' : 'in-progress';

                                return (
                                    <div
                                        key={appointment._id || appointment.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                                                {patientName[0]?.toUpperCase() || 'P'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">{patientName}</p>
                                                <p className="text-xs text-slate-500">{clinic}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{time}</span>
                                            {getStatusBadge(status)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        {language === "ar" ? "الإشعارات" : "Notifications"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`flex items-start gap-3 p-3 rounded-lg ${notif.type === "urgent"
                                    ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                                    : "bg-slate-50 dark:bg-slate-800/50"
                                    }`}
                            >
                                {notif.type === "urgent" && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                    <p className={`text-sm ${notif.type === "urgent" ? "text-red-900 dark:text-red-100 font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
