
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, Plus, ArrowRight } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import type { LineItem, LineItemGroup } from '@/lib/types';
import { Input } from './ui/input';
import { formatCurrency } from '@/lib/utils';

interface QuoteFormProps {
    stagedLineItems: LineItem[];
    removeStagedLineItem: (id: number) => void;
    lineItemGroups: LineItemGroup[];
    addGroupToQuote: (reference: string) => void;
    removeLineItemGroup: (id: string) => void;
    onGenerateQuote: () => void;
    isGenerating: boolean;
    onCancel: () => void;
}

export function QuoteForm({ 
    stagedLineItems, 
    removeStagedLineItem, 
    lineItemGroups,
    addGroupToQuote,
    removeLineItemGroup,
    onGenerateQuote,
    isGenerating,
    onCancel 
}: QuoteFormProps) {
  const [groupReference, setGroupReference] = useState('');
  
  const calculateStagedTotal = () => {
    return stagedLineItems.reduce((acc, item) => acc + item.total, 0);
  };
  
  const stagedSubtotal = calculateStagedTotal();

  const handleAddGroup = () => {
    if (groupReference.trim() === '') {
        // Optionally, show a toast or message
        return;
    }
    addGroupToQuote(groupReference);
    setGroupReference('');
  };
  
  const finalSubtotal = lineItemGroups.reduce((acc, group) => acc + group.total, 0);
  const finalTax = finalSubtotal * 0.21;
  const finalTotal = finalSubtotal + finalTax;

  return (
    <div className="flex flex-col gap-8">
        {/* Staging Area for Line Items */}
        <Card>
            <CardHeader>
            <CardTitle>Grupo Actual</CardTitle>
            <CardDescription>Añade conceptos que pertenecerán a un mismo grupo o estancia (ej. "Dormitorio Principal").</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right w-[120px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stagedLineItems.length > 0 ? stagedLineItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">
                        <p className="font-bold">
                            {item.name}
                            {item.quantity > 1 && <span className="font-medium"> (x{item.quantity})</span>}
                        </p>
                        <p className="text-sm text-muted-foreground break-words whitespace-normal">{item.details}</p>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeStagedLineItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                        Añade un concepto para empezar a crear un grupo.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </CardContent>
            {stagedLineItems.length > 0 && (
                <CardFooter className="flex flex-col items-end gap-4 p-6 pt-0">
                    <Separator />
                    <div className="flex justify-between font-bold text-md w-full max-w-sm pt-4">
                        <span>Total del Grupo</span>
                        <span>{formatCurrency(stagedSubtotal)}</span>
                    </div>
                </CardFooter>
            )}
        </Card>
        
        {/* Action to add staged items as a group */}
        <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className='flex-grow w-full'>
                    <label htmlFor="groupReference" className='text-sm font-medium mb-2 block'>Referencia del Grupo</label>
                    <Input 
                        id="groupReference"
                        placeholder="Ej: DORMITORIO SUITE" 
                        value={groupReference}
                        onChange={(e) => setGroupReference(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                    />
                </div>
                <Button onClick={handleAddGroup} disabled={stagedLineItems.length === 0 || groupReference.trim() === ''} className="w-full sm:w-auto mt-4 sm:mt-8">
                    <Plus className="mr-2 h-4 w-4" /> Añadir Grupo al Presupuesto
                </Button>
            </CardContent>
        </Card>
        
        {/* Final Quote Summary */}
        <Separator className='my-4' />

        <Card>
            <CardHeader>
                <CardTitle>Resumen del Presupuesto</CardTitle>
                <CardDescription>Aquí se mostrarán todos los grupos de conceptos añadidos.</CardDescription>
            </CardHeader>
            <CardContent>
                 {lineItemGroups.length > 0 ? (
                    <div className="space-y-6">
                        {lineItemGroups.map(group => (
                             <div key={group.id} className="rounded-lg border">
                                 <div className="flex justify-between items-center bg-muted/50 px-4 py-3 rounded-t-lg">
                                     <h3 className="font-semibold">{group.reference}</h3>
                                     <div className='flex items-center gap-4'>
                                        <span className='font-semibold'>{formatCurrency(group.total)}</span>
                                        <Button variant="ghost" size="icon" onClick={() => removeLineItemGroup(group.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                     </div>
                                 </div>
                                <div className="p-4 text-sm text-muted-foreground">
                                    {group.lineItems.map((item, index) => (
                                        <p key={index} className='truncate'>
                                            {item.quantity > 1 ? `${item.quantity}x` : ''} {item.name} - {item.details}
                                        </p>
                                    ))}
                                </div>
                             </div>
                        ))}
                    </div>
                 ) : (
                    <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
                        Añade un grupo para verlo aquí.
                    </div>
                 )}
            </CardContent>
            {lineItemGroups.length > 0 && (
                <CardFooter className="flex flex-col items-end gap-4 p-6">
                    <Separator />
                    <div className="w-full max-w-sm space-y-2 pt-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(finalSubtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IVA (21%)</span>
                            <span>{formatCurrency(finalTax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
      
       <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={onGenerateQuote} disabled={isGenerating || lineItemGroups.length === 0}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Vista Previa del Presupuesto <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      
    </div>
  );
}
