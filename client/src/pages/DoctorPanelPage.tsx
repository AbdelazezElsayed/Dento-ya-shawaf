import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, CheckCircle, AlertCircle, Edit, Trash2 } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
}

interface DoctorSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export default function DoctorPanelPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "محمد علي",
      date: "2025-11-25",
      time: "10:00 AM",
      duration: 30,
      status: "confirmed",
      notes: "فحص شامل",
    },
    {
      id: "2",
      patientName: "فاطمة أحمد",
      date: "2025-11-28",
      time: "2:00 PM",
      duration: 45,
      status: "pending",
      notes: "حشو الضرس",
    },
    {
      id: "3",
      patientName: "سارة حسن",
      date: "2025-12-02",
      time: "11:00 AM",
      duration: 60,
      status: "confirmed",
      notes: "تبييض الأسنان",
    },
  ]);

  const [schedule, setSchedule] = useState<DoctorSchedule[]>([
    { day: "السبت", startTime: "09:00", endTime: "17:00" },
    { day: "الأحد", startTime: "09:00", endTime: "17:00" },
    { day: "الاثنين", startTime: "09:00", endTime: "17:00" },
    { day: "الثلاثاء", startTime: "09:00", endTime: "17:00" },
    { day: "الأربعاء", startTime: "09:00", endTime: "17:00" },
  ]);

  const handleConfirmAppointment = (id: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: "confirmed" as const } : apt
    ));
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: "cancelled" as const } : apt
    ));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">لوحة تحكم الطبيب</h1>
        <p className="text-muted-foreground text-lg">إدارة المواعيد والجدول الزمني</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">إجمالي المواعيد</p>
            <p className="text-3xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">مؤكد</p>
            <p className="text-3xl font-bold text-green-600">{appointments.filter(a => a.status === "confirmed").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">قيد الانتظار</p>
            <p className="text-3xl font-bold text-yellow-600">{appointments.filter(a => a.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">ملغى</p>
            <p className="text-3xl font-bold text-red-600">{appointments.filter(a => a.status === "cancelled").length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appointments">المواعيد</TabsTrigger>
          <TabsTrigger value="schedule">الجدول الزمني</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-6 space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">لا توجد مواعيد</p>
              </CardContent>
            </Card>
          ) : (
            appointments.map(apt => (
              <Card key={apt.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{apt.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {apt.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {apt.time} - {apt.duration} دقيقة
                        </div>
                        {apt.notes && (
                          <div className="text-sm text-muted-foreground">
                            <strong>ملاحظات:</strong> {apt.notes}
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status === "confirmed" ? "مؤكد" : apt.status === "pending" ? "قيد الانتظار" : "ملغى"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {apt.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleConfirmAppointment(apt.id)}
                            data-testid="button-confirm-appointment"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            تأكيد
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelAppointment(apt.id)}
                            data-testid="button-cancel-appointment"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            رفض
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAppointment(apt.id)}
                        data-testid="button-delete-appointment"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6 space-y-4">
          {schedule.map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{item.day}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.startTime} - {item.endTime}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid={`button-edit-schedule-${idx}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
