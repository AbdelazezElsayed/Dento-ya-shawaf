import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, User, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  };
}

interface TodayAppointmentsPageProps {
  language?: "ar" | "en";
}

export default function TodayAppointmentsPage({ language = "ar" }: TodayAppointmentsPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const translations = {
    ar: {
      title: "مواعيد اليوم",
      noAppointments: "لا توجد مواعيد اليوم",
      patient: "المريض",
      time: "الوقت",
      status: "الحالة",
      markAttended: "تأكيد الحضور",
      markMissed: "لم يحضر",
      scheduled: "مجدول",
      completed: "مكتمل",
      missed: "لم يحضر",
      loading: "جاري التحميل...",
      attendanceConfirmed: "تم تأكيد حضور المريض",
      error: "حدث خطأ",
    },
    en: {
      title: "Today's Appointments",
      noAppointments: "No appointments today",
      patient: "Patient",
      time: "Time",
      status: "Status",
      markAttended: "Confirm Attendance",
      markMissed: "Mark as Missed",
      scheduled: "Scheduled",
      completed: "Completed",
      missed: "Missed",
      loading: "Loading...",
      attendanceConfirmed: "Patient attendance confirmed",
      error: "An error occurred",
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctor/today-appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttended = async (appointmentId: string, clinicId: string = "default") => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/mark-attended`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId }),
      });

      if (response.ok) {
        toast({
          title: t.attendanceConfirmed,
          description: language === "ar" ? "تم إضافة سعر الجلسة للرصيد المستحق" : "Session price added to balance due",
        });
        fetchTodayAppointments();
      }
    } catch (error) {
      toast({
        title: t.error,
        variant: "destructive",
      });
    }
  };

  const handleMarkMissed = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "missed" }),
      });

      if (response.ok) {
        fetchTodayAppointments();
      }
    } catch (error) {
      toast({
        title: t.error,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">{t.completed}</Badge>;
      case "missed":
        return <Badge variant="destructive">{t.missed}</Badge>;
      default:
        return <Badge variant="secondary">{t.scheduled}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
          <CalendarCheck className="h-8 w-8 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-500">{t.noAppointments}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                        {appointment.patient?.fullName || `${t.patient} #${appointment.patientId.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-slate-400 mt-1">{appointment.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(appointment.status)}
                    
                    {appointment.status === "scheduled" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMarkAttended(appointment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          {t.markAttended}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleMarkMissed(appointment.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          {t.markMissed}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
