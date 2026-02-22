import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle, AlertCircle, Phone, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface QueuePatient {
  id: string;
  name: string;
  appointmentTime: string;
  arrivalTime: string;
  status: "waiting" | "in-treatment" | "completed";
  treatmentType: string;
  estimatedWait: number;
}

export default function PatientQueuePage() {
  const [queue] = useState<QueuePatient[]>([
    {
      id: "1",
      name: "محمد أحمد",
      appointmentTime: "10:00",
      arrivalTime: "10:05",
      status: "in-treatment",
      treatmentType: "فحص شامل",
      estimatedWait: 15,
    },
    {
      id: "2",
      name: "فاطمة علي",
      appointmentTime: "10:30",
      arrivalTime: "10:28",
      status: "waiting",
      treatmentType: "حشو",
      estimatedWait: 45,
    },
    {
      id: "3",
      name: "أحمد محمود",
      appointmentTime: "11:00",
      arrivalTime: "---",
      status: "waiting",
      treatmentType: "تنظيف",
      estimatedWait: 75,
    },
    {
      id: "4",
      name: "سارة خالد",
      appointmentTime: "11:30",
      arrivalTime: "---",
      status: "waiting",
      treatmentType: "استشارة",
      estimatedWait: 105,
    },
    {
      id: "5",
      name: "علي محمد",
      appointmentTime: "09:30",
      arrivalTime: "09:35",
      status: "completed",
      treatmentType: "فحص",
      estimatedWait: 0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-treatment":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "waiting":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-treatment":
        return <AlertCircle className="h-4 w-4" />;
      case "waiting":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in-treatment":
        return "قيد المعالجة";
      case "waiting":
        return "في الانتظار";
      case "completed":
        return "مكتمل";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">قائمة المرضى اليوم</h1>
        <p className="text-muted-foreground">إدارة المرضى المتوقعين والحالية</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المرضى
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queue.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد المعالجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {queue.filter((q) => q.status === "in-treatment").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {queue.filter((q) => q.status === "waiting").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {queue.filter((q) => q.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {queue
          .filter((q) => q.status !== "completed")
          .map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`hover-elevate border-l-4 ${
                  patient.status === "in-treatment"
                    ? "border-l-blue-500"
                    : "border-l-yellow-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {patient.name.split(" ")[0][0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <Badge className={getStatusColor(patient.status)}>
                          {getStatusIcon(patient.status)}
                          <span className="ml-1">{getStatusLabel(patient.status)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {patient.treatmentType}
                      </p>
                    </div>

                    <div className="text-center mr-4">
                      <div className="text-2xl font-bold text-primary">
                        {patient.estimatedWait}
                      </div>
                      <p className="text-xs text-muted-foreground">دقيقة</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-call-patient-${patient.id}`}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      {patient.status === "waiting" && (
                        <Button
                          size="sm"
                          variant="default"
                          data-testid={`button-start-treatment-${patient.id}`}
                        >
                          بدء المعالجة
                        </Button>
                      )}
                      {patient.status === "in-treatment" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          data-testid={`button-complete-treatment-${patient.id}`}
                        >
                          إكمال
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      الموعد: {patient.appointmentTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      الوصول: {patient.arrivalTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {queue.filter((q) => q.status === "completed").length > 0 && (
        <div className="space-y-3 opacity-50">
          <h2 className="text-lg font-semibold">المكتملة</h2>
          {queue
            .filter((q) => q.status === "completed")
            .map((patient) => (
              <Card key={patient.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {patient.name.split(" ")[0][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{patient.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {patient.treatmentType}
                      </p>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      مكتمل
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
