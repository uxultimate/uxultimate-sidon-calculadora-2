
"use client";

import React, { useState } from 'react';
import { CalculatorOne } from "@/components/calculator-one";
import { AddLineItemForm } from '@/components/add-line-item-form';
import type { LineItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
    const [lineItems, setLineItems] = useState<LineItem[]>([]);

    const addLineItem = (newItem: Omit<LineItem, 'id'>) => {
        setLineItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    };
    
    const removeLineItem = (id: number) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="flex flex-col gap-8 py-4">
            <AddLineItemForm onAddItem={addLineItem} />
            
            <Separator className="my-4" />

            <CalculatorOne lineItems={lineItems} removeLineItem={removeLineItem} />

        </div>
    );
}
