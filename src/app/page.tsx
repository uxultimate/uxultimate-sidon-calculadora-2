"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorOne } from "@/components/calculator-one";

export default function HomePage() {
    return (
        <Tabs defaultValue="calculator1" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calculator1">Calculadora 1</TabsTrigger>
                <TabsTrigger value="calculator2">Calculadora 2</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator1">
               <CalculatorOne />
            </TabsContent>
            <TabsContent value="calculator2">
                <Card>
                    <CardHeader>
                        <CardTitle>Calculadora 2</CardTitle>
                        <CardDescription>
                            Esta es la segunda calculadora. ¡Lista para construir!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>Aquí construiremos la nueva calculadora paso a paso.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
