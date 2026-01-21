import { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import { apiGet } from "@/services/api";
import { motion } from "framer-motion";

interface HomePageProps {
    userName: string;
    userType: string;
    userId?: string;
    onNavigate?: (page: string) => void;
    language?: "ar" | "en";
}

interface NextAppointment {
    date: string;
    doctorName: string;
    clinicName: string;
}

interface TreatmentStep {
    id: string;
    title: string;
    status: "completed" | "current" | "pending";
}

export default function HomePage({
    userName,
    userType,
    userId,
    onNavigate,
    language = "ar"
}: HomePageProps) {
    const today = new Date();
    const [balance, setBalance] = useState<number>(0);
    const [nextAppointment, setNextAppointment] = useState<NextAppointment | null>(null);
    const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([
        { id: "1", title: language === "ar" ? "الفحص" : "Checkup", status: "pending" },
        { id: "2", title: language === "ar" ? "الأشعة" : "X-Ray", status: "pending" },
        { id: "3", title: language === "ar" ? "التنظيف" : "Cleaning", status: "pending" },
        { id: "4", title: language === "ar" ? "الحشو" : "Filling", status: "pending" },
        { id: "5", title: language === "ar" ? "المتابعة" : "Follow-up", status: "pending" },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch balance using API service layer
                const balanceRes = await apiGet<{ balance: number }>(`/patient/${userId}/balance`);
                if (balanceRes.success) {
                    setBalance(balanceRes.data?.balance || 0);
                }

                // Fetch next appointment using API service layer
                const appointmentRes = await apiGet<any>(`/dashboard/next-appointment`);
                if (appointmentRes.success && appointmentRes.data) {
                    setNextAppointment({
                        date: appointmentRes.data.date,
                        doctorName: appointmentRes.data.doctorName,
                        clinicName: appointmentRes.data.clinicName
                    });
                }

                // Fetch treatment plans to calculate progress
                const treatmentRes = await apiGet<{ treatmentPlans: Array<{ status: string; steps: Array<{ _id: string; title: string; status: string }> }> }>(`/patients/${userId}`);
                if (treatmentRes.success && treatmentRes.data?.treatmentPlans && treatmentRes.data.treatmentPlans.length > 0) {
                    const activePlan = treatmentRes.data.treatmentPlans.find(p => p.status === 'in-progress') || treatmentRes.data.treatmentPlans[0];
                    if (activePlan && activePlan.steps) {
                        setTreatmentSteps(activePlan.steps.map((step, idx) => ({
                            id: step._id || String(idx),
                            title: step.title,
                            status: step.status as "completed" | "current" | "pending"
                        })));
                    }
                }
            } catch {
                // Fail silently, keep default values
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

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

    const formatAppointmentDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate()} ${monthNames[date.getMonth()]}`;
    };

    const quickActions = [
        { icon: "📅", label: language === "ar" ? "حجز موعد" : "Book", page: "appointments", color: "bg-teal-500" },
        { icon: "💬", label: language === "ar" ? "تواصل" : "Chat", page: "chat", color: "bg-emerald-500" },
        { icon: "📋", label: language === "ar" ? "السجل" : "Records", page: "medical-records", color: "bg-cyan-500" },
        { icon: "💳", label: language === "ar" ? "الدفع" : "Pay", page: "payment", color: "bg-amber-500" },
        { icon: "🆘", label: language === "ar" ? "طوارئ" : "Emergency", page: "chat", color: "bg-red-500" },
    ];

    const healthTips = language === "ar" ? [
        "تنظيف الأسنان بعد الأكل بـ30 دقيقة أفضل من التنظيف الفوري!",
        "استخدم خيط الأسنان مرة واحدة يومياً على الأقل",
        "قم بزيارة طبيب الأسنان كل 6 أشهر للفحص الدوري",
        "تجنب المشروبات الغازية والسكريات للحفاظ على أسنانك",
    ] : [
        "Brushing 30 minutes after eating is better than immediately!",
        "Use dental floss at least once daily",
        "Visit your dentist every 6 months for regular checkups",
        "Avoid sugary drinks to maintain healthy teeth",
    ];

    const tipIndex = today.getDate() % healthTips.length;
    const dailyTip = healthTips[tipIndex];
    const completedSteps = treatmentSteps.filter(s => s.status === "completed").length;
    const progressPercent = treatmentSteps.length > 0 ? Math.round((completedSteps / treatmentSteps.length) * 100) : 0;
    const isRTL = language === "ar";

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
                            {greeting()}، {userName}! 👋
                        </h1>
                        <p className="text-teal-100">
                            {language === "ar" ? "ابتسامتك تبدأ من هنا" : "Your smile starts here"}
                        </p>
                    </div>
                    <div className="hidden md:block text-6xl">😊</div>
                </div>
            </motion.div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Next Appointment */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all text-right w-full"
                    onClick={() => onNavigate?.("appointments")}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                            <span className="text-xl">📅</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "الموعد القادم" : "Next Appointment"}
                        </span>
                    </div>
                    {nextAppointment ? (
                        <>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{formatAppointmentDate(nextAppointment.date)}</p>
                            <p className="text-sm text-teal-600 dark:text-teal-400">{nextAppointment.doctorName}</p>
                            <p className="text-xs text-slate-400">{nextAppointment.clinicName}</p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "لا توجد مواعيد قادمة" : "No upcoming appointments"}
                        </p>
                    )}
                </motion.button>

                {/* Treatment Progress */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all text-right w-full"
                    onClick={() => onNavigate?.("treatment-plans")}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "تقدم العلاج" : "Treatment Progress"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14">
                            <svg className="w-14 h-14 transform -rotate-90">
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-200 dark:text-slate-700" />
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none"
                                    className="text-emerald-500"
                                    strokeDasharray={`${progressPercent * 1.51} 151`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800 dark:text-white">
                                {progressPercent}%
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{completedSteps}/{treatmentSteps.length}</p>
                            <p className="text-xs text-slate-400">{language === "ar" ? "مراحل مكتملة" : "Steps done"}</p>
                        </div>
                    </div>
                </motion.button>

                {/* Balance */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all text-right w-full"
                    onClick={() => onNavigate?.("payment")}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <span className="text-xl">💳</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "الرصيد المستحق" : "Balance Due"}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{balance}</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">{language === "ar" ? "جنيه مصري" : "EGP"}</p>
                </motion.button>

                {/* Health Status */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-right">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <span className="text-xl">😊</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ar" ? "حالتك الصحية" : "Health Status"}
                        </span>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {language === "ar" ? "جيدة جداً" : "Very Good"}
                    </p>
                    <p className="text-xs text-slate-400">{language === "ar" ? "آخر فحص: قبل أسبوع" : "Last check: 1 week ago"}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-teal-500" />
                        {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                    </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => onNavigate?.(action.page)}
                            className="group relative flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 text-white`}>
                                {action.icon}
                            </div>
                            <span className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Treatment Timeline */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {language === "ar" ? "📈 رحلة علاجك" : "📈 Your Treatment Journey"}
                    </h3>
                    <button
                        onClick={() => onNavigate?.("treatment-plans")}
                        className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400"
                    >
                        {isRTL ? "← عرض التفاصيل" : "View Details →"}
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    {treatmentSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                  ${step.status === "completed" ? "bg-emerald-500" :
                                        step.status === "current" ? "bg-teal-500 ring-4 ring-teal-200 dark:ring-teal-900" :
                                            "bg-slate-300 dark:bg-slate-600"}`}
                                >
                                    {step.status === "completed" ? "✓" : index + 1}
                                </div>
                                <span className={`text-xs mt-2 text-center max-w-16
                  ${step.status === "current" ? "text-teal-600 dark:text-teal-400 font-semibold" : "text-slate-500 dark:text-slate-400"}`}
                                >
                                    {step.title}
                                </span>
                            </div>
                            {index < treatmentSteps.length - 1 && (
                                <div className={`w-8 md:w-12 h-1 mx-1 rounded
                  ${step.status === "completed" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Health Tip */}
            <div className="bg-gradient-to-l from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 rounded-xl p-5 border border-teal-200 dark:border-teal-800">
                <div className="flex items-start gap-3">
                    <span className="text-3xl">💡</span>
                    <div>
                        <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">
                            {language === "ar" ? "نصيحة اليوم" : "Tip of the Day"}
                        </h3>
                        <p className="text-sm text-teal-700 dark:text-teal-300">{dailyTip}</p>
                    </div>
                </div>
            </div>

            {userType !== "patient" && <DashboardStats />}
        </motion.div>
    );
}
