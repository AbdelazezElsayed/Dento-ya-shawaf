import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: boolean;
}

export default function DoctorSchedulePage() {
  const [schedule] = useState<ScheduleSlot[]>([
    {
      id: "1",
      day: "السبت",
      startTime: "09:00",
      endTime: "12:00",
      capacity: 8,
      booked: 6,
      available: true,
    },
    {
      id: "2",
      day: "السبت",
      startTime: "14:00",
      endTime: "17:00",
      capacity: 8,
      booked: 8,
      available: false,
    },
    {
      id: "3",
      day: "الأحد",
      startTime: "09:00",
      endTime: "12:00",
      capacity: 8,
      booked: 3,
      available: true,
    },
    {
      id: "4",
      day: "الأحد",
      startTime: "14:00",
      endTime: "17:00",
      capacity: 8,
      booked: 5,
      available: true,
    },
    {
      id: "5",
      day: "الإثنين",
      startTime: "09:00",
      endTime: "12:00",
      capacity: 8,
      booked: 7,
      available: true,
    },
  ]);

  const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">جدول المواعيد</h1>
          <p className="text-muted-foreground">
            إدارة وتعديل جدول العمل والمواعيد المتاحة
          </p>
        </div>
        <Button data-testid="button-add-schedule">
          <Plus className="h-4 w-4 mr-2" />
          إضافة وقت جديد
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الفترات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedule.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الفترات الممتلئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {schedule.filter((s) => !s.available).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي السعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedule.reduce((sum, s) => sum + s.capacity, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المحجوزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {schedule.reduce((sum, s) => sum + s.booked, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {days.map((day, dayIdx) => {
          const daySchedules = schedule.filter((s) => s.day === day);
          return (
            <div key={dayIdx} className="space-y-3">
              <h2 className="text-xl font-semibold">{day}</h2>
              {daySchedules.map((slot, slotIdx) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (dayIdx * 2 + slotIdx) * 0.1 }}
                >
                  <Card
                    className={`hover-elevate ${
                      !slot.available
                        ? "border-l-4 border-l-red-500 opacity-75"
                        : "border-l-4 border-l-green-500"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {slot.startTime} - {slot.endTime}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>
                                {slot.booked} / {slot.capacity} محجوزة
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {slot.capacity - slot.booked}
                            </div>
                            <p className="text-xs text-muted-foreground">متاحة</p>
                          </div>

                          <Badge
                            className={
                              slot.available
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            }
                          >
                            {slot.available ? "متاح" : "ممتلئ"}
                          </Badge>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-edit-schedule-${slot.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              data-testid={`button-delete-schedule-${slot.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${(slot.booked / slot.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
