import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Download, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  reason: string;
  status: "active" | "completed";
  notes: string;
}

export default function MedicationsPage() {
  const [medications] = useState<Medication[]>([
    {
      id: "1",
      name: "مضاد حيوي أموكسيسيلين",
      dosage: "500 ملغ",
      frequency: "ثلاث مرات يومياً",
      startDate: "2025-11-20",
      endDate: "2025-12-03",
      prescribedBy: "د. أحمد محمد",
      reason: "عدوى بكتيرية بعد الجراحة",
      status: "active",
      notes: "تناول مع الطعام",
    },
    {
      id: "2",
      name: "مسكن الألم إيبوبروفين",
      dosage: "400 ملغ",
      frequency: "مرتين يومياً",
      startDate: "2025-11-20",
      endDate: "2025-12-03",
      prescribedBy: "د. فاطمة علي",
      reason: "تسكين الألم بعد الحشو",
      status: "active",
      notes: "في حالة الألم الشديد",
    },
    {
      id: "3",
      name: "غسول الفم المضاد للبكتيريا",
      dosage: "15 ملل",
      frequency: "مرتين يومياً",
      startDate: "2025-11-10",
      endDate: "2025-11-24",
      prescribedBy: "د. محمود سالم",
      reason: "تعقيم بعد الجراحة",
      status: "completed",
      notes: "مدة الاستخدام 10 أيام",
    },
  ]);

  const activeMeds = medications.filter((m) => m.status === "active");
  const completedMeds = medications.filter((m) => m.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">أدويتي</h1>
        <p className="text-muted-foreground">تتبع وإدارة الروشتات الطبية الحالية والسابقة</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">الأدوية النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMeds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMeds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الأدوية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medications.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Pill className="h-5 w-5 text-green-600" />
          الأدوية النشطة
        </h2>
        {activeMeds.map((med, idx) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover-elevate border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      الجرعة: {med.dosage} - {med.frequency}
                    </p>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    نشط
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">وصفه من قبل</p>
                    <p className="font-medium">{med.prescribedBy}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">السبب</p>
                    <p className="font-medium">{med.reason}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">تاريخ البداية</p>
                    <p className="font-medium">{med.startDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">تاريخ النهاية</p>
                    <p className="font-medium">{med.endDate}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded mb-4 text-sm">
                  <p className="text-blue-800 dark:text-blue-200">📝 ملاحظات: {med.notes}</p>
                </div>

                <Button size="sm" variant="outline" data-testid={`button-download-med-${med.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  تحميل الروشتة
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {completedMeds.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-gray-600" />
            الأدوية المكتملة
          </h2>
          {completedMeds.map((med) => (
            <Card key={med.id} className="border-l-4 border-l-gray-400 opacity-75">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      الجرعة: {med.dosage} - {med.frequency}
                    </p>
                  </div>
                  <Badge className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300">
                    مكتملة
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
            <AlertCircle className="h-5 w-5" />
            تذكير هام
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-800 dark:text-orange-200">
          تأكد من تناول الأدوية في الأوقات المحددة. إذا واجهت أي آثار جانبية، اتصل بطبيبك فوراً.
        </CardContent>
      </Card>
    </div>
  );
}
