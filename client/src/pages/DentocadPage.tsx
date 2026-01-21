import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquareCode, Zap, Database, Users, Shield } from "lucide-react";

export default function DentocadPage() {
  const features = [
    {
      category: "للمريض",
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-900/30",
      suggestions: [
        {
          title: "نماذج فحص رقمية",
          description: "تعبئة النماذج الطبية بسهولة قبل الكشف",
          details: "- النماذج متاحة عبر الهاتف\n- تزامن تلقائي مع ملف المريض\n- خانات ذكية تملأ تلقائياً"
        },
        {
          title: "تنبيهات المواعيد",
          description: "تذكيرات ذكية قبل المواعيد بفترة",
          details: "- تنبيهات عبر الرسائل النصية\n- خيارات لتغيير أو إلغاء المواعيد\n- تقويم مدمج"
        },
        {
          title: "السجل الطبي الإلكتروني",
          description: "عرض كامل السجل الطبي والأدوية",
          details: "- وصفات طبية رقمية\n- نتائج الفحوصات الحديثة\n- توصيات الطبيب"
        }
      ]
    },
    {
      category: "للطبيب",
      icon: Shield,
      color: "bg-green-100 dark:bg-green-900/30",
      suggestions: [
        {
          title: "لوحة تحكم المريض",
          description: "معلومات شاملة عن كل مريض في لوحة واحدة",
          details: "- السجل الطبي الكامل\n- الصور والأشعات\n- خطة العلاج والتقدم"
        },
        {
          title: "خطط العلاج الرقمية",
          description: "إنشاء وتتبع خطط العلاج بسهولة",
          details: "- نماذج معدة مسبقاً\n- تتبع مراحل العلاج\n- تنبيهات المتابعة"
        },
        {
          title: "إدارة الحالات المعقدة",
          description: "التعاون مع الأطباء الآخرين للحالات المعقدة",
          details: "- مشاركة الملفات الطبية\n- استشارات متخصصة\n- تعليقات وملاحظات"
        }
      ]
    },
    {
      category: "للطالب",
      icon: Database,
      color: "bg-purple-100 dark:bg-purple-900/30",
      suggestions: [
        {
          title: "حالات سريرية للتدريب",
          description: "حالات سريرية حقيقية مع إشراف الطبيب",
          details: "- ملفات مجهولة الهوية للدراسة\n- إرشادات خطوة بخطوة\n- تقييم الأداء"
        },
        {
          title: "مكتبة المعرفة",
          description: "موارد تعليمية ومراجع طبية",
          details: "- شروحات بالفيديو\n- الحالات الشهيرة\n- اختبارات تدريبية"
        },
        {
          title: "تتبع التقدم الأكاديمي",
          description: "متابعة مستوى المهارات والكفاءات",
          details: "- درجات الحالات السريرية\n- شهادات المهارات\n- تقييمات المشرفين"
        }
      ]
    },
    {
      category: "للمتخرج",
      icon: Zap,
      color: "bg-orange-100 dark:bg-orange-900/30",
      suggestions: [
        {
          title: "إدارة عيادة خاصة",
          description: "أدوات متقدمة لإدارة العيادة",
          details: "- إدارة المواعيد والمريضى\n- فواتير ودفعات\n- تقارير الأداء"
        },
        {
          title: "البحث والتطوير",
          description: "أدوات بحثية للدراسات الإكلينيكية",
          details: "- قوالب دراسات معتمدة\n- تحليل البيانات\n- النشر الأكاديمي"
        },
        {
          title: "التعاون مع المستشفى",
          description: "فرص للعمل والتدريب المستمر",
          details: "- برامج ماجستير\n- ورش عمل متخصصة\n- فرص عمل"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SquareCode className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Dentocad</h1>
            <p className="text-muted-foreground text-lg">نظام إدارة العيادات الذكي</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="للمريض" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="للمريض">🏥 المريض</TabsTrigger>
          <TabsTrigger value="للطبيب">👨‍⚕️ الطبيب</TabsTrigger>
          <TabsTrigger value="للطالب">📚 الطالب</TabsTrigger>
          <TabsTrigger value="للمتخرج">🎓 المتخرج</TabsTrigger>
        </TabsList>

        {features.map((group) => (
          <TabsContent key={group.category} value={group.category} className="mt-6 space-y-4">
            <div className="grid gap-4">
              {group.suggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className={`p-3 ${group.color} rounded-lg flex-shrink-0`}>
                          <group.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{suggestion.title}</CardTitle>
                          <CardDescription className="text-base">{suggestion.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        قريباً
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-line text-muted-foreground">
                        {suggestion.details}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            خارطة الطريق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">المرحلة الأولى</Badge>
            <div>
              <p className="font-semibold">إدارة المرضى والمواعيد</p>
              <p className="text-sm text-muted-foreground">نظام شامل لإدارة المواعيد والملفات الطبية</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline">المرحلة الثانية</Badge>
            <div>
              <p className="font-semibold">الذكاء الاصطناعي والتحليلات</p>
              <p className="text-sm text-muted-foreground">تحليل البيانات والتنبؤات الذكية</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline">المرحلة الثالثة</Badge>
            <div>
              <p className="font-semibold">التكامل مع الأنظمة الصحية</p>
              <p className="text-sm text-muted-foreground">التكامل مع المستشفيات والعيادات الأخرى</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
