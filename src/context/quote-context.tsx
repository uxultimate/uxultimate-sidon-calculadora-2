
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LineItem, Quote, LineItemGroup } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface QuoteContextType {
    stagedLineItems: LineItem[];
    setStagedLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
    currentQuote: Quote | null;
    setCurrentQuote: React.Dispatch<React.SetStateAction<Quote | null>>;
    lineItemGroups: LineItemGroup[];
    setLineItemGroups: React.Dispatch<React.SetStateAction<LineItemGroup[]>>;
    addStagedLineItem: (newItem: Omit<LineItem, 'id'>) => void;
    removeStagedLineItem: (id: number) => void;
    handleCancel: () => void;
    addGroupToQuote: (reference: string) => void;
    removeLineItemGroup: (id: string) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
    const [stagedLineItems, setStagedLineItems] = useState<LineItem[]>([]);
    const [lineItemGroups, setLineItemGroups] = useState<LineItemGroup[]>([]);
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
    const { toast } = useToast();

    const addStagedLineItem = (newItem: Omit<LineItem, 'id'>) => {
        setStagedLineItems(prev => [...prev, { ...newItem, id: Date.now() }]);
        setCurrentQuote(null); // Invalidate preview when items change
    };
    
    const removeStagedLineItem = (id: number) => {
        setStagedLineItems(prev => prev.filter(item => item.id !== id));
        setCurrentQuote(null); // Invalidate preview when items change
    };

    const addGroupToQuote = (reference: string) => {
        if (stagedLineItems.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Grupo Vacío',
                description: 'Añade al menos un concepto al grupo actual antes de guardarlo.',
            });
            return;
        }

        const groupTotal = stagedLineItems.reduce((acc, item) => acc + item.total, 0);

        const newGroup: LineItemGroup = {
            id: `group-${Date.now()}`,
            reference,
            lineItems: stagedLineItems.map(({id, ...rest}) => rest),
            total: groupTotal,
        };

        setLineItemGroups(prev => [...prev, newGroup]);
        setStagedLineItems([]);
        setCurrentQuote(null);
        toast({
            title: 'Grupo Añadido',
            description: `El grupo "${reference}" se ha añadido al presupuesto.`,
        });
    };
    
    const removeLineItemGroup = (id: string) => {
        setLineItemGroups(prev => prev.filter(group => group.id !== id));
        setCurrentQuote(null);
    };


    const handleCancel = () => {
        setStagedLineItems([]);
        setLineItemGroups([]);
        setCurrentQuote(null);
        toast({
            title: "Presupuesto borrado",
            description: "Puedes empezar a crear uno nuevo.",
        });
    }

    return (
        <QuoteContext.Provider value={{ 
            stagedLineItems,
            setStagedLineItems,
            currentQuote, 
            setCurrentQuote,
            addStagedLineItem,
            removeStagedLineItem,
            handleCancel,
            lineItemGroups,
            setLineItemGroups,
            addGroupToQuote,
            removeLineItemGroup,
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
