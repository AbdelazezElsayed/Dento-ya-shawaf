import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Smartphone,
  Wallet,
  Zap,
  Tag,
} from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  doctor?: string;
}

export default function PaymentPageNew() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [installmentMonths, setInstallmentMonths] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV001",
      date: "2025-10-15",
      service: "فحص عام وأشعات سينية",
      amount: 250,
      status: "paid",
      doctor: "د. محمد أحمد",
    },
    {
      id: "INV002",
      date: "2025-10-28",
      service: "جلسة تنظيف عميق",
      amount: 150,
      status: "paid",
      doctor: "د. فاطمة علي",
    },
    {
      id: "INV003",
      date: "2025-11-10",
      service: "حشو تجميلي - ضرسين",
      amount: 400,
      status: "pending",
      doctor: "د. فاطمة علي",
    },
  ]);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [saveCard, setSaveCard] = useState(false);

  const discountCodes: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    WELCOME5: 5,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return { variant: "default" as const, label: "✓ مدفوع", color: "bg-green-100 dark:bg-green-900/30" };
      case "pending":
        return { variant: "secondary" as const, label: "⏳ قيد الانتظار", color: "bg-yellow-100 dark:bg-yellow-900/30" };
      case "overdue":
        return { variant: "destructive" as const, label: "✕ متأخر", color: "bg-red-100 dark:bg-red-900/30" };
      default:
        return { variant: "outline" as const, label: "معروف", color: "" };
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);

  const applyDiscount = (code: string) => {
    if (discountCodes[code]) {
      setDiscountPercent(discountCodes[code]);
      setDiscountApplied(true);
    } else {
      setDiscountApplied(false);
      setDiscountPercent(0);
      alert("كود الخصم غير صحيح!");
    }
  };

  const filteredInvoices = invoices.filter((inv) =>
    filterStatus === "all" ? true : inv.status === filterStatus
  );

  // Payment Plans Calculation
  const getInstallmentPlan = (amount: number, months: number) => {
    const monthlyPayment = amount / months;
    const interest = amount * 0.02; // 2% interest
    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalWithInterest: amount + interest,
      totalInterest: interest,
      months,
    };
  };

  const selectedInvoiceAmount = pendingAmount;
  const plan = getInstallmentPlan(selectedInvoiceAmount, installmentMonths);

  // Calculate discount
  const discountedAmount = selectedInvoiceAmount - (selectedInvoiceAmount * discountPercent) / 100;
  const discountedMonthly = getInstallmentPlan(discountedAmount, installmentMonths).monthlyPayment;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">الفواتير والدفع</h1>
        <p className="text-muted-foreground text-lg">إدارة فواتيرك ودفع الخدمات بسهولة</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-3xl font-bold text-primary">{totalAmount} ج.م</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المدفوع</p>
                <p className="text-3xl font-bold text-green-600">{paidAmount} ج.م</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المتبقي</p>
                <p className="text-3xl font-bold text-red-600">{pendingAmount} ج.م</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">الفواتير ({filteredInvoices.length})</TabsTrigger>
          <TabsTrigger value="payment">الدفع</TabsTrigger>
          <TabsTrigger value="plans">خطط الدفع</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "paid", "pending", "overdue"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                data-testid={`button-filter-${status}`}
              >
                {status === "all"
                  ? "جميع الفواتير"
                  : status === "paid"
                  ? "مدفوعة"
                  : status === "pending"
                  ? "قيد الانتظار"
                  : "متأخرة"}
              </Button>
            ))}
          </div>

          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">لا توجد فواتير</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const statusInfo = getStatusBadge(invoice.status);
                return (
                  <Card key={invoice.id} data-testid={`card-invoice-${invoice.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">{invoice.service}</h3>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.doctor} • {invoice.date}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-primary">{invoice.amount} ج.م</p>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-${invoice.id}`}>
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" data-testid={`button-download-${invoice.id}`}>
                          <Download className="h-4 w-4 ml-2" />
                          تحميل PDF
                        </Button>
                        {invoice.status === "pending" && (
                          <Button size="sm" className="flex-1" data-testid={`button-pay-${invoice.id}`}>
                            ادفع الآن
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="mt-6 space-y-6">
          {selectedInvoiceAmount > 0 ? (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>دفع الفواتير المعلقة</CardTitle>
                <CardDescription>
                  المبلغ المتبقي: {selectedInvoiceAmount} ج.م
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Discount Code */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    كود الخصم (اختياري)
                  </label>
                  <div className="flex gap-2">
                    <Select value={discountCode} onValueChange={setDiscountCode}>
                      <SelectTrigger data-testid="select-discount">
                        <SelectValue placeholder="اختر كود خصم" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(discountCodes).map((code) => (
                          <SelectItem key={code} value={code}>
                            {code} ({discountCodes[code]}% خصم)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => applyDiscount(discountCode)}
                      disabled={!discountCode}
                      data-testid="button-apply-discount"
                    >
                      تطبيق
                    </Button>
                  </div>
                  {discountApplied && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 dark:text-green-400">
                        تم تطبيق خصم بنسبة {discountPercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">طريقة الدفع</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          بطاقة ائتمان
                        </div>
                      </SelectItem>
                      <SelectItem value="wallet">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          محفظة رقمية
                        </div>
                      </SelectItem>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          تحويل بنكي
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Card Details */}
                {paymentMethod === "credit-card" && (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/20 rounded">
                    <Input
                      placeholder="رقم البطاقة"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      data-testid="input-card-number"
                    />
                    <Input
                      placeholder="اسم حامل البطاقة"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      data-testid="input-card-holder"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        data-testid="input-expiry"
                      />
                      <Input
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        data-testid="input-cvv"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-4 h-4"
                        data-testid="checkbox-save-card"
                      />
                      <label htmlFor="saveCard" className="text-sm">
                        حفظ البطاقة للمستقبل
                      </label>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <Card className="bg-primary/5 dark:bg-primary/10">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الإجمالي الأصلي:</span>
                      <span>{selectedInvoiceAmount} ج.م</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>الخصم ({discountPercent}%):</span>
                        <span>-{Math.round((selectedInvoiceAmount * discountPercent) / 100)} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>المبلغ النهائي:</span>
                      <span className="text-primary">
                        {discountedAmount} ج.م
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => alert("تم معالجة الدفع بنجاح!")}
                  data-testid="button-complete-payment"
                >
                  <Smartphone className="h-5 w-5 ml-2" />
                  اكمل الدفع ({discountedAmount} ج.م)
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                <p className="text-lg font-semibold mb-2">جميع الفواتير مدفوعة!</p>
                <p className="text-muted-foreground">لا توجد فواتير معلقة للدفع</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Plans Tab */}
        <TabsContent value="plans" className="mt-6 space-y-6">
          {selectedInvoiceAmount > 0 ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-semibold">اختر مدة الخطة</label>
                <Select value={installmentMonths.toString()} onValueChange={(v) => setInstallmentMonths(parseInt(v))}>
                  <SelectTrigger data-testid="select-installment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">دفعة واحدة</SelectItem>
                    <SelectItem value="3">3 أشهر</SelectItem>
                    <SelectItem value="6">6 أشهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plan Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { months: 1, label: "دفعة فورية" },
                  { months: 3, label: "3 أقساط" },
                  { months: 6, label: "6 أقساط" },
                ].map((option) => {
                  const optionPlan = getInstallmentPlan(selectedInvoiceAmount, option.months);
                  const optionDiscountedMonthly = getInstallmentPlan(discountedAmount, option.months).monthlyPayment;
                  return (
                    <Card
                      key={option.months}
                      className={`cursor-pointer transition ${
                        installmentMonths === option.months
                          ? "border-primary border-2 bg-primary/5 dark:bg-primary/10"
                          : ""
                      }`}
                      onClick={() => setInstallmentMonths(option.months)}
                      data-testid={`card-plan-${option.months}`}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <h3 className="font-bold text-lg">{option.label}</h3>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-primary">
                            {discountApplied ? optionDiscountedMonthly : optionPlan.monthlyPayment} ج.م
                          </p>
                          <p className="text-xs text-muted-foreground">شهرياً</p>
                        </div>
                        <div className="text-sm space-y-1 pt-3 border-t">
                          <p>
                            الإجمالي:{" "}
                            <span className="font-semibold">
                              {discountApplied ? discountedAmount : selectedInvoiceAmount} ج.م
                            </span>
                          </p>
                          {option.months > 1 && (
                            <p className="text-xs text-muted-foreground">
                              (فائدة 2%: +{Math.round(optionPlan.totalInterest)} ج.م)
                            </p>
                          )}
                        </div>
                        {installmentMonths === option.months && (
                          <Badge className="w-full justify-center">مختار</Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Select Plan Summary */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <p className="text-sm mb-2">
                    <span className="font-semibold">الخطة المختارة:</span> {installmentMonths} شهر
                  </p>
                  <div className="text-lg font-bold text-primary">
                    {discountApplied ? discountedMonthly : plan.monthlyPayment} ج.م شهرياً
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    استطيع تغيير الخطة في أي وقت من إعدادات الدفع
                  </p>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full" data-testid="button-select-plan">
                اختيار هذه الخطة
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                <p className="text-lg font-semibold">لا توجد فواتير معلقة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
