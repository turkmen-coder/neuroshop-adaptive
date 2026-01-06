import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const productId = parseInt(id || "0");
  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });
  
  const utils = trpc.useUtils();
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Ürün sepete eklendi");
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Sepete eklemek için giriş yapmalısınız");
      return;
    }
    
    addToCartMutation.mutate({ productId, quantity });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Satın almak için giriş yapmalısınız");
      return;
    }
    
    addToCartMutation.mutate({ productId, quantity }, {
      onSuccess: () => {
        setLocation("/cart");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Ürün bulunamadı</h2>
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
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
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

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
            </div>

            <p className="text-lg text-muted-foreground">
              {product.description || "Açıklama bulunmuyor"}
            </p>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold">
                    ₺{Number(product.price).toFixed(2)}
                  </span>
                  {product.stock > 0 ? (
                    <Badge variant="secondary" className="text-sm">
                      {product.stock} adet stokta
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Tükendi</Badge>
                  )}
                </div>

                {product.stock > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm font-medium">Adet:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBuyNow}
                        disabled={addToCartMutation.isPending}
                      >
                        Hemen Al
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Sepete Ekle
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ücretsiz Kargo</span>
                  <span className="font-medium">500₺ ve üzeri</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">İade Garantisi</span>
                  <span className="font-medium">14 gün</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teslimat</span>
                  <span className="font-medium">2-3 iş günü</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
