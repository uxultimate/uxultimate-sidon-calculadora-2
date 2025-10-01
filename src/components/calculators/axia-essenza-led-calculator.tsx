
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { tarifa2025 } from '@/lib/tarifa';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from './utils';

interface AxiaEssenzaLedCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
    category: 'Accesorios Axia' | 'Accesorios Essenza';
}

export const AxiaEssenzaLedCalculator: React.FC<AxiaEssenzaLedCalculatorProps> = ({ onSave, category }) => {
    const products = tarifa2025[category].Productos;
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    const [quantity, setQuantity] = useState(1);

    const total = selectedProduct.Precio * quantity;

    const {name, details} = useMemo(() => {
        const product = selectedProduct as any;
        const widthInfo = product.Ancho ? `, Ancho: ${product.Ancho}` : (product.Rango_Ancho ? `, Rango Ancho: ${product.Rango_Ancho}` : '');
        const finalName = `${category}: ${product.Producto}`;
        const finalDetails = `Acabado: ${product.Acabado}${widthInfo}`;
        return { name: finalName, details: finalDetails };
    }, [category, selectedProduct]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity,
            price: selectedProduct.Precio,
            total,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Producto</Label>
                        <Select
                            value={selectedProduct.Producto}
                            onValueChange={(productName) => {
                                const product = products.find(p => p.Producto === productName);
                                if (product) setSelectedProduct(product);
                            }}
                        >
                            <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {products.map((p, index) => (
                                    <SelectItem key={`${p.Producto}-${index}`} value={p.Producto}>{p.Producto}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Cantidad</Label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" className="text-center w-20" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader><CardTitle>Detalles</CardTitle></CardHeader>
                    <CardContent className="text-sm grid grid-cols-2 gap-2">
                        <p><b>Categoría:</b> {category}</p>
                        <p><b>Acabado:</b> {selectedProduct.Acabado}</p>
                        {(selectedProduct as any).Ancho && <p><b>Ancho:</b> {(selectedProduct as any).Ancho}</p>}
                         {(selectedProduct as any).Rango_Ancho && <p><b>Rango Ancho:</b> {(selectedProduct as any).Rango_Ancho}</p>}
                        {(selectedProduct as any).Fondo && <p><b>Fondo:</b> {(selectedProduct as any).Fondo}</p>}
                        {(selectedProduct as any).Alto && <p><b>Alto:</b> {(selectedProduct as any).Alto}</p>}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Accesorios"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="accessory"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground mb-2">{formatCurrency(selectedProduct.Precio)} / ud.</p>
                        <p className="font-semibold text-sm break-words">{name} (x{quantity})</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
