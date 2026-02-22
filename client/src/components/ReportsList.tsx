import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Eye, Download, Plus } from "lucide-react";

interface Report {
  id: string;
  title: string;
  patientName: string;
  reportType: "diagnosis" | "progress" | "final";
  createdBy: string;
  date: string;
}

interface ReportsListProps {
  onViewReport?: (reportId: string) => void;
  onAddReport?: () => void;
}

export default function ReportsList({ onViewReport, onAddReport }: ReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const reports: Report[] = [
    {
      id: "1",
      title: "تقرير التشخيص الأولي",
      patientName: "أحمد محمد علي",
      reportType: "diagnosis",
      createdBy: "د. محمد حسن",
      date: "2025-10-28",
    },
    {
      id: "2",
      title: "تقرير متابعة العلاج",
      patientName: "فاطمة حسن إبراهيم",
      reportType: "progress",
      createdBy: "د. سارة أحمد",
      date: "2025-10-27",
    },
    {
      id: "3",
      title: "التقرير النهائي للعلاج",
      patientName: "محمود سعيد خالد",
      reportType: "final",
      createdBy: "د. خالد يوسف",
      date: "2025-10-26",
    },
    {
      id: "4",
      title: "تقرير الأشعة التشخيصية",
      patientName: "نورا عبدالله محمد",
      reportType: "diagnosis",
      createdBy: "د. محمد حسن",
      date: "2025-10-25",
    },
  ];

  const filteredReports = reports.filter(
    (report) =>
      report.title.includes(searchTerm) ||
      report.patientName.includes(searchTerm)
  );

  const getReportTypeBadge = (type: Report["reportType"]) => {
    const variants = {
      diagnosis: { label: "تشخيص", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
      progress: { label: "متابعة", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
      final: { label: "نهائي", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    };
    return variants[type];
  };

  return (
    <Card data-testid="card-reports">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">التقارير الطبية</CardTitle>
            <CardDescription>جميع التقارير الطبية للمرضى</CardDescription>
          </div>
          <Button onClick={() => {
            onAddReport?.();
          }} data-testid="button-add-report">
            <Plus className="h-4 w-4 ml-2" />
            إضافة تقرير
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في التقارير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            data-testid="input-search-report"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const typeBadge = getReportTypeBadge(report.reportType);
            return (
              <Card key={report.id} className="hover-elevate" data-testid={`card-report-${report.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          المريض: {report.patientName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>بواسطة: {report.createdBy}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                          <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onViewReport?.(report.id);
                        }}
                        data-testid={`button-view-report-${report.id}`}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewReport?.(report.id)}
                        data-testid={`button-download-report-${report.id}`}
                      >
                        <Download className="h-4 w-4 ml-1" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
