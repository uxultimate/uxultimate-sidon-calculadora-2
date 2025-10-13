
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { tarifa2025 } from '@/lib/tarifa';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Minus, Plus, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { lacaColorOptions, melaminaColorOptions } from './utils';
import { cn } from '@/lib/utils';


interface CajonesCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const CajonesCalculator: React.FC<CajonesCalculatorProps> = ({ onSave }) => {
    const [itemType, setItemType] = useState('Cajones');
    const [width, setWidth] = useState(500);
    const [material, setMaterial] = useState('Melamina_blanco_o_lino_cancun_textil');
    const [quantity, setQuantity] = useState(1);
    const [selectedLacaColor, setSelectedLacaColor] = useState<string>('Laca Blanca');
    const [selectedMelaminaColor, setSelectedMelaminaColor] = useState<string>('Blanco');
    
    const itemData = tarifa2025["Cajones_Zapateros_Bandejas"].Precios_por_Unidad_Ancho[itemType as keyof typeof tarifa2025["Cajones_Zapateros_Bandejas"]["Precios_por_Unidad_Ancho"]];
    const materialData = itemData[material as keyof typeof itemData];

    const showLacaColorSwatches = material === 'Laca';
    const showMelaminaColorSwatches = material === 'Melamina_colores';

    const materialGroups = {
        'Melaminas': ['Melamina_blanco_o_lino_cancun_textil', 'Melamina_colores'],
        'Laca': ['Laca'],
        'Madera': ['Madera'],
        'Celdillas': ['Celdillas_Melamina', 'Celdillas_Laca', 'Celdillas_Madera'],
    };

    const handleItemTypeChange = (newItemType: string) => {
        setItemType(newItemType);
        const newItemData = tarifa2025["Cajones_Zapateros_Bandejas"].Precios_por_Unidad_Ancho[newItemType as keyof typeof tarifa2025["Cajones_Zapateros_Bandejas"]["Precios_por_Unidad_Ancho"]];
        if (!Object.keys(newItemData).includes(material)) {
            setMaterial(Object.keys(newItemData)[0]);
        }
    };

    const getPriceForWidth = () => {
        if (!materialData) return 0;
        if (width <= 500) return materialData.hasta_500;
        if (width <= 700) return materialData.hasta_700;
        if (width <= 900) return materialData.hasta_900;
        if (width <= 1100) return materialData.hasta_1100;
        return 0;
    };

    const pricePerUnit = getPriceForWidth();
    const total = pricePerUnit * quantity;

    const {name, details} = useMemo(() => {
        const finalName = `${itemType.replace(/_/g, ' ')}`;
        const detailsArray = [`Ancho: ${width}mm`, `Material: ${material.replace(/_/g, ' ')}`];

        if (showLacaColorSwatches) {
            detailsArray.push(selectedLacaColor);
        }
        if (showMelaminaColorSwatches) {
            detailsArray.push(selectedMelaminaColor);
        }
        
        return { name: finalName, details: detailsArray.join(', ') };
    }, [itemType, width, material, showLacaColorSwatches, selectedLacaColor, showMelaminaColorSwatches, selectedMelaminaColor]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity,
            price: pricePerUnit,
            total: total,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Tipo de Accesorio</Label>
                        <Select value={itemType} onValueChange={handleItemTypeChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.keys(tarifa2025["Cajones_Zapateros_Bandejas"].Precios_por_Unidad_Ancho).map((type, index) => (
                                    <SelectItem key={`${type}-${index}`} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Material</Label>
                        <Select value={material} onValueChange={setMaterial}>
                            <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(materialGroups).map(([groupName, materials]) => {
                                    const availableMaterials = materials.filter(mat => Object.keys(itemData).includes(mat));
                                    if (availableMaterials.length === 0) return null;

                                    return (
                                        <SelectGroup key={groupName}>
                                            <SelectLabel>{groupName}</SelectLabel>
                                            {availableMaterials.map((mat, index) => (
                                                <SelectItem key={`${mat}-${index}`} value={mat}>{mat.replace(/_/g, ' ')}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Ancho del Hueco (mm)</Label>
                        <Input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} />
                    </div>
                    <div>
                        <Label>Cantidad</Label>
                         <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" className="w-20 text-center" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                         </div>
                    </div>
                </div>

                {showLacaColorSwatches && (
                    <div>
                        <Label className="mb-2 block">Color Laca (+20% sobre material)</Label>
                        <div className="flex flex-wrap gap-2 pb-4">
                            {lacaColorOptions.map((color, index) => (
                                <div key={`${color.name}-${index}`} className="flex flex-col items-center gap-2 w-20">
                                    <button type="button" onClick={() => setSelectedLacaColor(color.name)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                                        <div className="relative">
                                            <Image 
                                                src={color.imageUrl}
                                                alt={color.name}
                                                width={64}
                                                height={64}
                                                className={cn('h-16 w-16 rounded-md object-cover border-2 transition-all', 
                                                    selectedLacaColor === color.name ? 'border-primary' : 'border-transparent',
                                                    (color.name === 'Laca Blanca' || color.name === 'Laca RAL') && 'shadow-[1px_1px_2px_#aaa]'
                                                )}
                                            />
                                            {selectedLacaColor === color.name && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-md">
                                                    <Check className={cn("h-6 w-6", (color.name === 'Laca Blanca' || color.name === 'Laca RAL') ? 'text-gray-800' : 'text-white')} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    <p className={`text-xs text-center w-full ${selectedLacaColor === color.name ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                        {color.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {showMelaminaColorSwatches && (
                     <div>
                        <Label className="mb-2 block">Color Melamina</Label>
                        <div className="flex flex-wrap gap-4">
                            {melaminaColorOptions.map((color) => (
                                <div key={color.name}>
                                    <div className="flex flex-col items-center gap-2 w-20">
                                        <button type="button" onClick={() => setSelectedMelaminaColor(color.name)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                                            <div className="relative">
                                                <Image
                                                    src={color.imageUrl}
                                                    alt={color.name}
                                                    width={64}
                                                    height={64}
                                                    className={cn('h-16 w-16 rounded-md object-cover border-2 transition-all',
                                                        selectedMelaminaColor === color.name ? 'border-primary' : 'border-transparent',
                                                        color.name === 'Blanco' && 'shadow-[1px_1px_2px_#aaa]'
                                                    )}
                                                />
                                                {selectedMelaminaColor === color.name && (
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-md">
                                                         <Check className={cn("h-6 w-6", color.name === 'Blanco' ? 'text-gray-800' : 'text-white')} />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                        <p className={`text-xs text-center w-full ${selectedMelaminaColor === color.name ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                            {color.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-sm text-muted-foreground pt-4">
                    <p>Calculadora para cajones, zapateros y otros accesorios. Selecciona el tipo, material, ancho del hueco y la cantidad.</p>
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src="/images/cajones/cajones-armarios-sidon-600x400.png?v=1.0"
                    alt="Cajones y Accesorios"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="drawer"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground mb-2">{formatCurrency(pricePerUnit)} / ud.</p>
                        <p className="font-semibold text-sm break-words">{name} (x{quantity})</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
}

    