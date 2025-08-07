
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, PlusCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { LineItem } from '@/lib/types';


interface QuoteFormProps {
    onSave: (data: any) => Promise<void>;
    isSaving: boolean;
    lineItems: LineItem[];
    removeLineItem: (id: number) => void;
    onCancel: () => void;
}

export function QuoteForm({ onSave, isSaving, lineItems, removeLineItem, onCancel }: QuoteFormProps) {
  const { toast } = useToast();
  
  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + item.total, 0);
  };
  
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.21;
  const total = subtotal + tax;
  

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const handleSaveWrapper = async () => {
    if (lineItems.length === 0) {
        toast({
            variant: "destructive",
            title: "Presupuesto Vacío",
            description: "Por favor, añade al menos un concepto."
        });
        return;
    }

    const quoteData = {
        contactName: 'Cliente',
        lineItems: lineItems.map(({id, ...rest}) => rest),
        subtotal,
        tax,
        total,
    };
    
    await onSave(quoteData);
  };
  

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Conceptos del Presupuesto</CardTitle>
          <CardDescription>Añade y configura los productos o servicios.</CardDescription>
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
                {lineItems.length > 0 ? lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-muted-foreground break-words whitespace-normal">{item.details}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Añade un concepto para empezar a crear el presupuesto.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {lineItems.length > 0 && (
          <CardFooter className="flex flex-col items-end gap-4 p-6 pt-0">
              <Separator />
              <div className="w-full max-w-sm space-y-2 pt-4">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA (21%)</span>
                      <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                  </div>
              </div>
          </CardFooter>
        )}
      </Card>
      
       <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={handleSaveWrapper} disabled={isSaving || lineItems.length === 0}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Presupuesto
            </Button>
        </div>
      
    </div>
  );
}
