import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft } from "lucide-react";

interface ClinicCardProps {
  id: string;
  name: string;
  description: string;
  patientCount: number;
  activeCount: number;
  icon: React.ReactNode;
  color?: string;
  onViewDetails?: (clinicId: string) => void;
}

export default function ClinicCard({
  id,
  name,
  description,
  patientCount,
  activeCount,
  icon,
  color = "bg-primary/10",
  onViewDetails,
}: ClinicCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-clinic-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1">
            <div className={`p-3 ${color} rounded-lg flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-1">{name}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {patientCount} مريض
              </span>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {activeCount} نشط
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onViewDetails?.(id);
            }}
            data-testid={`button-view-clinic-${id}`}
          >
            عرض التفاصيل
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
