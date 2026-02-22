import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus, Edit, Trash2, FileText, MessageSquare, ArrowRight } from "lucide-react";

interface TreatmentStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  date?: string;
  doctor?: string;
  notes?: string;
}

interface TreatmentPlanDetailPageProps {
  onBackClick?: () => void;
}

export default function TreatmentPlanDetailPage({ onBackClick }: TreatmentPlanDetailPageProps) {
  const [steps, setSteps] = useState<TreatmentStep[]>([
    {
      id: "1",
      title: "الفحص الأولي والأشعة",
      description: "فحص شامل للفم والأسنان مع أخذ الأشعة اللازمة",
      status: "completed",
      date: "2025-10-15",
      doctor: "د. محمد أحمد",
      notes: "تم اكتشاف تسوس في الضرس الأول والثاني العلوي"
    },
    {
      id: "2",
      title: "تنظيف الأسنان وإزالة الجير",
      description: "جلسة تنظيف عميق للأسنان وإزالة الجير والبلاك",
      status: "in-progress",
      date: "2025-10-28",
      doctor: "د. فاطمة علي",
      notes: "نظافة الأسنان بحالة جيدة بعد الجلسة الأولى"
    },
    {
      id: "3",
      title: "حشو الضرس الأول",
      description: "حشو تجميلي للضرس المصاب بالتسوس",
      status: "pending",
      date: "2025-11-10",
      doctor: "د. محمد أحمد",
    },
    {
      id: "4",
      title: "حشو الضرس الثاني",
      description: "حشو تجميلي للضرس المصاب بالتسوس",
      status: "pending",
      date: "2025-11-17",
      doctor: "د. فاطمة علي",
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "مكتمل", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" };
      case "in-progress":
        return { label: "قيد التنفيذ", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" };
      case "pending":
        return { label: "معلق", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" };
    }
  };

  const completedSteps = steps.filter(s => s.status === "completed").length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">خطة العلاج الشاملة</h1>
          <p className="text-muted-foreground text-lg">إدارة ومتابعة خطوات العلاج الموصوفة من قبل الطبيب</p>
        </div>
        {onBackClick && (
          <Button 
            variant="outline" 
            onClick={onBackClick}
            className="gap-2"
            data-testid="button-back-to-home"
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
        )}
      </div>

      {/* Progress Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">إجمالي الخطوات</p>
              <p className="text-3xl font-bold text-primary">{totalSteps}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">مكتملة</p>
              <p className="text-3xl font-bold text-green-600">{completedSteps}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">قيد التنفيذ</p>
              <p className="text-3xl font-bold text-blue-600">
                {steps.filter(s => s.status === "in-progress").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">معلقة</p>
              <p className="text-3xl font-bold text-gray-600">
                {steps.filter(s => s.status === "pending").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>التقدم العام</span>
            <span className="text-sm font-normal text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">📅 الجدول الزمني</TabsTrigger>
          <TabsTrigger value="details">📋 التفاصيل</TabsTrigger>
          <TabsTrigger value="notes">📝 الملاحظات</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <div className="relative">
            <div className="absolute right-[22px] top-0 h-full w-0.5 bg-border"></div>

            <div className="space-y-6">
              {steps.map((step) => {
                const statusBadge = getStatusLabel(step.status);
                return (
                  <div key={step.id} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>

                    <Card className="flex-1">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{step.title}</h4>
                            {step.doctor && (
                              <p className="text-xs text-muted-foreground mt-1">الطبيب: {step.doctor}</p>
                            )}
                          </div>
                          <Badge className={statusBadge?.className}>{statusBadge?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        {step.date && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{step.date}</span>
                          </div>
                        )}
                        {step.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-xs">
                            <p className="font-semibold mb-1">ملاحظات:</p>
                            <p>{step.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Details View */}
        <TabsContent value="details" className="mt-6 space-y-4">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusLabel(step.status)?.className}>
                    {getStatusLabel(step.status)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {step.date && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">التاريخ المحدد</p>
                      <p className="text-sm">{step.date}</p>
                    </div>
                  )}
                  {step.doctor && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">الطبيب المسؤول</p>
                      <p className="text-sm">{step.doctor}</p>
                    </div>
                  )}
                </div>
                {step.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">الملاحظات الطبية</p>
                    <p className="text-sm bg-muted p-3 rounded">{step.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    تعديل
                  </Button>
                  {step.status !== "completed" && (
                    <Button size="sm" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {step.status === "pending" ? "بدء التنفيذ" : "إكمال"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Notes View */}
        <TabsContent value="notes" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                ملاحظات عامة مهمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">⚠️ تعليمات قبل العلاج</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    • تجنب تناول الطعام قبل الجلسة بساعة واحدة<br/>
                    • نظف أسنانك جيداً قبل كل جلسة<br/>
                    • تجنب المشروبات الساخة والباردة بعد الجلسة مباشرة
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">ℹ️ معلومات إضافية</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    • المدة المتوقعة للعلاج: 4-6 أسابيع<br/>
                    • عدد الجلسات المتوقعة: 6 جلسات<br/>
                    • الرسوم الكلية: بعد اكتمال الفحص الشامل
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Note Form */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة ملاحظة جديدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="أضف ملاحظات أو استفسارات جديدة..." 
                className="min-h-24"
              />
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة ملاحظة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            هل لديك أسئلة؟
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            يمكنك التواصل مع الفريق الطبي عبر:
          </p>
          <ul className="text-sm space-y-1">
            <li>📞 الهاتف: +20 123 456 7890</li>
            <li>📧 البريد الإلكتروني: clinic@hospital.com</li>
            <li>💬 الدردشة المباشرة: متاحة في التطبيق</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
