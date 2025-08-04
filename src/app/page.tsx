"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Sparkles, Heart, Loader2, Shirt, Package, Wind } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { SuggestOutfitOutput } from "@/ai/flows/suggest-outfit";
import { getSuggestionsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

type WardrobeItem = {
  type: string;
  quantity: number;
};

type Outfit = SuggestOutfitOutput["suggestions"][0];

const wardrobeFormSchema = z.object({
  type: z.string().min(2, { message: "Item type must be at least 2 characters." }).max(50, { message: "Item type must be 50 characters or less." }),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive number." }),
});

export default function OutfitCalcPage() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [occasion, setOccasion] = useState<string>("casual");
  const [suggestions, setSuggestions] = useState<Outfit[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof wardrobeFormSchema>>({
    resolver: zodResolver(wardrobeFormSchema),
    defaultValues: {
      type: "",
      quantity: 1,
    },
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("savedOutfits");
      if (saved) {
        setSavedOutfits(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse saved outfits from localStorage", e);
      localStorage.removeItem("savedOutfits");
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("savedOutfits", JSON.stringify(savedOutfits));
    }
  }, [savedOutfits, isMounted]);

  const handleAddItem = (values: z.infer<typeof wardrobeFormSchema>) => {
    setWardrobe((prev) => [...prev, { type: values.type, quantity: values.quantity }]);
    form.reset();
  };

  const handleRemoveItem = (index: number) => {
    setWardrobe((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    const result = await getSuggestionsAction({ wardrobe, occasion });
    setIsLoading(false);
    if (result.success && result.data) {
      setSuggestions(result.data.suggestions);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
  };
  
  const handleSaveOutfit = (outfit: Outfit) => {
    if (savedOutfits.some(saved => JSON.stringify(saved) === JSON.stringify(outfit))) {
      toast({
        title: "Already Saved",
        description: "This outfit is already in your favorites.",
      });
      return;
    }
    setSavedOutfits((prev) => [...prev, outfit]);
    toast({
      title: "Outfit Saved!",
      description: "Check the 'Saved' tab to see your favorite outfits.",
    });
  };

  const handleRemoveSavedOutfit = (index: number) => {
    setSavedOutfits((prev) => prev.filter((_, i) => i !== index));
  };

  const renderOutfitCard = (outfit: Outfit, isSaved: boolean, index: number) => (
    <Card key={index} className="flex flex-col">
      <CardHeader>
        <CardDescription>{outfit.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {outfit.items.map((item, itemIndex) => (
            <div key={itemIndex} className="text-center">
              <div className="aspect-square bg-accent rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                <Image
                  src={`https://placehold.co/200x200.png`}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="object-cover"
                  data-ai-hint={`${item.type} ${item.name}`}
                />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isSaved ? (
          <Button variant="outline" size="sm" onClick={() => handleRemoveSavedOutfit(index)} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        ) : (
          <Button size="sm" onClick={() => handleSaveOutfit(outfit)} className="w-full">
            <Heart className="mr-2 h-4 w-4" />
            Save Outfit
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary">OutfitCalc</h1>
        <p className="text-muted-foreground text-lg mt-2">Your Personal Wardrobe Stylist</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center"><Package className="mr-2"/>My Wardrobe</CardTitle>
              <CardDescription>Add items from your closet to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddItem)} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Item Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., T-Shirt, Jeans" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="icon" className="sm:mt-8 w-full sm:w-auto">
                    <Plus />
                    <span className="sr-only">Add Item</span>
                  </Button>
                </form>
              </Form>
              <Separator className="my-6" />
              <ScrollArea className="h-64">
                {wardrobe.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                      <Shirt className="mx-auto h-12 w-12 opacity-50"/>
                      <p className="mt-4">Your wardrobe is empty.</p>
                    </div>
                ) : (
                <div className="space-y-3 pr-4">
                  {wardrobe.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                      <div>
                        <span className="font-medium">{item.type}</span>
                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="suggestions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            <TabsContent value="suggestions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Wind className="mr-2"/>Outfit Generator</CardTitle>
                  <CardDescription>Select an occasion and let our AI suggest outfits for you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Occasion</Label>
                      <RadioGroup value={occasion} onValueChange={setOccasion} className="flex space-x-4 mt-2">
                        {["casual", "business", "formal"].map(value => (
                            <div key={value} className="flex items-center space-x-2">
                                <RadioGroupItem value={value} id={value}/>
                                <Label htmlFor={value} className="capitalize">{value}</Label>
                            </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Button onClick={handleGetSuggestions} disabled={isLoading || wardrobe.length === 0} className="w-full">
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Get Suggestions</>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  {isLoading && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i}><CardHeader><div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div></CardHeader><CardContent><div className="h-32 bg-muted rounded animate-pulse"></div></CardContent></Card>
                      ))}
                    </div>
                  )}
                  {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((outfit, index) => renderOutfitCard(outfit, false, index))}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Heart className="mr-2" />Saved Outfits</CardTitle>
                  <CardDescription>Your favorite outfits at a glance.</CardDescription>
                </CardHeader>
                <CardContent>
                {savedOutfits.length === 0 && !isMounted ? (
                    <div className="text-center text-muted-foreground py-10">
                      <Loader2 className="mx-auto h-12 w-12 opacity-50 animate-spin"/>
                      <p className="mt-4">Loading saved outfits...</p>
                    </div>
                ) : savedOutfits.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <Heart className="mx-auto h-12 w-12 opacity-50"/>
                    <p className="mt-4">You have no saved outfits.</p>
                    <p className="text-sm">Generate some suggestions and save your favorites!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedOutfits.map((outfit, index) => renderOutfitCard(outfit, true, index))}
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
