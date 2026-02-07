import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home } from "lucide-react";

/**
 * UnauthorizedPage - Display when user lacks permissions
 * Shown when a user tries to access a route they don't have permission for
 */
export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full"></div>
                        <ShieldAlert className="relative w-24 h-24 text-destructive" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Title (Arabic) */}
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                    غير مصرح
                </h1>

                {/* Description (Arabic) */}
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    لا تملك صلاحية للوصول لهذه الصفحة. يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
                </p>

                {/* Description (English) */}
                <p className="text-sm text-muted-foreground">
                    You do not have permission to access this page. Please contact the administrator if you believe this is an error.
                </p>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/home">
                            <Home className="w-4 h-4 mr-2" />
                            العودة للرئيسية / Back to Home
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full"
                    >
                        <Link href="/settings">
                            الإعدادات / Settings
                        </Link>
                    </Button>
                </div>

                {/* Error Code */}
                <p className="text-xs text-muted-foreground mt-6">
                    Error Code: 403 - Forbidden
                </p>
            </div>
        </div>
    );
}
