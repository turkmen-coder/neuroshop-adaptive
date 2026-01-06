import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Brain, Shield, Eye, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const personalityTraits = {
  openness: {
    name: "Deneyime Açıklık",
    description: "Yenilik, sanat ve farklı deneyimlere ilginiz",
    icon: "🎨",
  },
  conscientiousness: {
    name: "Sorumluluk",
    description: "Düzen, planlama ve detaylara dikkat etme eğiliminiz",
    icon: "📋",
  },
  extraversion: {
    name: "Dışadönüklük",
    description: "Sosyal etkileşim ve enerji seviyeniz",
    icon: "🎉",
  },
  agreeableness: {
    name: "Uyumluluk",
    description: "İşbirliği, empati ve yardımseverlik eğiliminiz",
    icon: "🤝",
  },
  neuroticism: {
    name: "Duygusal Denge",
    description: "Stres ve endişe yönetimi (düşük skor daha iyi)",
    icon: "🧘",
  },
};

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: profile } = trpc.personality.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const updateConsentMutation = trpc.personality.updateConsent.useMutation({
    onSuccess: () => {
      toast.success("Tercihleriniz güncellendi");
      utils.personality.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });

  const handleConsentChange = (consentGiven: boolean) => {
    updateConsentMutation.mutate({ consentGiven });
  };

  const handleLogout = () => {
    logout();
    toast.success("Çıkış yapıldı");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <UserIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Profili görüntülemek için giriş yapın</h2>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const dominantTraitName = profile?.dominantTrait 
    ? personalityTraits[profile.dominantTrait]?.name 
    : "Belirleniyor";

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Profilim</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Çıkış Yap
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ad</span>
                  <span className="font-medium">{user.name || "Belirtilmemiş"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rol</span>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "Kullanıcı"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personality Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Alışveriş Karakteriniz</CardTitle>
              </div>
              <CardDescription>
                Davranışlarınıza göre oluşturulan kişilik profiliniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile ? (
                <>
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-4xl mb-2">
                      {profile.dominantTrait ? personalityTraits[profile.dominantTrait]?.icon : "🎯"}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{dominantTraitName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Baskın kişilik özelliğiniz
                    </p>
                    <div className="mt-4">
                      <Badge variant="outline">
                        Güven Skoru: {profile.confidenceScore}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(personalityTraits).map(([key, trait]) => {
                      const score = profile[key as keyof typeof personalityTraits] as number;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{trait.icon}</span>
                              <div>
                                <p className="font-medium text-sm">{trait.name}</p>
                                <p className="text-xs text-muted-foreground">{trait.description}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold">{score}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Kültürel Bağlam:</strong>{" "}
                      {profile.culturalContext === "western" && "Batı"}
                      {profile.culturalContext === "asian" && "Asya"}
                      {profile.culturalContext === "african" && "Afrika"}
                      {profile.culturalContext === "middle_eastern" && "Orta Doğu"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Kişilik profiliniz oluşturuluyor...</p>
                  <p className="text-sm mt-2">Alışveriş yaptıkça profiliniz gelişecek</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Consent */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Gizlilik ve Onay</CardTitle>
              </div>
              <CardDescription>
                Verilerinizin nasıl kullanıldığını kontrol edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="consent">Kişiselleştirilmiş Deneyim</Label>
                  <p className="text-sm text-muted-foreground">
                    Davranışlarınızı analiz ederek size özel öneriler sunalım
                  </p>
                </div>
                <Switch
                  id="consent"
                  checked={profile?.consentGiven || false}
                  onCheckedChange={handleConsentChange}
                  disabled={updateConsentMutation.isPending}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  Veri Şeffaflığı
                </div>
                <p className="text-sm text-muted-foreground">
                  Topladığımız veriler:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Tıklama hızı ve gezinme davranışları</li>
                  <li>Kaydırma hızı ve sayfa derinliği</li>
                  <li>Arama sorguları (anonim)</li>
                  <li>Ürün tercihleri</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Kullanım amacı:</strong> Size daha uygun ürünler önermek ve alışveriş deneyiminizi iyileştirmek
                </p>
              </div>

              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                <p className="text-sm">
                  <strong className="text-primary">Etik Taahhüdümüz:</strong> Verilerinizi asla manipülasyon için kullanmıyoruz. 
                  Özellikle endişe seviyesi yüksek kullanıcılara FOMO (kaçırma korkusu) taktikleri uygulamıyoruz.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Link */}
          {user.role === "admin" && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Admin Paneli</CardTitle>
                <CardDescription>Ürün yönetimi ve analitik</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full">Admin Paneline Git</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
