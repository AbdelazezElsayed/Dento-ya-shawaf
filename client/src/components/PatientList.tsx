import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, FileText, Calendar } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  status: "active" | "completed" | "pending";
  lastVisit: string;
}

interface PatientListProps {
  clinicName?: string;
  onViewPatient?: (patientId: string) => void;
}

export default function PatientList({ clinicName = "التشخيص والأشعة", onViewPatient }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const patients: Patient[] = [
    { id: "1", name: "أحمد محمد علي", age: 35, phone: "0100-123-4567", status: "active", lastVisit: "2025-10-28" },
    { id: "2", name: "فاطمة حسن إبراهيم", age: 28, phone: "0111-234-5678", status: "pending", lastVisit: "2025-10-25" },
    { id: "3", name: "محمود سعيد خالد", age: 42, phone: "0122-345-6789", status: "active", lastVisit: "2025-10-30" },
    { id: "4", name: "نورا عبدالله محمد", age: 31, phone: "0101-456-7890", status: "completed", lastVisit: "2025-10-20" },
    { id: "5", name: "خالد يوسف أحمد", age: 55, phone: "0112-567-8901", status: "active", lastVisit: "2025-10-29" },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.includes(searchTerm) || patient.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: Patient["status"]) => {
    const variants = {
      active: { label: "نشط", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
      pending: { label: "معلق", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
      completed: { label: "مكتمل", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
    };
    return variants[status];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-2xl">قائمة المرضى - {clinicName}</CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن مريض..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search-patient"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم المريض</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">العمر</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">آخر زيارة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const statusBadge = getStatusBadge(patient.status);
                return (
                  <TableRow key={patient.id} data-testid={`row-patient-${patient.id}`}>
                    <TableCell className="font-medium" data-testid={`text-patient-id-${patient.id}`}>
                      #{patient.id}
                    </TableCell>
                    <TableCell data-testid={`text-patient-name-${patient.id}`}>{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell dir="ltr" className="text-right">{patient.phone}</TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-start">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onViewPatient?.(patient.id);
                          }}
                          data-testid={`button-view-patient-${patient.id}`}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewPatient?.(patient.id)}
                          data-testid={`button-treatment-${patient.id}`}
                        >
                          <Calendar className="h-4 w-4 ml-1" />
                          الخطة
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewPatient?.(patient.id)}
                          data-testid={`button-reports-${patient.id}`}
                        >
                          <FileText className="h-4 w-4 ml-1" />
                          التقارير
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
