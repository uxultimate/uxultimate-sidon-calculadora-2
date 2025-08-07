
"use client";

import React, { useState } from 'react';
import { AddLineItemForm } from '@/components/add-line-item-form';
import type { LineItem, Quote } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { CalculatorOne } from "@/components/calculator-one";
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
    const { toast } = useToast();

    const addLineItem = (newItem: Omit<LineItem, 'id'>) => {
        setLineItems(prev => [...prev, { ...newItem, id: Date.now() }]);
        setCurrentQuote(null); // Invalidate preview when items change
    };
    
    const removeLineItem = (id: number) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
        setCurrentQuote(null); // Invalidate preview when items change
    };

    const handleCancel = () => {
        setLineItems([]);
        setCurrentQuote(null);
        toast({
            title: "Presupuesto borrado",
            description: "Puedes empezar a crear uno nuevo.",
        });
    }

    return (
        <div className="flex flex-col gap-8 py-4">
            <AddLineItemForm onAddItem={addLineItem} />
            
            <Separator className="my-4" />

            <CalculatorOne 
                lineItems={lineItems} 
                removeLineItem={removeLineItem} 
                currentQuote={currentQuote}
                setCurrentQuote={setCurrentQuote}
                onCancel={handleCancel}
            />

        </div>
    );
}
