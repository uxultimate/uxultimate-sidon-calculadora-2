
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import type { LineItem } from '@/lib/types';
import { PanelesCalculator } from './calculators/paneles-calculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import { Logo } from './logo';

interface AddLineItemDialogTwoProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddItem: (item: Omit<LineItem, 'id'>) => void;
}

export function AddLineItemDialogTwo({ open, onOpenChange, onAddItem }: AddLineItemDialogTwoProps) {
    
    const handleSave = (item: Omit<LineItem, 'id'>) => {
        onAddItem(item);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
                 <DialogHeader className="p-4 sm:p-6 pb-0">
                    <div className="flex flex-col items-start gap-2">
                      <Logo />
                      <DialogTitle className="text-lg sm:text-xl font-bold">Añadir Concepto al Presupuesto</DialogTitle>
                    </div>
                    <DialogDescription>
                      Selecciona una categoría y completa los detalles para añadir un nuevo concepto al presupuesto.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                     <Tabs defaultValue="paneles" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 h-auto mb-4">
                            <TabsTrigger value="paneles">Paneles</TabsTrigger>
                            <TabsTrigger value="abatible">Abatible</TabsTrigger>
                            <TabsTrigger value="corredera">Corredera</TabsTrigger>
                            <TabsTrigger value="interior">Interior</TabsTrigger>
                            <TabsTrigger value="cajones">Cajones</TabsTrigger>
                            <TabsTrigger value="tiradores">Tiradores</TabsTrigger>
                            <TabsTrigger value="axia">Axia</TabsTrigger>
                            <TabsTrigger value="essenza">Essenza</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="paneles" className="mt-4">
                            <PanelesCalculator onSave={handleSave} />
                        </TabsContent>
                         <TabsContent value="abatible" className="mt-4">
                            <p>Calculadora para Abatible</p>
                        </TabsContent>
                        <TabsContent value="corredera" className="mt-4">
                            <p>Calculadora para Corredera</p>
                        </TabsContent>
                        <TabsContent value="interior" className="mt-4">
                           <p>Calculadora para Interior</p>
                        </TabsContent>
                        <TabsContent value="cajones" className="mt-4">
                           <p>Calculadora para Cajones</p>
                        </TabsContent>
                        <TabsContent value="tiradores" className="mt-4">
                           <p>Calculadora para Tiradores</p>
                        </TabsContent>
                        <TabsContent value="axia" className="mt-4">
                            <p>Calculadora para Axia</p>
                        </TabsContent>
                        <TabsContent value="essenza" className="mt-4">
                           <p>Calculadora para Essenza</p>
                        </TabsContent>
                    </Tabs>
                </div>
                 <DialogFooter className="p-4 sm:p-6 border-t bg-background">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
