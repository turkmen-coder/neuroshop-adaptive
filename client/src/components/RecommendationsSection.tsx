import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function RecommendationsSection() {
  const { data: recommendations, isLoading } = trpc.products.getRecommendations.useQuery({ limit: 8 });
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

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Henüz öneri yok. Daha fazla alışveriş yaparak kişilik profilinizi geliştirin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((rec) => (
        <Card key={rec.product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
          {/* Recommendation Badge */}
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-primary/90 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {Math.round(rec.score)}% uyumlu
            </Badge>
          </div>

          <Link href={`/product/${rec.product.id}`}>
            <div className="aspect-square bg-muted relative overflow-hidden cursor-pointer">
              {rec.product.imageUrl ? (
                <img
                  src={rec.product.imageUrl}
                  alt={rec.product.name}
                  className="object-cover w-full h-full hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Görsel Yok
                </div>
              )}
            </div>
          </Link>

          <CardHeader>
            <CardTitle className="line-clamp-1">{rec.product.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {rec.product.description || "Açıklama yok"}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{rec.reason}</span>
            </div>
          </CardHeader>

          <CardFooter className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">₺{rec.product.price}</span>
            </div>
            <Button
              size="sm"
              onClick={() => handleAddToCart(rec.product.id)}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sepete Ekle
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
