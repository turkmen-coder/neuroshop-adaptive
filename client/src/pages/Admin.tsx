import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Edit, Brain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [psychologyDialogOpen, setPsychologyDialogOpen] = useState(false);

  const { data: products, isLoading } = trpc.products.list.useQuery();

  // Psychology scores state
  const [psychScores, setPsychScores] = useState({
    appealsToOpenness: 50,
    appealsToConscientiousness: 50,
    appealsToExtraversion: 50,
    appealsToAgreeableness: 50,
    appealsToNeuroticism: 50,
    mianziScore: 50,
    ubuntuScore: 50,
  });

  const utils = trpc.useUtils();
  const updatePsychologyMutation = trpc.admin.updateProductPsychology.useMutation({
    onSuccess: () => {
      toast.success("Psikolojik etiketler güncellendi");
      setPsychologyDialogOpen(false);
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });

  const handlePsychologyUpdate = () => {
    if (!selectedProduct) return;
    updatePsychologyMutation.mutate({
      productId: selectedProduct,
      ...psychScores,
    });
  };

  const openPsychologyDialog = (productId: number) => {
    setSelectedProduct(productId);
    setPsychologyDialogOpen(true);
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Yetkiniz yok</h2>
          <p className="text-muted-foreground">Bu sayfaya erişim için admin olmalısınız</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Admin Paneli</h1>
          <div className="w-32" />
        </div>

        <div className="grid gap-6">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Aktif Ürün</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.filter((p) => p.isActive).length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Stokta Ürün</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products?.filter((p) => p.stock > 0).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ürün Yönetimi</CardTitle>
                  <CardDescription>
                    Ürünleri düzenleyin ve psikolojik etiketleme yapın
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Ürün
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                            Yok
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {product.category} • Stok: {product.stock}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold">₺{Number(product.price).toFixed(2)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPsychologyDialog(product.id)}
                        >
                          <Brain className="mr-2 h-4 w-4" />
                          Psikolojik Etiketler
                        </Button>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Henüz ürün bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Psychology Dialog */}
      <Dialog open={psychologyDialogOpen} onOpenChange={setPsychologyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Psikolojik Etiketleme</DialogTitle>
            <DialogDescription>
              Bu ürünün hangi kişilik özelliklerine hitap ettiğini belirleyin (0-100)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Big Five Traits */}
            <div className="space-y-4">
              <h3 className="font-semibold">Big Five Kişilik Özellikleri</h3>

              <div className="space-y-2">
                <Label>Deneyime Açıklık (Openness): {psychScores.appealsToOpenness}</Label>
                <Slider
                  value={[psychScores.appealsToOpenness]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, appealsToOpenness: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Yenilikçi, sanatsal, farklı ürünler
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Sorumluluk (Conscientiousness): {psychScores.appealsToConscientiousness}
                </Label>
                <Slider
                  value={[psychScores.appealsToConscientiousness]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, appealsToConscientiousness: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Düzenli, kaliteli, detaylı ürünler
                </p>
              </div>

              <div className="space-y-2">
                <Label>Dışadönüklük (Extraversion): {psychScores.appealsToExtraversion}</Label>
                <Slider
                  value={[psychScores.appealsToExtraversion]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, appealsToExtraversion: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Sosyal, trend, popüler ürünler
                </p>
              </div>

              <div className="space-y-2">
                <Label>Uyumluluk (Agreeableness): {psychScores.appealsToAgreeableness}</Label>
                <Slider
                  value={[psychScores.appealsToAgreeableness]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, appealsToAgreeableness: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Hediye, topluluk, yardımsever ürünler
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nevrotiklik (Neuroticism): {psychScores.appealsToNeuroticism}</Label>
                <Slider
                  value={[psychScores.appealsToNeuroticism]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, appealsToNeuroticism: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Güvenli, garantili, risk azaltan ürünler
                </p>
              </div>
            </div>

            {/* Cultural Scores */}
            <div className="space-y-4">
              <h3 className="font-semibold">Kültürel Rezonans</h3>

              <div className="space-y-2">
                <Label>Mianzi Skoru (Sosyal İtibar - Asya): {psychScores.mianziScore}</Label>
                <Slider
                  value={[psychScores.mianziScore]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, mianziScore: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Prestij, statü kazandıran ürünler
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ubuntu Skoru (Topluluk - Afrika): {psychScores.ubuntuScore}</Label>
                <Slider
                  value={[psychScores.ubuntuScore]}
                  onValueChange={([value]) =>
                    setPsychScores((prev) => ({ ...prev, ubuntuScore: value }))
                  }
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Aile, topluluk değeri olan ürünler
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPsychologyDialogOpen(false)}
              disabled={updatePsychologyMutation.isPending}
            >
              İptal
            </Button>
            <Button
              onClick={handlePsychologyUpdate}
              disabled={updatePsychologyMutation.isPending}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
