
"use client";

import React from 'react';
import { AddLineItemForm } from '@/components/add-line-item-form';
import { Separator } from '@/components/ui/separator';
import { CalculatorOne } from "@/components/calculator-one";
import { useQuote } from '@/context/quote-context';
import { Loader2 } from 'lucide-react';


export default function HomePage() {
    const { 
        stagedLineItems, 
        currentQuote,
        addStagedLineItem,
        removeStagedLineItem,
        setCurrentQuote,
        handleCancel,
        lineItemGroups,
        addGroupToQuote,
        removeLineItemGroup,
        isLoaded,
    } = useQuote();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 py-4">
            <AddLineItemForm onAddItem={addStagedLineItem} />
            
            <Separator className="my-4" />

            <CalculatorOne 
                stagedLineItems={stagedLineItems} 
                removeStagedLineItem={removeStagedLineItem} 
                currentQuote={currentQuote}
                setCurrentQuote={setCurrentQuote}
                onCancel={handleCancel}
                lineItemGroups={lineItemGroups}
                addGroupToQuote={addGroupToQuote}
                removeLineItemGroup={removeLineItemGroup}
            />

        </div>
    );
}
