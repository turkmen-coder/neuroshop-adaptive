import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});

  const { data: cartItems, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });

  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success("Ürün sepetten kaldırıldı");
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });

  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      toast.success("Sepet temizlendi");
      utils.cart.get.invalidate();
    },
  });

  // Fetch product details for cart items
  useEffect(() => {
    if (cartItems) {
      cartItems.forEach(async (item) => {
        if (!productDetails[item.productId]) {
          try {
            const response = await fetch(`/api/trpc/products.getById?input=${JSON.stringify({ json: { id: item.productId } })}`);
            const data = await response.json();
            if (data.result?.data?.json) {
              setProductDetails(prev => ({
                ...prev,
                [item.productId]: data.result.data.json,
              }));
            }
          } catch (error) {
            console.error("Failed to fetch product:", error);
          }
        }
      });
    }
  }, [cartItems]);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    updateMutation.mutate({ productId, quantity });
  };

  const handleRemove = (productId: number) => {
    removeMutation.mutate({ productId });
  };

  const handleClearCart = () => {
    if (confirm("Sepeti temizlemek istediğinizden emin misiniz?")) {
      clearMutation.mutate();
    }
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      const product = productDetails[item.productId];
      if (product) {
        return sum + (Number(product.price) * item.quantity);
      }
      return sum;
    }, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Sepeti görüntülemek için giriş yapın</h2>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Alışverişe Devam
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Sepetiniz boş</h2>
            <p className="text-muted-foreground">Alışverişe başlamak için ürünleri keşfedin</p>
            <Link href="/">
              <Button>Ürünleri İncele</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = productDetails[item.productId];
                if (!product) {
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="animate-pulse flex gap-4">
                          <div className="w-24 h-24 bg-muted rounded" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                              Görsel Yok
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={updateMutation.isPending || item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={updateMutation.isPending}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-bold">
                                ₺{(Number(product.price) * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemove(item.id)}
                                disabled={removeMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearCart}
                disabled={clearMutation.isPending}
              >
                Sepeti Temizle
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span className="font-medium">₺{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className="font-medium">
                      {total >= 500 ? "Ücretsiz" : "₺29.90"}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Toplam</span>
                      <span className="text-2xl font-bold">
                        ₺{(total >= 500 ? total : total + 29.90).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg">
                    Siparişi Tamamla
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
