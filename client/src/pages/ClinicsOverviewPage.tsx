import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { clinicsEndpoints } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  MapPin,
  Users,
  Star,
  Calendar,
  ArrowLeft,
  Search,
  Filter,
  Clock,
  DollarSign,
  Award,
  Zap,
  TrendingUp,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  description: string;
  doctorsCount: number;
  rating: number;
  reviews: number;
  waitTime: string;
  minPrice: number;
  maxPrice: number;
  hours: string;
  imageColor: string;
  doctors: string[];
  services: string[];
  location: string;
}

export default function ClinicsOverviewPage({
  onNavigate,
}: {
  onNavigate?: (page: string, clinic?: Clinic) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "wait">("rating");
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [waitTimeFilter, setWaitTimeFilter] = useState<string | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("clinic-favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("clinic-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch clinics from API
  const { data: response, isLoading, error } = useQuery<any>({
    queryKey: ['clinics'],
    queryFn: async () => {
      const res = await clinicsEndpoints.list();
      return res;
    }
  });

  const clinicsData = Array.isArray(response) ? response : (response?.data || []);

  // Map backend data to frontend Clinic interface
  const clinics: Clinic[] = clinicsData.map((clinic: any, index: number) => {
    // Color palette for gradients
    const colors = [
      "from-blue-600 to-blue-400",
      "from-green-600 to-green-400",
      "from-red-600 to-red-400",
      "from-purple-600 to-purple-400",
      "from-amber-600 to-amber-400",
      "from-pink-600 to-pink-400",
      "from-rose-600 to-rose-400",
      "from-cyan-600 to-cyan-400",
      "from-teal-600 to-teal-400",
      "from-indigo-600 to-indigo-400",
      "from-violet-600 to-violet-400",
      "from-orange-600 to-orange-400",
    ];

    return {
      id: clinic.id,
      name: clinic.nameAr || clinic.name,
      specialty: clinic.name,
      description: clinic.description || 'خدمات طبية متخصصة',
      doctorsCount: 0, // TODO: Will be calculated from doctors API
      rating: 4.5, // TODO: Will be calculated from ratings
      reviews: 0,
      waitTime: "20 دقيقة",
      minPrice: 200,
      maxPrice: 1000,
      hours: "8:00 AM - 7:00 PM",
      imageColor: clinic.color || colors[index % colors.length],
      doctors: [],
      services: [],
      location: "الدور الثاني"
    };
  });

  // Parse wait time to minutes
  const getWaitTimeMinutes = (waitTime: string): number => {
    return parseInt(waitTime.split(" ")[0]);
  };

  // Filter clinics
  let filteredClinics = clinics
    .filter(
      (clinic) =>
        clinic.name.includes(searchTerm) ||
        clinic.specialty.includes(searchTerm) ||
        clinic.description.includes(searchTerm)
    )
    .filter((clinic) => {
      if (minPriceFilter && clinic.minPrice < minPriceFilter) return false;
      if (maxPriceFilter && clinic.maxPrice > maxPriceFilter) return false;
      if (ratingFilter && clinic.rating < ratingFilter) return false;
      if (waitTimeFilter) {
        const maxWait = parseInt(waitTimeFilter);
        if (getWaitTimeMinutes(clinic.waitTime) > maxWait) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.minPrice - b.minPrice;
      if (sortBy === "wait") return getWaitTimeMinutes(a.waitTime) - getWaitTimeMinutes(b.waitTime);
      return 0;
    });

  const toggleFavorite = (clinicId: string) => {
    setFavorites((prev) =>
      prev.includes(clinicId)
        ? prev.filter((id) => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">جاري تحميل العيادات...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="font-semibold">حدث خطأ أثناء تحميل البيانات</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-start gap-4 mb-2">
          <button
            onClick={() => onNavigate?.("home")}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition mt-1"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-primary mb-2">العيادات الطبية المتخصصة</h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              استكشف جميع تخصصاتنا واختر العيادة الأنسب لاحتياجاتك الطبية
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-xs relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عيادة أو تخصص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-clinic-search"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900 shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            خيارات البحث والفلترة المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">ترتيب النتائج</label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger data-testid="select-sort-by" className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="اختر الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">التقييم الأعلى</SelectItem>
                  <SelectItem value="price">السعر الأقل</SelectItem>
                  <SelectItem value="wait">وقت الانتظار الأقل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">الحد الأدنى للسعر</label>
              <Select
                value={minPriceFilter?.toString() || "no-limit"}
                onValueChange={(v) => setMinPriceFilter(v && v !== "no-limit" ? parseInt(v) : null)}
              >
                <SelectTrigger data-testid="select-min-price" className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="بدون حد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-limit">بدون حد</SelectItem>
                  <SelectItem value="100">من 100 ج.م</SelectItem>
                  <SelectItem value="300">من 300 ج.م</SelectItem>
                  <SelectItem value="500">من 500 ج.م</SelectItem>
                  <SelectItem value="1000">من 1000 ج.م</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">الحد الأقصى للسعر</label>
              <Select
                value={maxPriceFilter?.toString() || "no-limit"}
                onValueChange={(v) => setMaxPriceFilter(v && v !== "no-limit" ? parseInt(v) : null)}
              >
                <SelectTrigger data-testid="select-max-price" className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="بدون حد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-limit">بدون حد</SelectItem>
                  <SelectItem value="500">حتى 500 ج.م</SelectItem>
                  <SelectItem value="1000">حتى 1000 ج.م</SelectItem>
                  <SelectItem value="2000">حتى 2000 ج.م</SelectItem>
                  <SelectItem value="3500">حتى 3500 ج.م</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">التقييم الأدنى</label>
              <Select
                value={ratingFilter?.toString() || "all"}
                onValueChange={(v) => setRatingFilter(v && v !== "all" ? parseFloat(v) : null)}
              >
                <SelectTrigger data-testid="select-rating" className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="4.9">4.9 ⭐ و أعلى</SelectItem>
                  <SelectItem value="4.8">4.8 ⭐ و أعلى</SelectItem>
                  <SelectItem value="4.7">4.7 ⭐ و أعلى</SelectItem>
                  <SelectItem value="4.5">4.5 ⭐ و أعلى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">وقت الانتظار</label>
              <Select
                value={waitTimeFilter || "all"}
                onValueChange={(v) => setWaitTimeFilter(v && v !== "all" ? v : null)}
              >
                <SelectTrigger data-testid="select-wait-time" className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="15">أقل من 15 دقيقة</SelectItem>
                  <SelectItem value="20">أقل من 20 دقيقة</SelectItem>
                  <SelectItem value="30">أقل من 30 دقيقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full gap-1 grid-cols-4 bg-blue-100 dark:bg-blue-950/50 p-1 rounded-lg">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">الجميع ({filteredClinics.length})</TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">المفضلة ({favorites.length})</TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">الأكثر تقييماً</TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">الأسعار المنخفضة</TabsTrigger>
        </TabsList>

        {/* All Clinics */}
        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredClinics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">لا توجد عيادات تطابق معايير البحث</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClinics.map((clinic) => (
                <Card
                  key={clinic.id}
                  className="cursor-pointer hover-elevate transition-all overflow-hidden shadow-sm hover:shadow-md"
                  onClick={() => onNavigate?.(`clinic/${clinic.id}`, clinic)}
                  data-testid={`card-clinic-${clinic.id}`}
                >
                  {/* Header with gradient */}
                  <div
                    className={`h-32 bg-gradient-to-br ${clinic.imageColor} relative flex items-end p-4`}
                  >
                    <button
                      onClick={() => toggleFavorite(clinic.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full hover:bg-white dark:hover:bg-slate-700 transition"
                      data-testid={`button-favorite-${clinic.id}`}
                    >
                      <Heart
                        className={`h-5 w-5 ${favorites.includes(clinic.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                          }`}
                      />
                    </button>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1">{clinic.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {clinic.specialty}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-sm border-t pt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-yellow-700 dark:text-yellow-400">{clinic.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({clinic.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">{clinic.doctorsCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium">{clinic.waitTime}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {clinic.minPrice} - {clinic.maxPrice} ج.م
                      </span>
                    </div>

                    {/* Services preview */}
                    <div className="flex gap-1 flex-wrap">
                      {clinic.services.slice(0, 2).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {clinic.services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{clinic.services.length - 2} خدمات
                        </Badge>
                      )}
                    </div>

                    {/* Feature Badges */}
                    <div className="flex gap-1 flex-wrap pt-2">
                      <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                        <Award className="h-3 w-3" />
                        معتمدة
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                        <Zap className="h-3 w-3" />
                        سريعة
                      </Badge>
                      {clinic.rating >= 4.7 && (
                        <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          ممتازة
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onNavigate?.(`clinic/${clinic.id}`, clinic)}
                        data-testid={`button-view-clinic-${clinic.id}`}
                      >
                        عرض التفاصيل
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onNavigate?.("appointments")}
                        data-testid={`button-book-${clinic.id}`}
                      >
                        حجز موعد
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites" className="mt-6 space-y-4">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">لا توجد عيادات مفضلة حالياً</p>
                <p className="text-sm text-muted-foreground mt-2">أضف عيادة للمفضلات بالنقر على قلب ❤️</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clinics
                .filter((c) => favorites.includes(c.id))
                .map((clinic) => (
                  <Card key={clinic.id} data-testid={`card-favorite-${clinic.id}`}>
                    <div
                      className={`h-24 bg-gradient-to-r ${clinic.imageColor}`}
                    />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{clinic.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {clinic.specialty}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(clinic.id)}
                          data-testid={`button-remove-favorite-${clinic.id}`}
                        >
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="destructive" className="text-xs">
                          مفضل
                        </Badge>
                        <span className="text-sm font-semibold">
                          {clinic.rating} ⭐
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Popular */}
        <TabsContent value="popular" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinics
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 6)
              .map((clinic) => (
                <Card key={clinic.id}>
                  <div
                    className={`h-20 bg-gradient-to-r ${clinic.imageColor}`}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold flex-1">{clinic.name}</h3>
                      <Badge className="ml-2">
                        {clinic.rating}⭐
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {clinic.reviews} تقييم
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Lowest Prices */}
        <TabsContent value="services" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinics
              .sort((a, b) => a.minPrice - b.minPrice)
              .slice(0, 6)
              .map((clinic) => (
                <Card key={clinic.id}>
                  <div
                    className={`h-20 bg-gradient-to-r ${clinic.imageColor}`}
                  />
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{clinic.name}</h3>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        من {clinic.minPrice} ج.م
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
