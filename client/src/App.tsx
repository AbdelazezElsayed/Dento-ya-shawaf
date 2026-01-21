import { useState, useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import LoginPage from "@/components/LoginPage";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/common/NotificationBell";
import AppSidebar from "@/components/AppSidebar";
import DashboardStats from "@/components/DashboardStats";
import PatientList from "@/components/PatientList";
import TreatmentPlanCard from "@/components/TreatmentPlanCard";
import ReportsList from "@/components/ReportsList";
import ClinicCard from "@/components/ClinicCard";
import UserProfileCard from "@/components/UserProfileCard";
import PatientChatbot from "@/components/PatientChatbot";
import FloatingChatbot from "@/components/FloatingChatbot";
import DentocadPage from "@/pages/DentocadPage";
import TreatmentPlanDetailPage from "@/pages/TreatmentPlanDetailPage";
import AppointmentBookingPageNew from "@/pages/AppointmentBookingPageNew";
import DoctorManagementPage from "@/pages/DoctorManagementPage";
import MedicalRecordsPage from "@/pages/MedicalRecordsPage";
import RatingsPage from "@/pages/RatingsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SearchPage from "@/pages/SearchPage";
import PaymentPageNew from "@/pages/PaymentPageNew";
import DoctorPanelPage from "@/pages/DoctorPanelPage";
import AdminPanelPage from "@/pages/AdminPanelPage";
import SettingsPage from "@/pages/SettingsPage";
import SupportTicketsPage from "@/pages/SupportTicketsPage";
import FinancialManagementPage from "@/pages/FinancialManagementPage";
import ClinicsOverviewPage from "@/pages/ClinicsOverviewPage";
import ClinicDetailPageNew from "@/pages/ClinicDetailPage";
import HomePage from "@/pages/HomePage";
import ReportsPage from "@/pages/ReportsPage";
import ChatBotPage from "@/pages/ChatBotPage";
import MyAppointmentsPage from "@/pages/MyAppointmentsPage";
import MedicationsPage from "@/pages/MedicationsPage";
import MyReviewsPage from "@/pages/MyReviewsPage";
import UpcomingRemindersPage from "@/pages/UpcomingRemindersPage";
import DoctorSchedulePage from "@/pages/DoctorSchedulePage";
import PatientQueuePage from "@/pages/PatientQueuePage";
import PatientMedicalHistoryPage from "@/pages/PatientMedicalHistoryPage";
import AppointmentsAnalyticsPage from "@/pages/AppointmentsAnalyticsPage";
import DoctorProfilePage from "@/pages/DoctorProfilePage";
import SignUpPage from "@/pages/SignUpPage";
import AIDiagnosisPage from "@/pages/AIDiagnosisPage";
import TodayAppointmentsPage from "@/components/TodayAppointmentsPage";
import PriceManagementPage from "@/components/PriceManagementPage";
import { ProtectedRoute, AdminRoute, DoctorRoute, MedicalStaffRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Stethoscope, Syringe, Scissors, Layers, Building2, Moon, Sun, Activity, Sparkles, Baby, Smile, User, Globe, MessageCircle, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function LanguageToggle({ language, onLanguageChange }: { language: "ar" | "en"; onLanguageChange: (lang: "ar" | "en") => void }) {
  const toggleLanguage = () => {
    const newLang: "ar" | "en" = language === "ar" ? "en" : "ar";
    onLanguageChange(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
      title={language === "ar" ? "English" : "العربية"}
    >
      <Globe className="h-5 w-5" />
      <span className="text-xs ml-1">{language === "ar" ? "EN" : "AR"}</span>
    </Button>
  );
}

// Internal components removed - using modular pages from @/pages/*

// Legacy internal components removed - using modular pages from @/pages/*

interface CustomPage {
  id: string;
  name: string;
  content: string;
  icon: string;
}

// Router component removed - routing consolidated in Dashboard

function Dashboard() {
  // Use AuthContext for centralized auth state that persists on refresh
  const { isAuthenticated, userType, userId, userName, login, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const activePage = location.substring(1) || "home";

  const { language, setLanguage } = useLanguage();
  const [customPages, setCustomPages] = useState([
    { id: "1", name: "ملفي الطبي", content: "معلومات صحتي الشاملة", icon: "Heart" },
    { id: "2", name: "تقاريري", content: "جميع التقارير الطبية", icon: "FileText" },
  ]);

  // Navigation History Management removed - using wouter's history
  const [isLoading, setIsLoading] = useState(false);

  // Login handler now just needs to refetch - API call happens in LoginPage
  const handleLogin = async () => {
    await login(); // Refetch user from server
  };

  const handleNavigate = (page: string) => {
    const path = page.startsWith("/") ? page : `/${page}`;
    if (location === path) return;

    setIsLoading(true);
    setTimeout(() => {
      setLocation(path);
      setIsLoading(false);
    }, 100);
  };

  const goBack = () => {
    window.history.back();
  };

  const goHome = () => {
    setLocation("/home");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + ArrowLeft = Go Back
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
      // Ctrl/Cmd + Home = Go to Home
      if ((e.ctrlKey || e.metaKey) && e.key === "Home") {
        e.preventDefault();
        goHome();
      }
      // Escape = Go Back
      if (e.key === "Escape" && activePage !== "home") {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePage]);

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ name: "الرئيسية", path: "home" }];

    if (activePage.startsWith("clinic-")) {
      breadcrumbs.push({ name: "العيادات الطبية", path: "clinics" });
      const clinicId = activePage.replace("clinic-", "");
      const clinicNames: Record<string, string> = {
        diagnosis: "التشخيص والأشعة",
        conservative: "العلاج التحفظي",
        surgery: "جراحة الفم والفكين",
        removable: "التركيبات المتحركة",
        fixed: "التركيبات الثابتة",
        gums: "اللثة",
        "oral-surgery": "الجراحة",
        cosmetic: "تجميل الأسنان",
        implants: "زراعة الأسنان",
        orthodontics: "تقويم الأسنان",
        pediatric: "أسنان الأطفال",
      };
      breadcrumbs.push({ name: clinicNames[clinicId] || "العيادة", path: activePage });
    } else if (activePage === "treatment-plans") {
      breadcrumbs.push({ name: "الخطط العلاجية", path: activePage });
    } else if (activePage === "reports") {
      breadcrumbs.push({ name: "التقارير والإحصائيات", path: activePage });
    } else if (activePage === "dentocad") {
      breadcrumbs.push({ name: "Dentocad", path: activePage });
    } else if (activePage === "settings") {
      breadcrumbs.push({ name: "الإعدادات", path: activePage });
    } else if (activePage === "treatment-plan-detail") {
      breadcrumbs.push({ name: "الخطط العلاجية", path: "treatment-plans" });
      breadcrumbs.push({ name: "تفاصيل الخطة", path: activePage });
    } else if (activePage === "appointments") {
      breadcrumbs.push({ name: "حجز المواعيد", path: activePage });
    } else if (activePage === "doctors") {
      breadcrumbs.push({ name: "الأطباء", path: activePage });
    } else if (activePage === "medical-records") {
      breadcrumbs.push({ name: "السجل الطبي", path: activePage });
    } else if (activePage === "ratings") {
      breadcrumbs.push({ name: "التقييمات", path: activePage });
    } else if (activePage === "notifications") {
      breadcrumbs.push({ name: "الإشعارات", path: activePage });
    } else if (activePage === "search") {
      breadcrumbs.push({ name: "البحث", path: activePage });
    } else if (activePage === "payment") {
      breadcrumbs.push({ name: "الفواتير والدفع", path: activePage });
    } else if (activePage === "doctor-panel") {
      breadcrumbs.push({ name: "لوحة تحكم الطبيب", path: activePage });
    } else if (activePage === "admin-panel") {
      breadcrumbs.push({ name: "لوحة تحكم المسؤول", path: activePage });
    } else if (activePage === "support-tickets") {
      breadcrumbs.push({ name: "تذاكر الدعم", path: activePage });
    } else if (activePage === "financial") {
      breadcrumbs.push({ name: "الإدارة المالية", path: activePage });
    } else if (activePage === "chat") {
      breadcrumbs.push({ name: "Dento - مساعدك الطبي", path: activePage });
    } else if (activePage === "clinics") {
      breadcrumbs.push({ name: "العيادات الطبية", path: activePage });
    } else if (activePage === "ai-diagnosis") {
      breadcrumbs.push({ name: "التشخيص الذكي", path: activePage });
    } else if (activePage === "today-appointments") {
      breadcrumbs.push({ name: language === "ar" ? "مواعيد اليوم" : "Today's Appointments", path: activePage });
    } else if (activePage === "price-management") {
      breadcrumbs.push({ name: language === "ar" ? "إدارة الأسعار" : "Price Management", path: activePage });
    } else if (activePage === "patients") {
      breadcrumbs.push({ name: language === "ar" ? "المرضى" : "Patients", path: activePage });
    }

    return breadcrumbs;
  };

  const [showSignUp, setShowSignUp] = useState(false);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSignUp) {
      return <SignUpPage
        onSignUp={async () => {
          await handleLogin(); // Refetch user after successful signup
          setShowSignUp(false);
        }}
        onLoginClick={() => setShowSignUp(false)}
      />;
    }
    return <LoginPage onLogin={handleLogin} onSignUpClick={() => setShowSignUp(true)} />;
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider defaultOpen={false} style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar customPages={customPages} userType={userType} language={language} />
        <div className="flex flex-col flex-1">
          {/* Header with Navigation Controls */}
          <header className="flex items-center justify-between p-4 border-b bg-card gap-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />

              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                title="رجوع (Alt+←)"
                data-testid="button-back"
                className="transition-all hover-elevate"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Home Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goHome}
                title="الرئيسية (Ctrl+Home)"
                data-testid="button-home"
                className="transition-all hover-elevate"
              >
                <Home className="h-5 w-5" />
              </Button>

              {/* Breadcrumbs */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="font-semibold">{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            className="cursor-pointer hover-elevate transition-all rounded px-2 py-1"
                            onClick={() => handleNavigate(crumb.path)}
                            data-testid={`breadcrumb-${crumb.path}`}
                          >
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {userType === "patient" ? "مريض" : userType === "doctor" ? "طبيب" : userType === "student" ? "طالب" : "إمتياز"}
                </p>
              </div>
              <Avatar data-testid="avatar-user">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <NotificationBell language={language} onNotificationClick={(page) => handleNavigate(page)} />
              <LanguageToggle language={language} onLanguageChange={setLanguage} />
              <ThemeToggle />
            </div>
          </header>
          <main className={`flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900 ${isLoading ? 'opacity-50 pointer-events-none' : 'page-transition'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                  <p className="text-muted-foreground">جاري التحميل...</p>
                </div>
              </div>
            ) : (
              <>
                <Switch>
                  <Route path="/home">
                    <HomePage userName={userName} userType={userType} userId={userId} onNavigate={handleNavigate} language={language} />
                  </Route>
                  <Route path="/treatment-plans">
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">الخطة العلاجية للمريض</h1>
                        <p className="text-slate-500 dark:text-slate-400">متابعة مراحل العلاج الخاصة بك</p>
                      </div>
                      <TreatmentPlanCard
                        patientName={userName}
                        planTitle="خطة علاج التسوس والتنظيف"
                        steps={[
                          {
                            id: "1",
                            title: "الفحص الأولي والأشعة",
                            description: "فحص شامل للفم والأسنان مع أخذ الأشعة اللازمة",
                            status: "completed",
                            date: "2025-10-15",
                          },
                          {
                            id: "2",
                            title: "تنظيف الأسنان وإزالة الجير",
                            description: "جلسة تنظيف عميق للأسنان وإزالة الجير والبلاك",
                            status: "in-progress",
                            date: "2025-10-28",
                          },
                          {
                            id: "3",
                            title: "حشو الضرس الأول",
                            description: "حشو تجميلي للضرس المصاب بالتسوس",
                            status: "pending",
                          },
                        ]}
                        onUpdateStep={() => { }}
                        onViewDetails={() => handleNavigate("treatment-plan-detail")}
                      />
                    </div>
                  </Route>
                  <Route path="/dentocad">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md">
                        <div className="text-6xl mb-6">🦷</div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Dentocad</h1>
                        <p className="text-xl text-teal-600 dark:text-teal-400 font-semibold mb-3">Coming Soon</p>
                        <p className="text-slate-500 dark:text-slate-400">نعمل على تطوير هذه الميزة. ترقبوا التحديثات القادمة!</p>
                      </div>
                    </div>
                  </Route>
                  <Route path="/treatment-plan-detail">
                    <TreatmentPlanDetailPage onBackClick={() => handleNavigate("treatment-plans")} />
                  </Route>
                  <Route path="/appointments">
                    <AppointmentBookingPageNew />
                  </Route>
                  <Route path="/doctors">
                    <DoctorManagementPage />
                  </Route>
                  <Route path="/medical-records">
                    <MedicalRecordsPage />
                  </Route>
                  <Route path="/ratings">
                    <RatingsPage />
                  </Route>
                  <Route path="/notifications">
                    <NotificationsPage />
                  </Route>
                  <Route path="/search">
                    <SearchPage />
                  </Route>
                  <Route path="/payment">
                    <PaymentPageNew />
                  </Route>
                  <Route path="/support-tickets">
                    <SupportTicketsPage />
                  </Route>
                  <Route path="/financial">
                    <FinancialManagementPage />
                  </Route>
                  <Route path="/reports">
                    <ReportsPage />
                  </Route>
                  <Route path="/chat">
                    <ChatBotPage />
                  </Route>
                  <Route path="/ai-diagnosis">
                    <AIDiagnosisPage />
                  </Route>
                  <Route path="/today-appointments">
                    <TodayAppointmentsPage language={language} />
                  </Route>
                  <Route path="/price-management">
                    <PriceManagementPage language={language} />
                  </Route>
                  <Route path="/patients">
                    <PatientList clinicName="الكل" onViewPatient={() => { }} />
                  </Route>
                  <Route path="/clinics">
                    <ClinicsOverviewPage onNavigate={(page) => handleNavigate(page)} />
                  </Route>
                  <Route path="/clinic/:id">
                    {(params) => <ClinicDetailPageNew clinicId={params.id} onNavigate={(page) => handleNavigate(page)} />}
                  </Route>
                  <Route path="/settings">
                    <SettingsPage customPages={customPages} setCustomPages={setCustomPages} />
                  </Route>
                  <Route path="/">
                    <HomePage userName={userName} userType={userType} userId={userId} onNavigate={handleNavigate} language={language} />
                  </Route>
                  <Route component={NotFound} />
                </Switch>
                {userType === "patient" && <FloatingChatbot patientName={userName} />}
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Dashboard />
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
