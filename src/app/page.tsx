
"use client";

import React, { useState } from 'react';
import { CalculatorOne } from "@/components/calculator-one";
import { AddLineItemDialog } from '@/components/add-line-item-dialog';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const addLineItem = (newItem: Omit<LineItem, 'id'>) => {
        setLineItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    };
    
    const removeLineItem = (id: number) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <>
            <div className="flex flex-col gap-8 py-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">
                            Calculadora de Presupuestos Sidon
                        </h1>
                        <p className="text-muted-foreground">
                            Completa los detalles para generar un nuevo presupuesto.
                        </p>
                    </div>
                     <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Concepto
                    </Button>
                </div>

                <CalculatorOne lineItems={lineItems} removeLineItem={removeLineItem} />

                <Separator className="my-4" />

                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">Añadir Concepto al Presupuesto</h2>
                    <p className="text-muted-foreground">
                        Selecciona una categoría y completa los detalles para añadir un nuevo concepto al presupuesto.
                    </p>
                </div>
            </div>

            <AddLineItemDialog onAddItem={addLineItem} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    );
}
