import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Brain,
    Calendar,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Clock,
    Stethoscope,
    FileText,
    Image as ImageIcon,
    XCircle,
} from "lucide-react";
import { apiGet } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface DiagnosisCondition {
    name: string;
    nameEn?: string;
    conditionKey: string;
    probability: number;
    description: string;
}

interface DiagnosisRecord {
    _id: string;
    userId: string;
    patientId?: string;
    conditions: DiagnosisCondition[];
    recommendations: string[];
    urgency: "low" | "medium" | "high";
    confidence: number;
    suggestedClinic?: {
        id: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
    };
    xrayFileId?: string;
    xrayFilename?: string;
    estimatedTreatmentTime?: string;
    createdAt: string;
}

interface PatientDiagnosisReportsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientUserId: string;
    patientName: string;
}

export default function PatientDiagnosisReportsModal({
    open,
    onOpenChange,
    patientUserId,
    patientName,
}: PatientDiagnosisReportsModalProps) {
    const { language } = useLanguage();
    const [records, setRecords] = useState<DiagnosisRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = {
        title: {
            ar: "سجلات التشخيص الذكي",
            en: "AI Diagnosis Records",
        },
        description: {
            ar: "عرض سجلات التشخيص بالذكاء الاصطناعي للمريض",
            en: "View patient's AI diagnosis history",
        },
        patient: {
            ar: "المريض",
            en: "Patient",
        },
        loading: {
            ar: "جاري تحميل السجلات...",
            en: "Loading records...",
        },
        error: {
            ar: "حدث خطأ في تحميل السجلات",
            en: "Error loading records",
        },
        empty: {
            ar: "لا توجد سجلات تشخيص",
            en: "No diagnosis records",
        },
        emptyDesc: {
            ar: "لم يقم المريض بإجراء أي تشخيص ذكي بعد",
            en: "Patient hasn't completed any AI diagnosis yet",
        },
        date: {
            ar: "التاريخ",
            en: "Date",
        },
        conditions: {
            ar: "الحالات المحتملة",
            en: "Possible Conditions",
        },
        recommendations: {
            ar: "التوصيات",
            en: "Recommendations",
        },
        urgency: {
            ar: "مستوى الأهمية",
            en: "Urgency Level",
        },
        confidence: {
            ar: "مستوى الثقة",
            en: "Confidence Level",
        },
        suggestedClinic: {
            ar: "العيادة المقترحة",
            en: "Suggested Clinic",
        },
        treatment: {
            ar: "الوقت المقدر للعلاج",
            en: "Estimated Treatment Time",
        },
        xray: {
            ar: "صورة أشعة",
            en: "X-Ray Image",
        },
        urgencyLevels: {
            high: { ar: "عاجل جداً", en: "Very Urgent" },
            medium: { ar: "متوسط", en: "Medium" },
            low: { ar: "عادي", en: "Normal" },
        },
    };

    useEffect(() => {
        if (open && patientUserId) {
            fetchRecords();
        }
    }, [open, patientUserId]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiGet<DiagnosisRecord[]>(
                `/ai/diagnosis/patient/${patientUserId}`
            );

            if (response.success && response.data) {
                setRecords(response.data);
            } else {
                setError(response.message || "Failed to fetch records");
            }
        } catch (err: any) {
            console.error("Error fetching diagnosis records:", err);
            setError(err.message || "Failed to fetch records");
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyBadge = (urgency: DiagnosisRecord["urgency"]) => {
        const config = {
            high: {
                icon: AlertCircle,
                className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                label: t.urgencyLevels.high[language],
            },
            medium: {
                icon: AlertTriangle,
                className:
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
                label: t.urgencyLevels.medium[language],
            },
            low: {
                icon: CheckCircle,
                className:
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                label: t.urgencyLevels.low[language],
            },
        };

        const { icon: Icon, className, label } = config[urgency];

        return (
            <Badge className={className}>
                <Icon className="h-3 w-3 mr-1" />
                {label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(
            language === "ar" ? "ar-EG" : "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Brain className="h-6 w-6 text-primary" />
                        {t.title[language]}
                    </DialogTitle>
                    <DialogDescription>
                        {t.patient[language]}: <span className="font-semibold">{patientName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : error ? (
                        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <h3 className="font-semibold text-lg">{t.error[language]}</h3>
                                        <p className="text-sm text-muted-foreground">{error}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : records.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">{t.empty[language]}</h3>
                                <p className="text-muted-foreground">{t.emptyDesc[language]}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        records.map((record) => (
                            <Card key={record._id} className="border-primary/20">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Stethoscope className="h-5 w-5 text-primary" />
                                                {t.title[language]}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(record.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            {getUrgencyBadge(record.urgency)}
                                            <Badge variant="outline">
                                                {t.confidence[language]}: {record.confidence}%
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Conditions */}
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-primary" />
                                            {t.conditions[language]}
                                        </h4>
                                        <div className="space-y-2">
                                            {record.conditions.map((condition, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {language === "ar" ? condition.name : condition.nameEn || condition.name}
                                                        </div>
                                                        {condition.description && (
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {condition.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge className="bg-primary/10 text-primary">
                                                        {condition.probability}%
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    {record.recommendations && record.recommendations.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-primary" />
                                                {t.recommendations[language]}
                                            </h4>
                                            <ul className="space-y-1">
                                                {record.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                                        <span className="text-primary mt-1">•</span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Suggested Clinic */}
                                    {record.suggestedClinic && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                                            <Stethoscope className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{t.suggestedClinic[language]}:</span>
                                            <span>
                                                {language === "ar"
                                                    ? record.suggestedClinic.nameAr || record.suggestedClinic.name
                                                    : record.suggestedClinic.nameEn || record.suggestedClinic.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Treatment Time */}
                                    {record.estimatedTreatmentTime && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{t.treatment[language]}: {record.estimatedTreatmentTime}</span>
                                        </div>
                                    )}

                                    {/* X-Ray */}
                                    {record.xrayFileId && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            <span className="text-sm">{t.xray[language]}: {record.xrayFilename || "X-ray image"}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
