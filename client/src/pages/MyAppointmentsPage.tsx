import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Phone, X, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Appointment {
  id: string;
  doctor: string;
  clinic: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  type: string;
  price: number;
}

export default function MyAppointmentsPage() {
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      doctor: "د. أحمد محمد",
      clinic: "التشخيص والأشعة",
      date: "2025-12-05",
      time: "10:00 AM",
      status: "upcoming",
      type: "فحص شامل",
      price: 150,
    },
    {
      id: "2",
      doctor: "د. فاطمة علي",
      clinic: "العلاج التحفظي",
      date: "2025-12-08",
      time: "2:30 PM",
      status: "upcoming",
      type: "حشو",
      price: 200,
    },
    {
      id: "3",
      doctor: "د. محمود سالم",
      clinic: "جراحة الفم",
      date: "2025-11-20",
      time: "3:00 PM",
      status: "completed",
      type: "استشارة",
      price: 100,
    },
  ]);

  const [activeTab, setActiveTab] = useState("upcoming");

  const filteredAppointments = appointments.filter(
    (apt) => apt.status.replace("-", "") === activeTab.replace("-", "")
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      case "completed":
        return <Check className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مواعيدي</h1>
        <p className="text-muted-foreground">إدارة وتتبع جميع مواعيدك الطبية</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="completed">المكتملة</TabsTrigger>
          <TabsTrigger value="cancelled">الملغاة</TabsTrigger>
        </TabsList>

        {["upcoming", "completed", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">لا توجد مواعيد {
                    tab === "upcoming" ? "قادمة" : tab === "completed" ? "مكتملة" : "ملغاة"
                  }</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment, idx) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{appointment.doctor}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.clinic}</p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-2">
                            {appointment.status === "upcoming"
                              ? "قادم"
                              : appointment.status === "completed"
                              ? "مكتمل"
                              : "ملغى"}
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{appointment.clinic}</span>
                        </div>
                        <div className="text-sm font-semibold">{appointment.price} ج.م</div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{appointment.type}</p>

                      <div className="flex gap-2">
                        {appointment.status === "upcoming" && (
                          <>
                            <Button size="sm" variant="default" data-testid={`button-reschedule-${appointment.id}`}>
                              إعادة جدولة
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-cancel-${appointment.id}`}>
                              إلغاء
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" data-testid={`button-details-${appointment.id}`}>
                          التفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">نصيحة</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          تذكر: يمكنك إعادة جدولة موعدك قبل 24 ساعة من الموعد المحدد. إذا كان لديك أي استفسار، اتصل بنا على الرقم المرفق.
        </CardContent>
      </Card>
    </div>
  );
}
