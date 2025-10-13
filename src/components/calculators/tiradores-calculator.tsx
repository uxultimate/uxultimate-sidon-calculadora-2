
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
import { ColorSwatch, colorHexMap } from './utils';
import { formatCurrency } from '@/lib/utils';

interface TiradoresCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

const tiradorImages: Record<string, string> = {
    'TIR10': '/images/tiradores/tir10-laton.png',
    'TIR11': '/images/tiradores/tir11-negro.png',
    'TIR12': '/images/tiradores/tir12-laton-antiguo.png',
    'TIR13': '/images/tiradores/tir13-inox.png',
    'TIR20': '/images/tiradores/tir20-roble.png',
    'TIR21': '/images/tiradores/tir21-roble.png',
    'TIR22': '/images/tiradores/tir22-negro.png',
    'TIR23': '/images/tiradores/tir23-negro-roble.png',
    'TIR30': '/images/tiradores/tir30-negro.png',
    'TIR40': '/images/tiradores/tir40-inox.png',
    'TIR41': '/images/tiradores/tir41-bronce.png',
    'TIR42': '/images/tiradores/tir42-negro.png',
    'TIR50': '/images/tiradores/tir50-laton.png',
    'TIR51': '/images/tiradores/tir51-negro.png',
    'TIR52': '/images/tiradores/tir52-negro.png',
    'TIR53': '/images/tiradores/tir53-marmol-verde.png',
    'TIR54': '/images/tiradores/tir54-tenido-negro.png',
    'TIR60': '/images/tiradores/tir60-blanco.png'
};


export const TiradoresCalculator: React.FC<TiradoresCalculatorProps> = ({ onSave }) => {
    const tiradorDefault = tarifa2025.Tiradores.find(t => t.Modulo === 'TIR10') || tarifa2025.Tiradores[0];
    const [selectedTirador, setSelectedTirador] = useState(tiradorDefault);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('Latón');

    const handleTiradorChange = (modulo: string) => {
        const tirador = tarifa2025.Tiradores.find(t => t.Modulo === modulo);
        if (tirador) {
            setSelectedTirador(tirador);
            setSelectedColor(tirador.colors[0]);
        }
    };

    const total = selectedTirador.Precio * quantity;

    const {name, details} = useMemo(() => {
        const finalName = `Tirador ${selectedTirador.Modulo}`;
        const finalDetails = `Material: ${selectedTirador.Material}, Acabado: ${selectedColor}`;
        return { name: finalName, details: finalDetails };
    }, [selectedTirador, selectedColor]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity,
            price: selectedTirador.Precio,
            total,
        });
    };
    
    const currentImage = useMemo(() => {
        return tiradorImages[selectedTirador.Modulo] || 'https://placehold.co/600x400.png';
    }, [selectedTirador]);

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Modelo de Tirador</Label>
                        <Select
                            value={selectedTirador.Modulo}
                            onValueChange={handleTiradorChange}
                        >
                            <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {tarifa2025.Tiradores.map((t, index) => (
                                    <SelectItem key={`${t.Modulo}-${index}`} value={t.Modulo}>{t.Modulo} - {t.Acabado}</SelectItem>
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
                 <div>
                    <Label className="mb-2 block">Acabado / Color</Label>
                     <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {selectedTirador.colors.map((color, index) => (
                            <ColorSwatch
                                key={`${color}-${index}`}
                                color={colorHexMap[color] || "#FFFFFF"}
                                name={color}
                                isSelected={selectedColor === color}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                    </div>
                 </div>
                 <Card>
                    <CardHeader><CardTitle>Detalles</CardTitle></CardHeader>
                    <CardContent className="text-sm grid grid-cols-2 gap-2">
                        <p><b>Material:</b> {selectedTirador.Material}</p>
                        <p><b>Acabado Predeterminado:</b> {selectedTirador.Acabado}</p>
                        <p><b>Largo:</b> {selectedTirador.Largo || 'N/A'} mm</p>
                        <p><b>Alto:</b> {selectedTirador.Alto || 'N/A'} mm</p>
                        <p><b>Ancho:</b> {selectedTirador.Ancho || 'N/A'} mm</p>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-1.5'>
                    <Image
                        src={currentImage}
                        alt={selectedTirador.Modulo}
                        width={600}
                        height={400}
                        className="rounded-md object-cover aspect-[3/2]"
                        data-ai-hint="handle"
                    />
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground mb-2">{formatCurrency(selectedTirador.Precio)} / ud.</p>
                        <p className="font-semibold text-sm break-words">{name} (x{quantity})</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
