
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Logo } from './logo';
import type { LineItem } from '@/lib/types';

interface AddLineItemDialogTwoProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddItem: (item: Omit<LineItem, 'id'>) => void;
}

export function AddLineItemDialogTwo({ open, onOpenChange, onAddItem }: AddLineItemDialogTwoProps) {
    
    const handleSave = () => {
        // Placeholder for adding an item
        const newItem = {
            name: "Nuevo Concepto (Calculadora 2)",
            details: "Detalles del nuevo concepto",
            quantity: 1,
            price: 100,
            total: 100,
        };
        onAddItem(newItem);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 sm:p-6 pb-0">
                    <div className="flex flex-col items-start gap-2">
                      <Logo />
                      <DialogTitle className="text-lg sm:text-xl font-bold">Añadir Concepto (Calculadora 2)</DialogTitle>
                    </div>
                    <DialogDescription>
                      Esta es la Calculadora 2. ¡Lista para construir!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                   <p>Aquí construiremos la nueva calculadora paso a paso.</p>
                </div>
                <DialogFooter className="p-4 sm:p-6 border-t bg-background">
                    <Button onClick={handleSave}>Añadir al Presupuesto</Button>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
