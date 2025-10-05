
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ConceptoLibreCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const ConceptoLibreCalculator: React.FC<ConceptoLibreCalculatorProps> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const total = useMemo(() => price * quantity, [price, quantity]);

    const handleSaveItem = () => {
        if (!name.trim() || price <= 0) {
            // Optionally, add a toast notification for validation
            return;
        }
        onSave({
            name: name.trim(),
            details: details.trim(),
            quantity,
            price,
            total,
        });
        // Reset form
        setName('');
        setDetails('');
        setQuantity(1);
        setPrice(0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-medium">Crear Concepto Libre</h3>
                <p className="text-sm text-muted-foreground">
                    Añade cualquier servicio o producto personalizado al presupuesto, como instalación, transporte u otros cargos.
                </p>
                 <div className="space-y-4 pt-4">
                     <div>
                        <Label htmlFor="free-concept-name">Nombre del Concepto</Label>
                        <Input 
                            id="free-concept-name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ej: Instalación y montaje"
                        />
                    </div>
                     <div>
                        <Label htmlFor="free-concept-details">Detalles (Opcional)</Label>
                        <Textarea
                             id="free-concept-details"
                             value={details}
                             onChange={(e) => setDetails(e.target.value)}
                             placeholder="Añade una descripción más detallada si es necesario"
                        />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Precio Unitario (€)</Label>
                            <Input 
                                type="number" 
                                value={price} 
                                onChange={e => setPrice(Number(e.target.value))}
                                min="0"
                            />
                        </div>
                        <div>
                            <Label>Cantidad</Label>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                                <Input type="number" className="w-20 text-center" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} min="1" />
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Concepto Libre"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="service tools"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground mb-2">{formatCurrency(price)} / ud.</p>
                        {name && <p className="font-semibold text-sm break-words">{name} (x{quantity})</p>}
                        {details && <p className="text-xs text-muted-foreground break-words">{details}</p>}
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full" disabled={!name.trim() || price <= 0}>Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
