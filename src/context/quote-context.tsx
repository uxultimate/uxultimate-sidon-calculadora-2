
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { LineItem, Quote, LineItemGroup, ClientProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'quoteFormData';

interface QuoteContextType {
    stagedLineItems: LineItem[];
    setStagedLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
    currentQuote: Quote | null;
    setCurrentQuote: React.Dispatch<React.SetStateAction<Quote | null>>;
    lineItemGroups: LineItemGroup[];
    setLineItemGroups: React.Dispatch<React.SetStateAction<LineItemGroup[]>>;
    clientProfile: ClientProfile;
    setClientProfile: React.Dispatch<React.SetStateAction<ClientProfile>>;
    discountPercentage: number;
    setDiscountPercentage: React.Dispatch<React.SetStateAction<number>>;
    addStagedLineItem: (newItem: Omit<LineItem, 'id'>) => void;
    removeStagedLineItem: (id: number) => void;
    handleCancel: () => void;
    addGroupToQuote: (reference: string) => void;
    removeLineItemGroup: (id: string) => void;
    moveLineItemGroupUp: (id: string) => void;
    moveLineItemGroupDown: (id: string) => void;
    isLoaded: boolean;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
    const [stagedLineItems, setStagedLineItems] = useState<LineItem[]>([]);
    const [lineItemGroups, setLineItemGroups] = useState<LineItemGroup[]>([]);
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
    const [clientProfile, setClientProfile] = useState<ClientProfile>({
        contactName: '',
        contactCompanyName: '',
        contactCif: '',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
    });
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedData = sessionStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const { stagedLineItems, lineItemGroups, clientProfile, discountPercentage } = JSON.parse(savedData);
                if (stagedLineItems) setStagedLineItems(stagedLineItems);
                if (lineItemGroups) setLineItemGroups(lineItemGroups);
                if (clientProfile) setClientProfile(clientProfile);
                if (discountPercentage) setDiscountPercentage(discountPercentage);
            }
        } catch (error) {
            console.error("Failed to load state from session storage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        // We only save to session storage after the initial load is complete.
        if (!isLoaded) {
            return;
        }
        try {
            const dataToSave = JSON.stringify({ stagedLineItems, lineItemGroups, clientProfile, discountPercentage });
            sessionStorage.setItem(STORAGE_KEY, dataToSave);
        } catch (error) {
            console.error("Failed to save state to session storage", error);
        }
    }, [stagedLineItems, lineItemGroups, clientProfile, discountPercentage, isLoaded]);

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

    const moveLineItemGroup = (id: string, direction: 'up' | 'down') => {
        setLineItemGroups(prev => {
            const index = prev.findIndex(group => group.id === id);
            if (index === -1) return prev;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newGroups = [...prev];
            const [movedGroup] = newGroups.splice(index, 1);
            newGroups.splice(newIndex, 0, movedGroup);
            return newGroups;
        });
        setCurrentQuote(null);
    };

    const moveLineItemGroupUp = (id: string) => moveLineItemGroup(id, 'up');
    const moveLineItemGroupDown = (id: string) => moveLineItemGroup(id, 'down');


    const handleCancel = () => {
        setStagedLineItems([]);
        setLineItemGroups([]);
        setCurrentQuote(null);
        setClientProfile({
            contactName: '',
            contactCompanyName: '',
            contactCif: '',
            contactEmail: '',
            contactPhone: '',
            contactAddress: '',
        });
        setDiscountPercentage(0);
        sessionStorage.removeItem(STORAGE_KEY);
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
            moveLineItemGroupUp,
            moveLineItemGroupDown,
            clientProfile,
            setClientProfile,
            discountPercentage,
            setDiscountPercentage,
            isLoaded,
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
