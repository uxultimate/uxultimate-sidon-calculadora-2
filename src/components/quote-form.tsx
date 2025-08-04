"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, Loader2 } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AddLineItemDialog } from '@/components/add-line-item-dialog';
import type { LineItem } from '@/lib/types';
import { Input } from './ui/input';


interface QuoteFormProps {
    onSave: (data: any) => Promise<void>;
    isSaving: boolean;
}

export function QuoteForm({ onSave, isSaving }: QuoteFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [contactInfo, setContactInfo] = useState({
      name: '',
      companyName: '',
      cif: '',
      email: '',
      address: ''
  });

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setContactInfo(prev => ({ ...prev, [name]: value }));
  }

  const addLineItem = (newItem: Omit<LineItem, 'id'>) => {
    setLineItems([...lineItems, { ...newItem, id: Date.now() }]);
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + item.total, 0);
  };
  
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.21;
  const total = subtotal + tax;
  

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const handleSaveWrapper = async () => {
    if (!contactInfo.name) {
        toast({
            variant: "destructive",
            title: "Falta Cliente",
            description: "Por favor, introduce un nombre para el cliente."
        });
        return;
    }
    if (lineItems.length === 0) {
        toast({
            variant: "destructive",
            title: "Presupuesto Vacío",
            description: "Por favor, añade al menos un concepto."
        });
        return;
    }

    const quoteData = {
        contactName: contactInfo.name,
        contactCompanyName: contactInfo.companyName,
        contactCif: contactInfo.cif,
        contactEmail: contactInfo.email,
        contactAddress: contactInfo.address,
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
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Cliente</Label>
            <Input id="name" name="name" value={contactInfo.name} onChange={handleContactChange} placeholder="Nombre del cliente"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Cliente</Label>
            <Input id="email" name="email" type="email" value={contactInfo.email} onChange={handleContactChange} placeholder="Correo electrónico"/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="companyName">Empresa</Label>
            <Input id="companyName" name="companyName" value={contactInfo.companyName} onChange={handleContactChange} placeholder="Nombre de la empresa"/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="cif">CIF/NIF</Label>
            <Input id="cif" name="cif" value={contactInfo.cif} onChange={handleContactChange} placeholder="CIF o NIF"/>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" value={contactInfo.address} onChange={handleContactChange} placeholder="Dirección completa"/>
          </div>
        </CardContent>
      </Card>
      
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
            <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Concepto
            </Button>
            <AddLineItemDialog onAddItem={addLineItem} open={isDialogOpen} onOpenChange={setIsDialogOpen} />

        </CardContent>
        {lineItems.length > 0 && (
          <CardFooter className="flex flex-col items-end gap-4">
              <Separator />
              <div className="w-full max-w-sm space-y-2">
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
            <Button onClick={handleSaveWrapper} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Calcular y Previsualizar
            </Button>
        </div>
      
    </div>
  );
}
