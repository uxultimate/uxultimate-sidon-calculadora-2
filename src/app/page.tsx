
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalculatorOne } from "@/components/calculator-one";
import { AddLineItemDialog } from '@/components/add-line-item-dialog';
import { AddLineItemDialogTwo } from '@/components/add-line-item-dialog-two';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CalculatorTwo } from '@/components/calculator-two';

export default function HomePage() {
    const [lineItems1, setLineItems1] = useState<LineItem[]>([]);
    const [isDialog1Open, setIsDialog1Open] = useState(false);
    
    // State for Calculator 2
    const [lineItems2, setLineItems2] = useState<LineItem[]>([]);
    const [isDialog2Open, setIsDialog2Open] = useState(false);

    const addLineItem1 = (newItem: Omit<LineItem, 'id'>) => {
        setLineItems1(prev => [...prev, { ...newItem, id: Date.now() }]);
    };
    
    const removeLineItem1 = (id: number) => {
        setLineItems1(prev => prev.filter(item => item.id !== id));
    };

    const addLineItem2 = (newItem: Omit<LineItem, 'id'>) => {
        setLineItems2(prev => [...prev, { ...newItem, id: Date.now() }]);
    };

    const removeLineItem2 = (id: number) => {
        setLineItems2(prev => prev.filter(item => item.id !== id));
    };
    
    return (
        <>
            <Tabs defaultValue="calculator1" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="calculator1">Calculadora 1</TabsTrigger>
                    <TabsTrigger value="calculator2">Calculadora 2</TabsTrigger>
                </TabsList>
                <TabsContent value="calculator1">
                   <div className="flex flex-col gap-4">
                       <CalculatorOne lineItems={lineItems1} removeLineItem={removeLineItem1} />
                       <Button variant="outline" className="mt-4" onClick={() => setIsDialog1Open(true)}>
                           <PlusCircle className="mr-2 h-4 w-4" />
                           Añadir Concepto
                       </Button>
                   </div>
                </TabsContent>
                <TabsContent value="calculator2">
                     <div className="flex flex-col gap-4">
                        <CalculatorTwo lineItems={lineItems2} removeLineItem={removeLineItem2} />
                         <Button variant="outline" className="mt-4" onClick={() => setIsDialog2Open(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Concepto
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
            
            <AddLineItemDialog onAddItem={addLineItem1} open={isDialog1Open} onOpenChange={setIsDialog1Open} />
            <AddLineItemDialogTwo onAddItem={addLineItem2} open={isDialog2Open} onOpenChange={setIsDialog2Open} />
        </>
    );
}
