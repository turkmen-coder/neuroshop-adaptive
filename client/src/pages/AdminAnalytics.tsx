import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, Users, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: themePerformance, isLoading: loadingThemes } = trpc.admin.getThemePerformance.useQuery({ days: 30 });
  const { data: personalityBreakdown, isLoading: loadingBreakdown } = trpc.admin.getPersonalityThemeBreakdown.useQuery({ days: 30 });

  // Redirect if not admin
  if (isAuthenticated && user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Yetkilendirme Gerekli</CardTitle>
            <CardDescription>Bu sayfayı görüntülemek için admin olarak giriş yapmalısınız.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">A/B Test Analitikleri</h1>
                <p className="text-sm text-muted-foreground">Tema performans metrikleri ve kişilik bazlı dönüşüm analizi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam İzlenim</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingThemes ? "..." : themePerformance?.reduce((sum, t) => sum + t.impressions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Son 30 gün</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Dönüşüm</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingThemes ? "..." : themePerformance?.reduce((sum, t) => sum + t.conversions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Sepete ekleme + Satın alma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Dönüşüm Oranı</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingThemes
                  ? "..."
                  : themePerformance && themePerformance.length > 0
                    ? `${(
                        themePerformance.reduce((sum, t) => sum + t.conversionRate, 0) /
                        themePerformance.length
                      ).toFixed(2)}%`
                    : "0.00%"}
              </div>
              <p className="text-xs text-muted-foreground">Tüm temalar ortalaması</p>
            </CardContent>
          </Card>
        </div>

        {/* Theme Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tema Performans Karşılaştırması</CardTitle>
            <CardDescription>Her tema varyasyonunun dönüşüm performansı</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingThemes ? (
              <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
            ) : themePerformance && themePerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Tema</th>
                      <th className="text-right py-3 px-4 font-medium">İzlenim</th>
                      <th className="text-right py-3 px-4 font-medium">Dönüşüm</th>
                      <th className="text-right py-3 px-4 font-medium">Dönüşüm Oranı</th>
                      <th className="text-right py-3 px-4 font-medium">Ort. Değer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {themePerformance.map((theme) => (
                      <tr key={theme.themeVariant} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  theme.themeVariant === "openness"
                                    ? "#8b5cf6"
                                    : theme.themeVariant === "conscientiousness"
                                    ? "#3b82f6"
                                    : theme.themeVariant === "extraversion"
                                    ? "#f59e0b"
                                    : theme.themeVariant === "agreeableness"
                                    ? "#10b981"
                                    : "#ef4444",
                              }}
                            />
                            <span className="font-medium capitalize">{theme.themeVariant}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">{theme.impressions.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{theme.conversions.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`font-semibold ${
                              theme.conversionRate > 5
                                ? "text-green-600"
                                : theme.conversionRate > 2
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {theme.conversionRate.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">₺{theme.avgValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Henüz veri yok. Kullanıcılar siteyi kullanmaya başladıkça veriler toplanacak.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personality-Theme Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Kişilik Tipi - Tema Dönüşüm Matrisi</CardTitle>
            <CardDescription>Hangi kişilik tipinin hangi temada daha iyi dönüşüm yaptığı</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBreakdown ? (
              <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
            ) : personalityBreakdown && personalityBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Kişilik Tipi</th>
                      <th className="text-left py-3 px-4 font-medium">Tema</th>
                      <th className="text-right py-3 px-4 font-medium">İzlenim</th>
                      <th className="text-right py-3 px-4 font-medium">Dönüşüm</th>
                      <th className="text-right py-3 px-4 font-medium">Dönüşüm Oranı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalityBreakdown.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 capitalize font-medium">{item.personalityTrait}</td>
                        <td className="py-3 px-4 capitalize">{item.themeVariant}</td>
                        <td className="text-right py-3 px-4">{item.impressions.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{item.conversions.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`font-semibold ${
                              item.conversionRate > 5
                                ? "text-green-600"
                                : item.conversionRate > 2
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {item.conversionRate.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Henüz veri yok. Kullanıcılar siteyi kullanmaya başladıkça veriler toplanacak.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
