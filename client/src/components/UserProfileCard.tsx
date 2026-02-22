import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface UserProfileCardProps {
  name: string;
  userType: "patient" | "doctor" | "student" | "graduate";
  email?: string;
  phone?: string;
  joinDate?: string;
}

export default function UserProfileCard({
  name,
  userType,
  email,
  phone,
  joinDate,
}: UserProfileCardProps) {
  const userTypeLabels = {
    patient: "مريض",
    doctor: "دكتور",
    student: "طالب",
    graduate: "متخرج",
  };

  const userTypeColors = {
    patient: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    doctor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    student: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    graduate: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover-elevate" data-testid="card-user-profile">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-xl font-bold" data-testid="text-user-name">{name}</h3>
              <Badge className={userTypeColors[userType]}>
                {userTypeLabels[userType]}
              </Badge>
            </div>
            <div className="space-y-2">
              {email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span dir="ltr">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{phone}</span>
                </div>
              )}
              {joinDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ التسجيل: {joinDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
