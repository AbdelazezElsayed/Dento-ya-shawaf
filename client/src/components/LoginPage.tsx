import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCircle, GraduationCap, Users, Stethoscope, LogIn, Globe, Moon, Sun, Eye, EyeOff, AlertTriangle, Lock, UserPlus, Mail } from "lucide-react";
import { motion } from "framer-motion";
import loginBg from "@assets/stock_images/modern_dental_hospit_e3518571.jpg";

interface LoginPageProps {
  onLogin?: () => Promise<void>; // Just trigger refetch after successful login
  onSignUpClick?: () => void;
}

export default function LoginPage({ onLogin, onSignUpClick }: LoginPageProps) {
  const [userType, setUserType] = useState<string>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [isDark, setIsDark] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // SECURITY: Only remember username, not session data
    // Session validation is handled server-side via httpOnly cookies
    const savedEmail = localStorage.getItem("dentoRememberedUser");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const isAccountLocked = failedAttempts >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAccountLocked) {
      setErrors({
        email: language === "ar"
          ? "الحساب مقفل لأسباب أمان. يرجى المحاولة بعد 15 دقيقة"
          : "Account locked for security. Try again later"
      });
      return;
    }

    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = language === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFailedAttempts(prev => prev + 1);
        setErrors({
          password: data.message || (language === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password")
        });
        return;
      }

      setFailedAttempts(0);

      if (rememberMe) {
        // SECURITY: Only remember email, not session data
        localStorage.setItem("dentoRememberedUser", email);
      } else {
        localStorage.removeItem("dentoRememberedUser");
      }

      // Notify parent that login was successful - parent will refetch user
      if (onLogin) {
        await onLogin();
      }
    } catch (error) {
      setErrors({
        email: language === "ar" ? "حدث خطأ في الاتصال بالخادم" : "Server connection error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    { value: "patient", label: "مريض", labelEn: "Patient", icon: UserCircle },
    { value: "doctor", label: "طبيب", labelEn: "Doctor", icon: Stethoscope },
    { value: "student", label: "طالب", labelEn: "Student", icon: GraduationCap },
    { value: "graduate", label: "إمتياز", labelEn: "Excellence", icon: Users },
  ];

  const translations = {
    ar: {
      title: "Dento Health Care",
      subtitle: "مستشفى طب الفم والأسنان",
      university: "جامعة الدلتا للعلوم والتكنولوجيا",
      userType: "نوع المستخدم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      login: "تسجيل الدخول",
      forgotPassword: "نسيت كلمة المرور؟",
      rememberMe: "تذكرني لمدة 30 يوم",
      signUp: "إنشاء حساب جديد",
      noAccount: "ليس لديك حساب؟",
      welcome: "مرحباً بك",
      welcomeText: "سجّل دخولك للوصول إلى نظام إدارة مستشفى طب الأسنان",
    },
    en: {
      title: "Dento Health Care",
      subtitle: "Faculty of Dentistry Hospital",
      university: "Delta University of Science and Technology",
      userType: "User Type",
      email: "Email Address",
      password: "Password",
      login: "Sign In",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember me for 30 days",
      signUp: "Create New Account",
      noAccount: "Don't have an account?",
      welcome: "Welcome",
      welcomeText: "Sign in to access the dental hospital management system",
    },
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen flex ${language === "ar" ? "flex-row-reverse" : "flex-row"}`}>
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />

        <div className={`relative z-10 flex flex-col justify-center p-12 text-white ${language === "ar" ? "text-right" : "text-left"}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-4">{t.title}</h1>
            <h2 className="text-2xl font-medium mb-2 opacity-90">{t.subtitle}</h2>
            <p className="text-lg opacity-80">{t.university}</p>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 opacity-80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span>{language === "ar" ? "12+ عيادة متخصصة" : "12+ Specialized Clinics"}</span>
              </div>
              <div className="flex items-center gap-3 opacity-80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span>{language === "ar" ? "فريق طبي متميز" : "Expert Medical Team"}</span>
              </div>
              <div className="flex items-center gap-3 opacity-80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-5 h-5" />
                </div>
                <span>{language === "ar" ? "رعاية صحية شاملة" : "Comprehensive Healthcare"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={`w-full lg:w-1/2 flex flex-col ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        {/* Top Controls */}
        <div className={`flex justify-between items-center p-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setIsDark(!isDark); document.documentElement.classList.toggle("dark"); }}
              className="rounded-full"
              data-testid="button-toggle-theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="rounded-full"
              data-testid="button-toggle-language"
            >
              <Globe className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden text-primary font-bold text-xl">{t.title}</div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md ${language === "ar" ? "rtl text-right" : "ltr text-left"}`}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.welcome}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t.welcomeText}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.userType}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {userTypes.map(({ value, label, labelEn, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setUserType(value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${userType === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-600 dark:text-gray-400"
                        }`}
                      data-testid={`card-${value}`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{language === "ar" ? label : labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.email}
                </Label>
                <div className="relative">
                  <Mail className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    className={`${language === "ar" ? "pr-10 text-right" : "pl-10"} h-12 rounded-xl border-gray-200 dark:border-gray-700 ${errors.email ? "border-red-500" : ""}`}
                    disabled={isLoading || isAccountLocked}
                    data-testid="input-email"
                    placeholder={language === "ar" ? "example@domain.com" : "example@domain.com"}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.password}
                </Label>
                <div className="relative">
                  <Lock className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                  <Input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                    className={`${language === "ar" ? "pr-10 pl-10 text-right" : "pl-10 pr-10"} h-12 rounded-xl border-gray-200 dark:border-gray-700 ${errors.password ? "border-red-500" : ""}`}
                    disabled={isLoading || isAccountLocked}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className={`flex items-center justify-between ${language === "ar" ? "flex-row-reverse" : ""}`}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    data-testid="checkbox-remember"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    {t.rememberMe}
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={isLoading || isAccountLocked}
                data-testid="button-login"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LogIn className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <LogIn className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t.login}
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.noAccount}{" "}
                  <button
                    type="button"
                    onClick={() => onSignUpClick?.()}
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    data-testid="link-sign-up"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t.signUp}
                  </button>
                </span>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
