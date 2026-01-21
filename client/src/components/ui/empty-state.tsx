import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    action?: {
        label: string;
        labelEn?: string;
        onClick: () => void;
    };
    className?: string;
    language?: "ar" | "en";
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    titleEn,
    description,
    descriptionEn,
    action,
    className,
    language = "ar",
}: EmptyStateProps) {
    const displayTitle = language === "en" && titleEn ? titleEn : title;
    const displayDescription = language === "en" && descriptionEn ? descriptionEn : description;
    const displayActionLabel = action && (language === "en" && action.labelEn ? action.labelEn : action.label);

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 text-center",
                className
            )}
        >
            <div className="rounded-full bg-muted p-4 mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
            {displayDescription && (
                <p className="text-muted-foreground mb-4 max-w-sm">{displayDescription}</p>
            )}
            {action && (
                <Button onClick={action.onClick} variant="outline">
                    {displayActionLabel}
                </Button>
            )}
        </div>
    );
}

// Preset empty states for common use cases
export function EmptyAppointments({
    language = "ar",
    onBook
}: {
    language?: "ar" | "en";
    onBook?: () => void;
}) {
    return (
        <EmptyState
            title="لا توجد مواعيد"
            titleEn="No Appointments"
            description="لم يتم حجز أي مواعيد بعد"
            descriptionEn="No appointments have been booked yet"
            action={onBook ? {
                label: "حجز موعد",
                labelEn: "Book Appointment",
                onClick: onBook
            } : undefined}
            language={language}
        />
    );
}

export function EmptyPatients({ language = "ar" }: { language?: "ar" | "en" }) {
    return (
        <EmptyState
            title="لا يوجد مرضى"
            titleEn="No Patients"
            description="لم يتم تسجيل أي مرضى بعد"
            descriptionEn="No patients have been registered yet"
            language={language}
        />
    );
}

export function EmptyPayments({ language = "ar" }: { language?: "ar" | "en" }) {
    return (
        <EmptyState
            title="لا توجد مدفوعات"
            titleEn="No Payments"
            description="لم يتم تسجيل أي مدفوعات بعد"
            descriptionEn="No payments have been recorded yet"
            language={language}
        />
    );
}

export function EmptyTreatmentPlans({ language = "ar" }: { language?: "ar" | "en" }) {
    return (
        <EmptyState
            title="لا توجد خطط علاجية"
            titleEn="No Treatment Plans"
            description="لم يتم إنشاء أي خطط علاجية بعد"
            descriptionEn="No treatment plans have been created yet"
            language={language}
        />
    );
}

export function EmptyNotifications({ language = "ar" }: { language?: "ar" | "en" }) {
    return (
        <EmptyState
            title="لا توجد إشعارات"
            titleEn="No Notifications"
            description="لا توجد إشعارات جديدة"
            descriptionEn="No new notifications"
            language={language}
        />
    );
}

export default EmptyState;
