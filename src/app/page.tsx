
"use client";

import React from 'react';
import { AddLineItemForm } from '@/components/add-line-item-form';
import { Separator } from '@/components/ui/separator';
import { CalculatorOne } from "@/components/calculator-one";
import { useQuote } from '@/context/quote-context';


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
    } = useQuote();


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
