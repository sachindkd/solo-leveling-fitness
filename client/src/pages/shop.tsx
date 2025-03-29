import React, { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ShopItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shirt, Dumbbell, ShoppingCart, Loader2 } from "lucide-react";

// Shop item type icons
const SHOP_ICONS = {
  "booster": <Zap className="h-6 w-6 text-yellow-400" />,
  "cosmetic": <Shirt className="h-6 w-6 text-purple-400" />,
  "gear": <Dumbbell className="h-6 w-6 text-blue-400" />
};

// Shop item descriptions
const TYPE_DESCRIPTIONS = {
  "booster": "Temporary bonuses to increase your progression",
  "cosmetic": "Unique appearance items to customize your hunter",
  "gear": "Equipment to enhance your training effectiveness"
};

export default function Shop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch shop items
  const { data: shopItems, isLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop-items"]
  });

  // Fetch user items
  const { data: userItems } = useQuery({
    queryKey: ["/api/user-items"]
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await apiRequest("POST", `/api/shop-items/${itemId}/purchase`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Purchase successful",
        description: `You have purchased ${quantity} ${selectedItem?.name}`,
      });
      setPurchaseDialog(false);
      setQuantity(1);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Not enough coins",
        variant: "destructive",
      });
    }
  });

  const handleOpenPurchaseDialog = (item: ShopItem) => {
    setSelectedItem(item);
    setPurchaseDialog(true);
    setQuantity(1);
  };

  const handlePurchase = () => {
    if (!selectedItem) return;
    
    purchaseMutation.mutate({
      itemId: selectedItem.id,
      quantity
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  // Group items by type
  const boosterItems = shopItems?.filter(item => item.type === "booster") || [];
  const cosmeticItems = shopItems?.filter(item => item.type === "cosmetic") || [];
  const gearItems = shopItems?.filter(item => item.type === "gear") || [];

  if (isLoading) {
    return (
      <AppLayout currentTab="Shop">
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentTab="Shop">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Hunter Shop</h2>
          <div className="flex items-center space-x-2 bg-primary-light bg-opacity-40 px-4 py-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-accent">{user?.coins || 0}</span>
          </div>
        </div>

        {/* Boosters Section */}
        <section className="mb-8">
          <div className="flex items-center mb-4">
            <Zap className="h-6 w-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Boosters</h3>
          </div>
          <p className="text-gray-400 mb-4">{TYPE_DESCRIPTIONS.booster}</p>
          
          {boosterItems.length === 0 ? (
            <div className="text-center p-6 bg-primary-dark bg-opacity-60 rounded-lg">
              <p className="text-gray-400">No booster items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {boosterItems.map(item => (
                <Card key={item.id} className="bg-primary-dark border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{item.name}</CardTitle>
                      <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-md">
                        {SHOP_ICONS.booster}
                      </div>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.effectValue > 0 && (
                      <div className="bg-primary-light bg-opacity-30 rounded-md p-3 mb-4">
                        <p className="text-sm text-white">Effect: {item.effectValue}x multiplier</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-accent">{item.price}</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenPurchaseDialog(item)}
                      variant="secondary"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
        
        {/* Cosmetics Section */}
        <section className="mb-8">
          <div className="flex items-center mb-4">
            <Shirt className="h-6 w-6 text-purple-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Cosmetics</h3>
          </div>
          <p className="text-gray-400 mb-4">{TYPE_DESCRIPTIONS.cosmetic}</p>
          
          {cosmeticItems.length === 0 ? (
            <div className="text-center p-6 bg-primary-dark bg-opacity-60 rounded-lg">
              <p className="text-gray-400">No cosmetic items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cosmeticItems.map(item => (
                <Card key={item.id} className="bg-primary-dark border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{item.name}</CardTitle>
                      <div className="p-2 bg-purple-500 bg-opacity-20 rounded-md">
                        {SHOP_ICONS.cosmetic}
                      </div>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-primary-light bg-opacity-20 rounded-md flex items-center justify-center">
                      <p className="text-gray-400 text-sm">Preview Unavailable</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-accent">{item.price}</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenPurchaseDialog(item)}
                      variant="secondary"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
        
        {/* Gear Section */}
        <section>
          <div className="flex items-center mb-4">
            <Dumbbell className="h-6 w-6 text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Gear</h3>
          </div>
          <p className="text-gray-400 mb-4">{TYPE_DESCRIPTIONS.gear}</p>
          
          {gearItems.length === 0 ? (
            <div className="text-center p-6 bg-primary-dark bg-opacity-60 rounded-lg">
              <p className="text-gray-400">No gear items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gearItems.map(item => (
                <Card key={item.id} className="bg-primary-dark border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{item.name}</CardTitle>
                      <div className="p-2 bg-blue-500 bg-opacity-20 rounded-md">
                        {SHOP_ICONS.gear}
                      </div>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.effectValue > 0 && (
                      <div className="bg-primary-light bg-opacity-30 rounded-md p-3 mb-4">
                        <p className="text-sm text-white">Bonus: +{item.effectValue}% to training efficiency</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-accent">{item.price}</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenPurchaseDialog(item)}
                      variant="secondary"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onOpenChange={setPurchaseDialog}>
        <DialogContent className="bg-primary-dark border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Purchase Item</DialogTitle>
            <DialogDescription>
              You are about to purchase {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price per item:</span>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-accent">{selectedItem?.price}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="quantity" className="text-gray-400">Quantity:</label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-24 text-right"
              />
            </div>
            
            <div className="flex items-center justify-between font-bold">
              <span className="text-white">Total cost:</span>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-accent">{(selectedItem?.price || 0) * quantity}</span>
              </div>
            </div>
            
            {user && ((selectedItem?.price || 0) * quantity > user.coins) && (
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-md text-sm text-red-400">
                Not enough coins! You need {(selectedItem?.price || 0) * quantity - user.coins} more coins.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending || !user || ((selectedItem?.price || 0) * quantity > user.coins)}
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
