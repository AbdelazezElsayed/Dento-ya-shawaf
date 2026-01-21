import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Hospital, FileText, Star } from "lucide-react";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const symptomsMap: Record<string, string[]> = {
    "ألم": ["د. محمد أحمد", "د. فاطمة علي"],
    "تسوس": ["د. فاطمة علي", "د. محمد أحمد"],
    "تبييض": ["د. سارة حسن"],
    "تقويم": ["د. محمد أحمد"],
    "لثة": ["د. فاطمة علي"],
    "زراعة": ["د. علي محمود"],
  };

  const doctors = [
    { id: "1", name: "د. محمد أحمد", specialization: "تشخيص وأشعة", clinic: "التشخيص والأشعة", rating: 4.8, symptoms: ["ألم", "تقويم", "تسوس"] },
    { id: "2", name: "د. فاطمة علي", specialization: "علاج تحفظي", clinic: "العلاج التحفظي", rating: 4.9, symptoms: ["تسوس", "لثة", "ألم"] },
    { id: "3", name: "د. سارة حسن", specialization: "تجميل وتبييض", clinic: "تجميل الأسنان", rating: 4.7, symptoms: ["تبييض"] },
    { id: "4", name: "د. علي محمود", specialization: "جراحة", clinic: "جراحة الفم والفكين", rating: 4.6, symptoms: ["زراعة", "خلع"] },
  ];

  const clinics = [
    { id: "1", name: "التشخيص والأشعة", doctors: 5, patients: 1200 },
    { id: "2", name: "العلاج التحفظي", doctors: 4, patients: 980 },
    { id: "3", name: "تجميل الأسنان", doctors: 3, patients: 650 },
  ];

  const articles = [
    { id: "1", title: "كيفية العناية بأسنانك", category: "نصائح طبية", date: "2025-11-20" },
    { id: "2", title: "الفرق بين تقويم الأسنان والتبييض", category: "معلومات طبية", date: "2025-11-15" },
    { id: "3", title: "أسباب تسوس الأسنان وعلاجه", category: "نصائح طبية", date: "2025-11-10" },
  ];

  const filteredDoctors = doctors.filter(doc => {
    const matchesName = doc.name.includes(searchTerm);
    const matchesSpecialization = doc.specialization.includes(searchTerm);
    const matchesSymptom = doc.symptoms?.some(s => s.includes(searchTerm));
    return matchesName || matchesSpecialization || matchesSymptom;
  });

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.includes(searchTerm)
  );

  const filteredArticles = articles.filter(article =>
    article.title.includes(searchTerm) || article.category.includes(searchTerm)
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term && !searchHistory.includes(term)) {
      setSearchHistory([term, ...searchHistory].slice(0, 5));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">🔍 محرك البحث</h1>
        <p className="text-muted-foreground text-lg">ابحث عن أطباء وعيادات ومعلومات طبية</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="ابحث عن أطباء أو عيادات أو معلومات..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          className="pl-10"
          data-testid="input-search"
        />
        
        {/* Search History */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-10 p-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1">السجل</p>
            {searchHistory.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(term)}
                className="w-full text-right px-3 py-2 hover:bg-muted rounded text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">نتائج البحث</p>
            <p className="text-3xl font-bold">
              {filteredDoctors.length + filteredClinics.length + filteredArticles.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">أطباء متاحين</p>
            <p className="text-3xl font-bold text-blue-600">{filteredDoctors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">عيادات</p>
            <p className="text-3xl font-bold text-green-600">{filteredClinics.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="doctors">الأطباء</TabsTrigger>
          <TabsTrigger value="clinics">العيادات</TabsTrigger>
          <TabsTrigger value="articles">مقالات</TabsTrigger>
        </TabsList>

        {/* All Results */}
        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredDoctors.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">الأطباء</h3>
              <div className="space-y-2">
                {filteredDoctors.map(doc => (
                  <Card key={doc.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{doc.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredClinics.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">العيادات</h3>
              <div className="space-y-2">
                {filteredClinics.map(clinic => (
                  <Card key={clinic.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Hospital className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{clinic.name}</p>
                          <p className="text-xs text-muted-foreground">{clinic.doctors} أطباء</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{clinic.patients} مريض</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredArticles.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">مقالات</h3>
              <div className="space-y-2">
                {filteredArticles.map(article => (
                  <Card key={article.id} className="cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold">{article.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{article.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{article.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="mt-6 space-y-2">
          {filteredDoctors.map(doc => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">{doc.clinic}</p>
                </div>
                <Button size="sm" data-testid={`button-book-${doc.id}`}>احجز</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="mt-6 space-y-2">
          {filteredClinics.map(clinic => (
            <Card key={clinic.id}>
              <CardContent className="p-4">
                <p className="font-semibold">{clinic.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {clinic.doctors} أطباء متخصصين • {clinic.patients} مريض مسجل
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="mt-6 space-y-2">
          {filteredArticles.map(article => (
            <Card key={article.id} className="cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">{article.date}</p>
                  </div>
                  <Badge>{article.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
