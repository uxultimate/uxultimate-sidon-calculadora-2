
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LineItem, Quote } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface QuoteContextType {
    lineItems: LineItem[];
    setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
    currentQuote: Quote | null;
    setCurrentQuote: React.Dispatch<React.SetStateAction<Quote | null>>;
    addLineItem: (newItem: Omit<LineItem, 'id'>) => void;
    removeLineItem: (id: number) => void;
    handleCancel: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
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
        <QuoteContext.Provider value={{ 
            lineItems, 
            setLineItems, 
            currentQuote, 
            setCurrentQuote,
            addLineItem,
            removeLineItem,
            handleCancel
        }}>
            {children}
        </QuoteContext.Provider>
    );
};

export const useQuote = () => {
    const context = useContext(QuoteContext);
    if (context === undefined) {
        throw new Error('useQuote must be used within a QuoteProvider');
    }
    return context;
};
