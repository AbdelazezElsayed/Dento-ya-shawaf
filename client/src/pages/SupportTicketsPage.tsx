import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, AlertCircle, Clock, CheckCircle, TrendingUp, Filter } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: "technical" | "billing" | "appointment" | "general";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "escalated" | "resolved" | "closed";
  createdDate: string;
  responseTime?: string;
  assignedTo?: string;
  resolutionTime?: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TK001",
      title: "مشكلة في تسجيل الدخول",
      description: "لا يمكنني تسجيل الدخول إلى حسابي",
      category: "technical",
      priority: "high",
      status: "in-progress",
      createdDate: "2025-11-20",
      responseTime: "5 دقائق",
      assignedTo: "أحمد محمود"
    },
    {
      id: "TK002",
      title: "سؤال حول الفاتورة",
      description: "أريد معرفة تفاصيل الفاتورة INV001",
      category: "billing",
      priority: "medium",
      status: "resolved",
      createdDate: "2025-11-18",
      responseTime: "2 ساعة",
      resolutionTime: "3 ساعات"
    },
    {
      id: "TK003",
      title: "إلغاء الموعد المتأخر",
      description: "أريد إلغاء موعدي يوم غد",
      category: "appointment",
      priority: "critical",
      status: "escalated",
      createdDate: "2025-11-23",
      responseTime: "15 دقيقة",
      assignedTo: "فاطمة علي"
    }
  ]);

  const [newTicket, setNewTicket] = useState({ title: "", description: "", category: "general", priority: "medium" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }
    const ticket: Ticket = {
      id: `TK${String(tickets.length + 1).padStart(3, "0")}`,
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category as any,
      priority: newTicket.priority as any,
      status: "open",
      createdDate: new Date().toISOString().split("T")[0],
      responseTime: "قيد الانتظار"
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ title: "", description: "", category: "general", priority: "medium" });
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      critical: { variant: "destructive", label: "🔴 حرج" },
      high: { variant: "destructive", label: "🟠 عالي" },
      medium: { variant: "secondary", label: "🟡 متوسط" },
      low: { variant: "default", label: "🟢 منخفض" }
    };
    return variants[priority];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: "outline", label: "📖 مفتوح" },
      "in-progress": { variant: "secondary", label: "⏳ جاري" },
      escalated: { variant: "destructive", label: "⬆ معرّج" },
      resolved: { variant: "default", label: "✓ حل" },
      closed: { variant: "outline", label: "✕ مغلق" }
    };
    return variants[status];
  };

  const avgResponseTime = "2 ساعة 15 دقيقة";
  const openTickets = tickets.filter(t => t.status === "open").length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
  const escalatedTickets = tickets.filter(t => t.status === "escalated").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">🎫 نظام تذاكر الدعم</h1>
        <p className="text-muted-foreground text-lg">أرسل تذكرة دعم وتتبع حالتها مباشرة</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">إجمالي التذاكر</p>
            <p className="text-3xl font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">مفتوحة</p>
            <p className="text-3xl font-bold text-blue-600">{openTickets}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-green-900 dark:text-green-100 mb-2">محلولة</p>
            <p className="text-3xl font-bold text-green-600">{resolvedTickets}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-900 dark:text-orange-100 mb-2">متوسط الاستجابة</p>
            <p className="text-lg font-bold text-orange-600">{avgResponseTime}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">تذكرة جديدة</TabsTrigger>
          <TabsTrigger value="tickets">تذاكري ({tickets.length})</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* New Ticket */}
        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء تذكرة دعم جديدة</CardTitle>
              <CardDescription>اشرح مشكلتك بالتفصيل حتى نتمكن من مساعدتك بشكل أفضل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">الموضوع</label>
                <Input
                  placeholder="مثال: مشكلة في تسجيل الدخول"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  data-testid="input-ticket-title"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">الفئة</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-background"
                  data-testid="select-ticket-category"
                >
                  <option value="technical">🔧 تقني</option>
                  <option value="billing">💰 فاتورة</option>
                  <option value="appointment">📅 موعد</option>
                  <option value="general">❓ عام</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">الأولوية</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-background"
                  data-testid="select-ticket-priority"
                >
                  <option value="low">🟢 منخفضة</option>
                  <option value="medium">🟡 متوسطة</option>
                  <option value="high">🟠 عالية</option>
                  <option value="critical">🔴 حرجة</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">الوصف التفصيلي</label>
                <Textarea
                  placeholder="صف المشكلة بالتفصيل..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full"
                  rows={5}
                  data-testid="textarea-ticket-description"
                />
              </div>

              <Button onClick={handleCreateTicket} className="w-full" data-testid="button-create-ticket">
                <MessageSquare className="h-4 w-4 mr-2" />
                إنشاء التذكرة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="tickets" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              الكل
            </Button>
            <Button
              variant={filterStatus === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("open")}
            >
              مفتوحة
            </Button>
            <Button
              variant={filterStatus === "in-progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("in-progress")}
            >
              جارية
            </Button>
            <Button
              variant={filterStatus === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("resolved")}
            >
              محلولة
            </Button>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const priorityBadge = getPriorityBadge(ticket.priority);
              const statusBadge = getStatusBadge(ticket.status);
              return (
                <Card key={ticket.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm text-muted-foreground">{ticket.id}</p>
                          <Badge variant={priorityBadge.variant} className="status-badge text-xs">
                            {priorityBadge.label}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{ticket.description}</p>
                      </div>
                      <Badge variant={statusBadge.variant} className="status-badge text-xs">
                        {statusBadge.label}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                        <p className="text-sm font-semibold">{ticket.createdDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">وقت الاستجابة</p>
                        <p className="text-sm font-semibold">{ticket.responseTime || "قيد الانتظار"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">معين لـ</p>
                        <p className="text-sm font-semibold">{ticket.assignedTo || "غير معين"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>متوسط وقت الاستجابة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">2h 15m</p>
                <p className="text-sm text-muted-foreground mt-2">↓ 20% هذا الأسبوع</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نسبة الحل</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">85%</p>
                <p className="text-sm text-muted-foreground mt-2">تم حل 85 من 100 تذكرة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التذاكر بالأولوية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <p>حرجة</p>
                  <Badge variant="destructive">{tickets.filter(t => t.priority === "critical").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <p>عالية</p>
                  <Badge variant="destructive">{tickets.filter(t => t.priority === "high").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <p>متوسطة</p>
                  <Badge variant="secondary">{tickets.filter(t => t.priority === "medium").length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات بالفئة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <p>🔧 تقني</p>
                  <Badge>{tickets.filter(t => t.category === "technical").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <p>💰 فاتورة</p>
                  <Badge>{tickets.filter(t => t.category === "billing").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <p>📅 موعد</p>
                  <Badge>{tickets.filter(t => t.category === "appointment").length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
