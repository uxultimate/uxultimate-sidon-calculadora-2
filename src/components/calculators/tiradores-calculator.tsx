"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { tarifa2025 } from '@/lib/tarifa';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Check } from 'lucide-react';
import { ColorSwatch, colorHexMap } from './utils';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

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

const tiradorSmallImages: Record<string, string> = {
    'TIR10': '/images/tiradores/tiradores-small/tir10-laton-small.png?v=1.0',
    'TIR11': '/images/tiradores/tiradores-small/tir11-negro-small.png?v=1.0',
    'TIR12': '/images/tiradores/tiradores-small/tir12-laton-antiguo-small.png?v=1.0',
    'TIR13': '/images/tiradores/tiradores-small/tir13-inox-small.png?v=1.0',
    'TIR20': '/images/tiradores/tiradores-small/tir20-roble-small.png?v=1.0',
    'TIR21': '/images/tiradores/tiradores-small/tir21-roble-small.png?v=1.0',
    'TIR22': '/images/tiradores/tiradores-small/tir22-negro-small.png?v=1.0',
    'TIR23': '/images/tiradores/tiradores-small/tir23-negro-roble-small.png?v=1.0',
    'TIR30': '/images/tiradores/tiradores-small/tir30-negro-small.png?v=1.0',
    'TIR40': '/images/tiradores/tiradores-small/tir40-inox-small.png?v=1.0',
    'TIR41': '/images/tiradores/tiradores-small/tir41-bronce-small.png?v=1.0',
    'TIR42': '/images/tiradores/tiradores-small/tir42-negro-small.png?v=1.0',
    'TIR50': '/images/tiradores/tiradores-small/tir50-laton-small.png?v=1.0',
    'TIR51': '/images/tiradores/tiradores-small/tir51-negro-small.png?v=1.0',
    'TIR52': '/images/tiradores/tiradores-small/tir52-negro-small.png?v=1.0',
    'TIR53': '/images/tiradores/tiradores-small/tir53-marmol-verde-small.png?v=1.0',
    'TIR54': '/images/tiradores/tiradores-small/tir54-tenido-negro-small.png?v=1.0',
    'TIR60': '/images/tiradores/tiradores-small/tir60-blanco-small.png?v=1.0'
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
        return (tiradorImages[selectedTirador.Modulo] || 'https://placehold.co/600x400.png') + '?v=1.0';
    }, [selectedTirador]);

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className="md:col-span-2 flex flex-col space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div>
                        <Label>Modelo de Tirador</Label>
                        <ScrollArea className="h-72 w-full rounded-md border mt-2">
                             <div className="p-2 pr-4 space-y-1">
                                {tarifa2025.Tiradores.map((t) => (
                                    <button
                                        key={t.Modulo}
                                        type="button"
                                        onClick={() => handleTiradorChange(t.Modulo)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-2 rounded-md text-left transition-colors",
                                            selectedTirador.Modulo === t.Modulo
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/50"
                                        )}
                                    >
                                        <Image
                                            src={tiradorSmallImages[t.Modulo] || 'https://placehold.co/100x100.png'}
                                            alt={t.Modulo}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover bg-white w-16 h-16"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{t.Modulo}</p>
                                            <p className="text-xs text-muted-foreground">{t.Acabado}</p>
                                        </div>
                                         {selectedTirador.Modulo === t.Modulo && (
                                            <Check className="h-5 w-5 text-primary ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                     <div>
                         <div>
                            <Label>Cantidad</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                                <Input type="number" className="text-center w-20" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="mt-4">
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
                    </div>
                </div>
                 <Card className="flex-grow flex flex-col">
                    <CardHeader><CardTitle>Detalles</CardTitle></CardHeader>
                    <CardContent className="text-sm grid grid-cols-2 gap-2 flex-grow">
                        <p><b>Material:</b> {selectedTirador.Material}</p>
                        <p><b>Acabado Predeterminado:</b> {selectedTirador.Acabado}</p>
                        <p><b>Largo:</b> {selectedTirador.Largo || 'N/A'} mm</p>
                        <p><b>Alto:</b> {selectedTirador.Alto || 'N/A'} mm</p>
                        <p><b>Ancho:</b> {selectedTirador.Ancho || 'N_A'} mm</p>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-4 self-start md:sticky md:top-20">
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
