import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Search, User, Brain, Shield, Globe } from "lucide-react";
import { Link } from "wouter";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { addSearchTerm } = useBehaviorTracking();
  const { themeName } = useAdaptiveTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Get personalized products if logged in, otherwise get all products
  const { data: products, isLoading } = isAuthenticated
    ? trpc.products.getPersonalized.useQuery()
    : trpc.products.list.useQuery();

  const { data: cart } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const analyzeQueryMutation = trpc.personality.analyzeSearchQuery.useMutation({
    onSuccess: (data) => {
      // Silently update profile in background
      console.log('Search query analyzed:', data.insights);
    },
    onError: (error) => {
      console.error('Failed to analyze query:', error);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchTerm(searchQuery);
      
      // Analyze search query with Gemini if user is authenticated
      if (isAuthenticated && searchQuery.length > 3) {
        analyzeQueryMutation.mutate({ query: searchQuery });
      }
      
      // TODO: Implement actual search functionality
    }
  };

  const cartItemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <Link href="/">
              <span className="text-xl font-bold">NeuroShop</span>
            </Link>
            {themeName !== "Varsayılan" && (
              <Badge variant="outline" className="ml-2">
                {themeName}
              </Badge>
            )}
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ürün ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Giriş Yap</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Size Özel Alışveriş Deneyimi
            </h1>
            <p className="text-xl text-muted-foreground">
              Kişiliğinize göre uyarlanan, etik ve kültürel açıdan duyarlı bir e-ticaret platformu
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                <span>Psiko-Adaptif</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Etik Koruma</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span>Kültürel Zeka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {isAuthenticated ? "Size Özel Ürünler" : "Ürünler"}
            </h2>
            {isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Kişiliğinize göre sıralanmış
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardHeader>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Görsel Yok
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description || "Açıklama bulunmuyor"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        ₺{Number(product.price).toFixed(2)}
                      </span>
                      {product.stock > 0 ? (
                        <Badge variant="secondary">Stokta</Badge>
                      ) : (
                        <Badge variant="destructive">Tükendi</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/product/${product.id}`} className="w-full">
                      <Button className="w-full">İncele</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz ürün bulunmuyor</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Neden NeuroShop?</h2>
              <p className="text-muted-foreground">
                Alışveriş deneyiminizi kişiselleştiren yenilikçi özellikler
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Brain className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Kişiye Özel Deneyim</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Davranışlarınızı analiz ederek size en uygun ürünleri öneriyoruz
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Etik ve Şeffaf</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Verilerinizi nasıl kullandığımızı açıkça gösteriyor ve manipülasyondan koruyoruz
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Globe className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Kültürel Duyarlılık</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Kültürünüze uygun bir alışveriş deneyimi sunuyoruz
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">NeuroShop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Psiko-adaptif e-ticaret platformu © 2026
            </p>
            <div className="flex gap-4">
              <Link href="/privacy">
                <Button variant="link" size="sm">Gizlilik</Button>
              </Link>
              <Link href="/transparency">
                <Button variant="link" size="sm">Şeffaflık</Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
