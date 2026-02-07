import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Brain, Calendar, AlertCircle, CheckCircle, AlertTriangle, Clock,
    Stethoscope, FileText, Image as ImageIcon, XCircle, Pill, Activity,
    User, Phone, Mail, MapPin, ClipboardList
} from "lucide-react";
import { apiGet } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface PatientReportsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientUserId: string;
    patientName: string;
}

export default function PatientReportsModal({
    open, onOpenChange, patientUserId, patientName
}: PatientReportsModalProps) {
    const { language } = useLanguage();
    const [diagnosisRecords, setDiagnosisRecords] = useState<any[]>([]);
    const [patientData, setPatientData] = useState<any>(null);
    const [treatmentPlan, setTreatmentPlan] = useState<any>(null);
    const [diagnosisLoading, setDiagnosisLoading] = useState(false);
    const [medicalLoading, setMedicalLoading] = useState(false);
    const [treatmentLoading, setTreatmentLoading] = useState(false);
    const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
    const [medicalError, setMedicalError] = useState<string | null>(null);
    const [treatmentError, setTreatmentError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("medical");

    const t = {
        medical: { ar: "السجل المرضي", en: "Medical Records" },
        aiDiagnosis: { ar: "التشخيص الذكي", en: "AI Diagnosis" },
        treatmentPlan: { ar: "الخطة العلاجية", en: "Treatment Plan" },
        loading: { ar: "جاري التحميل...", en: "Loading..." },
        error: { ar: "خطأ", en: "Error" },
        empty: { ar: "لا توجد بيانات", en: "No data available" }
    };

    useEffect(() => {
        if (open && patientUserId) {
            fetchDiagnosisRecords();
            fetchMedicalRecords();
            fetchTreatmentPlan();
        }
    }, [open, patientUserId]);

    const fetchDiagnosisRecords = async () => {
        try {
            setDiagnosisLoading(true);
            const response = await apiGet(`/ai/diagnosis/patient/${patientUserId}`);
            if (response.success && response.data) {
                setDiagnosisRecords(response.data);
            }
        } catch (err: any) {
            setDiagnosisError(err.message);
        } finally {
            setDiagnosisLoading(false);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            setMedicalLoading(true);
            const response = await apiGet(`/patients/user/${patientUserId}`);
            if (response) {
                setPatientData(response);
            }
        } catch (err: any) {
            setMedicalError(err.message);
        } finally {
            setMedicalLoading(false);
        }
    };

    const fetchTreatmentPlan = async () => {
        try {
            setTreatmentLoading(true);
            if (!patientUserId) return;

            const patientResponse = await apiGet(`/patients/user/${patientUserId}`);
            if (patientResponse && patientResponse._id) {
                const planResponse = await apiGet(`/patients/${patientResponse._id}/treatment-plan`);
                if (planResponse) {
                    setTreatmentPlan(planResponse);
                }
            }
        } catch (err: any) {
            setTreatmentError(err.message);
        } finally {
            setTreatmentLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {language === "ar" ? `تقارير المريض: ${patientName}` : `Patient Reports: ${patientName}`}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="medical">{t.medical[language]}</TabsTrigger>
                        <TabsTrigger value="diagnosis">{t.aiDiagnosis[language]}</TabsTrigger>
                        <TabsTrigger value="treatmentPlan">{t.treatmentPlan[language]}</TabsTrigger>
                    </TabsList>

                    {/* Medical Records Tab */}
                    <TabsContent value="medical" className="mt-6">
                        {medicalLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-40 w-full" />
                                <Skeleton className="h-40 w-full" />
                            </div>
                        ) : medicalError ? (
                            <Card className="border-red-200">
                                <CardContent className="p-6">
                                    <p className="text-red-600">{medicalError}</p>
                                </CardContent>
                            </Card>
                        ) : !patientData ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p className="text-muted-foreground">{t.empty[language]}</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === "ar" ? "معلومات المريض" : "Patient Information"}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{patientData.fullName}</span>
                                        </div>
                                        {patientData.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span>{patientData.email}</span>
                                            </div>
                                        )}
                                        {patientData.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{patientData.phone}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {patientData.medications && patientData.medications.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Pill className="h-5 w-5" />
                                                {language === "ar" ? "الأدوية الحالية" : "Current Medications"}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {patientData.medications.map((med: any, idx: number) => (
                                                    <div key={idx} className="p-3 bg-muted/50 rounded">
                                                        <p className="font-medium">{med.name}</p>
                                                        <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* AI Diagnosis Tab */}
                    <TabsContent value="diagnosis" className="mt-6">
                        {diagnosisLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-40 w-full" />
                            </div>
                        ) : diagnosisError ? (
                            <Card className="border-red-200">
                                <CardContent className="p-6">
                                    <p className="text-red-600">{diagnosisError}</p>
                                </CardContent>
                            </Card>
                        ) : diagnosisRecords.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Brain className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground">{t.empty[language]}</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {diagnosisRecords.map((record: any) => (
                                    <Card key={record._id} className="border-primary/20">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between flex-wrap gap-2">
                                                <div>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <Stethoscope className="h-5 w-5 text-primary" />
                                                        {language === "ar" ? "التشخيص الذكي" : "AI Diagnosis"}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(record.createdAt).toLocaleDateString(
                                                            language === "ar" ? "ar-EG" : "en-US",
                                                            { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 items-end">
                                                    <Badge className={
                                                        record.urgency === "high" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" :
                                                            record.urgency === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" :
                                                                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                    }>
                                                        {record.urgency === "high" ? <AlertCircle className="h-3 w-3 mr-1" /> :
                                                            record.urgency === "medium" ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                                                                <CheckCircle className="h-3 w-3 mr-1" />}
                                                        {record.urgency === "high" ? (language === "ar" ? "عاجل جداً" : "Very Urgent") :
                                                            record.urgency === "medium" ? (language === "ar" ? "متوسط" : "Medium") :
                                                                (language === "ar" ? "عادي" : "Normal")}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {language === "ar" ? "مستوى الثقة" : "Confidence"}: {record.confidence}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Conditions */}
                                            <div>
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-primary" />
                                                    {language === "ar" ? "الحالات المحتملة" : "Possible Conditions"}
                                                </h4>
                                                <div className="space-y-2">
                                                    {record.conditions && record.conditions.map((condition: any, idx: number) => (
                                                        <div key={idx} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
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
                                                        {language === "ar" ? "التوصيات" : "Recommendations"}
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {record.recommendations.map((rec: string, idx: number) => (
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
                                                    <span className="font-medium">{language === "ar" ? "العيادة المقترحة" : "Suggested Clinic"}:</span>
                                                    <span>
                                                        {language === "ar" ?
                                                            record.suggestedClinic.nameAr || record.suggestedClinic.name :
                                                            record.suggestedClinic.nameEn || record.suggestedClinic.name}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Treatment Time */}
                                            {record.estimatedTreatmentTime && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        {language === "ar" ? "الوقت المقدر للعلاج" : "Estimated Treatment Time"}: {record.estimatedTreatmentTime}
                                                    </span>
                                                </div>
                                            )}

                                            {/* X-Ray */}
                                            {record.xrayFileId && (
                                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                    <ImageIcon className="h-4 w-4 text-primary" />
                                                    <span className="text-sm">
                                                        {language === "ar" ? "صورة أشعة" : "X-Ray Image"}: {record.xrayFilename || "X-ray image"}
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Treatment Plan Tab */}
                    <TabsContent value="treatmentPlan" className="mt-6">
                        {treatmentLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-40 w-full" />
                            </div>
                        ) : treatmentError ? (
                            <Card className="border-red-200">
                                <CardContent className="p-6">
                                    <p className="text-red-600">{treatmentError}</p>
                                </CardContent>
                            </Card>
                        ) : !treatmentPlan ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground">{t.empty[language]}</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === "ar" ? "نظرة عامة على الخطة" : "Plan Overview"}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-2">
                                            <p><strong>{language === "ar" ? "العنوان:" : "Title:"}</strong> {treatmentPlan.title}</p>
                                            {treatmentPlan.description && (
                                                <p><strong>{language === "ar" ? "الوصف:" : "Description:"}</strong> {treatmentPlan.description}</p>
                                            )}
                                            {treatmentPlan.doctorName && (
                                                <p><strong>{language === "ar" ? "الطبيب:" : "Doctor:"}</strong> {treatmentPlan.doctorName}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {treatmentPlan.procedures && treatmentPlan.procedures.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{language === "ar" ? "الإجراءات المجدولة" : "Scheduled Procedures"}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {treatmentPlan.procedures.map((proc: any, idx: number) => (
                                                    <div key={idx} className="p-3 bg-muted/50 rounded">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium">{proc.name}</p>
                                                                {proc.description && (
                                                                    <p className="text-sm text-muted-foreground">{proc.description}</p>
                                                                )}
                                                            </div>
                                                            <Badge variant={
                                                                proc.status === "completed" ? "default" :
                                                                    proc.status === "in-progress" ? "secondary" : "outline"
                                                            }>
                                                                {proc.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {treatmentPlan.appointments && treatmentPlan.appointments.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{language === "ar" ? "المواعيد القادمة" : "Upcoming Appointments"}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {treatmentPlan.appointments.map((apt: any, idx: number) => (
                                                    <div key={idx} className="p-3 bg-muted/50 rounded flex justify-between">
                                                        <div>
                                                            <p className="font-medium">{apt.type}</p>
                                                            <p className="text-sm text-muted-foreground">{apt.clinic}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm">{apt.date}</p>
                                                            <p className="text-sm text-muted-foreground">{apt.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {treatmentPlan.notes && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{language === "ar" ? "ملاحظات الطبيب" : "Doctor's Notes"}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap">{treatmentPlan.notes}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
