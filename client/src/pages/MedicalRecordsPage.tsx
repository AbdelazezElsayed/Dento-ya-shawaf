import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Calendar, User, AlertCircle, Pill, Bell, Clock, IdCard, Check, Zap } from "lucide-react";

interface MedicalRecord {
  id: string;
  type: string;
  date: string;
  doctor: string;
  clinic: string;
  description: string;
  findings: string;
  recommendations: string;
  status: "normal" | "alert" | "follow-up";
  followUpDate?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  purpose: string;
  reminderTime?: string;
}

interface FollowUpAlert {
  id: string;
  title: string;
  dueDate: string;
  type: "checkup" | "test" | "review";
  priority: "low" | "medium" | "high";
  description: string;
  status: "pending" | "completed";
}

// Helper function to calculate days until due date and get urgency level
const getDaysUntil = (dueDate: string): { days: number; level: "urgent" | "warning" | "normal" } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diff <= 3) return { days: Math.ceil(diff), level: "urgent" };
  if (diff <= 7) return { days: Math.ceil(diff), level: "warning" };
  return { days: Math.ceil(diff), level: "normal" };
};

const getCountdownText = (daysInfo: { days: number; level: string }): string => {
  if (daysInfo.days === 0) return "اليوم";
  if (daysInfo.days === 1) return "غداً";
  if (daysInfo.days < 0) return "متأخر";
  return `في ${daysInfo.days} أيام`;
};

export default function MedicalRecordsPage() {
  const [records] = useState<MedicalRecord[]>([
    {
      id: "1",
      type: "فحص عام",
      date: "2025-10-15",
      doctor: "د. محمد أحمد",
      clinic: "التشخيص والأشعة",
      description: "فحص شامل للفم والأسنان",
      findings: "تسوس في الضرس الأول والثاني العلوي، التهاب بسيط باللثة",
      recommendations: "إجراء حشو تحفظي، تنظيف عميق للأسنان",
      status: "alert",
      followUpDate: "2025-11-15"
    },
    {
      id: "2",
      type: "أشعات سينية",
      date: "2025-10-15",
      doctor: "د. محمد أحمد",
      clinic: "التشخيص والأشعة",
      description: "أشعات سينية للأسنان العلوية",
      findings: "تظهر الأشعات وجود تسوس تحت الحشوات القديمة",
      recommendations: "إجراء فحص دقيق وإعادة معالجة الأسنان المصابة",
      status: "alert"
    },
    {
      id: "3",
      type: "تقرير معالجة",
      date: "2025-10-28",
      doctor: "د. فاطمة علي",
      clinic: "العلاج التحفظي",
      description: "جلسة تنظيف عميق",
      findings: "تم إزالة الجير والبلاك بنجاح، تحسن واضح في صحة اللثة",
      recommendations: "العناية المنزلية المستمرة، مراجعة دورية كل 3 أشهر",
      status: "normal",
      followUpDate: "2025-11-28"
    },
  ]);

  const [medications] = useState<Medication[]>([
    {
      id: "1",
      name: "أموكسيسيلين",
      dosage: "500 ملغ",
      frequency: "ثلاث مرات يومياً",
      startDate: "2025-11-10",
      endDate: "2025-11-17",
      prescribedBy: "د. محمد أحمد",
      purpose: "التهاب بكتيري",
      reminderTime: "08:00"
    },
    {
      id: "2",
      name: "ايبوبروفين",
      dosage: "200 ملغ",
      frequency: "عند الحاجة",
      startDate: "2025-11-10",
      prescribedBy: "د. فاطمة علي",
      purpose: "تسكين الألم",
      reminderTime: "12:00"
    },
  ]);

  const [followUpAlerts] = useState<FollowUpAlert[]>([
    {
      id: "1",
      title: "فحص متابعة شامل",
      dueDate: "2025-11-15",
      type: "checkup",
      priority: "high",
      description: "متابعة الحالة الصحية بعد العلاج",
      status: "pending"
    },
    {
      id: "2",
      title: "تحليل دم شامل",
      dueDate: "2025-11-20",
      type: "test",
      priority: "medium",
      description: "فحص دوري للتأكد من عدم وجود عدوى",
      status: "pending"
    },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("records");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">📋 الملف الطبي الشامل</h1>
        <p className="text-muted-foreground text-lg">سجلاتك الطبية، أدويتك، والتنبيهات المهمة</p>
      </div>

      {/* Digital ID Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <IdCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">بطاقة هوية المريض الرقمية</p>
                <h3 className="text-2xl font-bold">أحمد محمد علي</h3>
                <p className="text-sm text-muted-foreground">رقم التسجيل: #123456789</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-muted-foreground">مجموعة الدم</p>
              <p className="text-lg font-bold text-primary">O+</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">العمر</p>
              <p className="font-semibold">28 سنة</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">حالة التأمين</p>
              <Badge variant="default" className="text-xs">✓ نشط</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">آخر تحديث</p>
              <p className="text-sm">2025-10-28</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">السجلات</TabsTrigger>
          <TabsTrigger value="medications" className="gap-1">
            <Pill className="h-4 w-4" />
            الأدوية ({medications.length})
          </TabsTrigger>
          <TabsTrigger value="followups" className="gap-1">
            <Bell className="h-4 w-4" />
            المتابعات ({followUpAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="reminders">التنبيهات</TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records" className="mt-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
                  <p className="text-3xl font-bold text-primary">{records.length}</p>
                  <p className="text-xs text-muted-foreground">آخر تحديث: أمس</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">آخر فحص</p>
                  <p className="text-lg font-semibold">2025-10-28</p>
                  <p className="text-xs text-muted-foreground">د. فاطمة علي</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="pt-6">
                <div className="space-y-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-900 dark:text-yellow-100 font-semibold">تنبيهات</p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">{followUpAlerts.filter(a => a.status === "pending").length} متابعات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              الكل
            </Button>
            <Button
              variant={filterType === "فحص عام" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("فحص عام")}
            >
              فحوصات
            </Button>
            <Button
              variant={filterType === "أشعات سينية" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("أشعات سينية")}
            >
              أشعات
            </Button>
            <Button
              variant={filterStatus === "alert" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(filterStatus === "alert" ? "all" : "alert")}
              className={filterStatus === "alert" ? "bg-red-600" : ""}
            >
              تنبيهات
            </Button>
          </div>

          {/* Medical Records */}
          <div className="space-y-4">
            {records.filter(r => 
              (filterType === "all" || r.type === filterType) &&
              (filterStatus === "all" || r.status === filterStatus)
            ).map(record => (
              <Card 
                key={record.id} 
                className={`${record.status === "alert" ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 status-alert" : ""}`}
                role="article"
                aria-label={`السجل الطبي: ${record.type} - ${record.status}`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className={`h-5 w-5 ${record.status === "alert" ? "text-red-600" : "text-primary"}`} />
                          <h3 className="text-lg font-bold">{record.type}</h3>
                          {record.status === "alert" && (
                            <Badge variant="destructive" className="status-badge status-alert text-xs">⚠ تنبيه</Badge>
                          )}
                          {record.status === "follow-up" && (
                            <Badge variant="secondary" className="status-badge text-xs">↻ متابعة</Badge>
                          )}
                          {record.status === "normal" && (
                            <Badge variant="default" className="status-badge text-xs">✓ عادي</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {record.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {record.doctor}
                          </div>
                          <Badge variant="secondary">{record.clinic}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          تحميل
                        </Button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">الوصف</p>
                        <p className="text-sm">{record.description}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">الملاحظات</p>
                        <p className="text-sm bg-muted p-2 rounded">{record.findings}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">التوصيات</p>
                        <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                          {record.recommendations}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="mt-6 space-y-4">
          {medications.map(med => (
            <Card key={med.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg h-fit">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{med.name}</h3>
                      <div className="grid gap-2 mt-2 text-sm">
                        <p><strong>الجرعة:</strong> {med.dosage}</p>
                        <p><strong>المعدل:</strong> {med.frequency}</p>
                        <p><strong>الغرض:</strong> {med.purpose}</p>
                        <p><strong>وصفها:</strong> {med.prescribedBy}</p>
                        {med.reminderTime && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Clock className="h-4 w-4" />
                            تذكير يومي في {med.reminderTime}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">إيقاف</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups" className="mt-6 space-y-4">
          {followUpAlerts.map(alert => {
            const daysInfo = getDaysUntil(alert.dueDate);
            const countdownText = getCountdownText(daysInfo);
            
            let borderColor = "border-gray-200 dark:border-gray-800";
            let bgColor = "bg-white dark:bg-slate-900";
            let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
            let urgencyIcon = null;
            
            if (daysInfo.level === "urgent") {
              borderColor = "border-red-300 dark:border-red-700";
              bgColor = "bg-red-50 dark:bg-red-900/20";
              badgeVariant = "destructive";
              urgencyIcon = <Zap className="h-4 w-4 text-red-600" />;
            } else if (daysInfo.level === "warning") {
              borderColor = "border-yellow-300 dark:border-yellow-700";
              bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
              urgencyIcon = <AlertCircle className="h-4 w-4 text-yellow-600" />;
            }
            
            return (
              <Card 
                key={alert.id} 
                className={`${borderColor} ${bgColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <Badge variant={badgeVariant} className="text-xs flex items-center gap-1">
                          {urgencyIcon}
                          {daysInfo.level === "urgent" ? "عاجل جداً" : daysInfo.level === "warning" ? "قريب" : "طبيعي"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>الموعد: {alert.dueDate}</span>
                        </div>
                        <div className={`font-semibold px-3 py-1 rounded-full ${daysInfo.level === "urgent" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200" : daysInfo.level === "warning" ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200" : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200"}`}>
                          {countdownText}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      تم
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>التنبيهات المجدولة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.filter(m => m.reminderTime).map(med => (
                <div key={med.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="font-semibold">تناول {med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.frequency}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{med.reminderTime}</p>
                    <p className="text-xs text-muted-foreground">يومياً</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
