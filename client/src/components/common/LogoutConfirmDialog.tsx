import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    language?: "ar" | "en";
}

export default function LogoutConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    language = "ar",
}: LogoutConfirmDialogProps) {
    const translations = {
        ar: {
            title: "تأكيد تسجيل الخروج",
            description: "هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟",
            cancel: "إلغاء",
            confirm: "تسجيل الخروج",
        },
        en: {
            title: "Confirm Logout",
            description: "Are you sure you want to logout from your account?",
            cancel: "Cancel",
            confirm: "Logout",
        },
    };

    const t = translations[language];

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {t.confirm}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
