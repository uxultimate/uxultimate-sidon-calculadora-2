
"use client";

import React from 'react';
import { AddLineItemForm } from '@/components/add-line-item-form';
import { Separator } from '@/components/ui/separator';
import { CalculatorOne } from "@/components/calculator-one";
import { useQuote } from '@/context/quote-context';


export default function HomePage() {
    const { 
        lineItems, 
        currentQuote,
        addLineItem,
        removeLineItem,
        setCurrentQuote,
        handleCancel,
    } = useQuote();


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
