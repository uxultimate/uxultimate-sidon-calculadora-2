
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { tarifa2025 } from '@/lib/tarifa';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lacaColorOptions, melaminaColorOptions } from './utils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Check, Minus, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface FrenteAbatibleCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export function FrenteAbatibleCalculator({ onSave }: FrenteAbatibleCalculatorProps) {
    const [measurements, setMeasurements] = useState<{width: number | '', height: number | ''}>({ width: 1000, height: 2400 });
    const [doorCount, setDoorCount] = useState(2);
    const [material, setMaterial] = useState('Laca_blanca_lisa');
    const materials = tarifa2025["Frente Abatible y Plegable"].Precios_por_Material_Euro_m_lineal["19mm"];
    const [supplements, setSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    const [selectedLacaColor, setSelectedLacaColor] = useState<string>('Laca Blanca');
    const [selectedMelaminaColor, setSelectedMelaminaColor] = useState<string>('Blanco');
    
    const showLacaColorSwatches = material.startsWith('Laca_');
    const showMelaminaColorSwatches = material === 'Melamina_colores';

    const handleMeasurementChange = (field: 'width' | 'height', value: string | number) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        const supplementInfo = tarifa2025["Frente Abatible y Plegable"].Suplementos_y_Accesorios.find(s => s.Concepto === concepto);
        const needsQuantity = supplementInfo?.Valor.includes('ud') || supplementInfo?.Valor.includes('cada');
        const defaultQuantity = needsQuantity ? doorCount : 1;
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || defaultQuantity } }));
    };

    const handleSupplementQuantityChange = (concepto: string, quantity: number) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], quantity } }));
    };

    const { total, name, details } = useMemo(() => {
        const widthInMeters = (Number(measurements.width) || 0) / 1000;
        const heightInMm = Number(measurements.height) || 0;
        let basePricePerMeter = materials[material as keyof typeof materials] || 0;
        let baseTotal = basePricePerMeter * widthInMeters;

        const isPlegable = supplements['Herraje plegable']?.checked;
        const finalName = isPlegable ? "Frente Plegable" : "Frente Abatible";
        
        const doorString = `${doorCount} ${doorCount > 1 ? 'puertas' : 'puerta'}`;
        const detailsArray = [doorString, `${material.replace(/_/g, ' ')}`, `${measurements.height}x${measurements.width}mm`];
        
        let finalTotal = baseTotal;
        let heightSupplementText = '';
        let discountText = '';

        if (heightInMm > 2400) {
            const extraHeightCm = Math.ceil((heightInMm - 2400) / 100);
            const extraCostPercentage = extraHeightCm * 0.10;
            const heightSupplement = baseTotal * extraCostPercentage;
            finalTotal += heightSupplement;
            heightSupplementText = `Sup. altura > 2400mm (+${(extraCostPercentage * 100).toFixed(0)}%)`;
        } else if (heightInMm > 0 && heightInMm < 800) {
            finalTotal *= 0.50; // 50% discount
            discountText = `Dto. altura < 800mm (-50%)`;
        } else if (heightInMm > 0 && heightInMm < 1500) {
            finalTotal *= 0.70; // 30% discount
            discountText = `Dto. altura < 1500mm (-30%)`;
        }
        
        if (showLacaColorSwatches) {
            detailsArray.push(selectedLacaColor);
            if (selectedLacaColor !== 'Laca Blanca') {
                const colorSupplement = finalTotal * 0.20;
                finalTotal += colorSupplement;
                detailsArray.push('Sup. Laca color (+20%)');
            }
        }

        if (showMelaminaColorSwatches) {
            detailsArray.push(selectedMelaminaColor);
        }
        
        if(heightSupplementText) detailsArray.push(heightSupplementText);
        if(discountText) detailsArray.push(discountText);


        Object.entries(supplements).forEach(([concepto, { checked, quantity }]) => {
            if (checked) {
                const supplementInfo = tarifa2025["Frente Abatible y Plegable"].Suplementos_y_Accesorios.find(s => s.Concepto === concepto);
                if (supplementInfo) {
                    let supplementPrice = 0;
                    let description = `${concepto}`;
                    
                    if (supplementInfo.Valor.includes('%')) {
                        const percentage = parseFloat(supplementInfo.Valor.replace('%', '')) / 100;
                        supplementPrice = baseTotal * percentage;
                    } else if (supplementInfo.Valor.includes('ud. puerta') || supplementInfo.Valor.includes('cada puerta')) {
                        const pricePerUnit = parseFloat(supplementInfo.Valor.replace(/€ (ud\. puerta|cada puerta)/i, ''));
                        const numItems = quantity || doorCount;
                        supplementPrice = pricePerUnit * numItems;
                        description += ` (x${numItems})`;
                    } else if (supplementInfo.Valor.includes('metro lineal')) {
                        const pricePerMeter = parseFloat(supplementInfo.Valor.replace('€ metro lineal', ''));
                        supplementPrice = pricePerMeter * widthInMeters;
                    }
                    finalTotal += supplementPrice;
                    detailsArray.push(description);
                }
            }
        });

        return { name: finalName, total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, material, materials, supplements, showLacaColorSwatches, selectedLacaColor, showMelaminaColorSwatches, selectedMelaminaColor, doorCount]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity: 1, // The group is one unit, doors are in description
            price: total,
            total,
        });
    };
    
    const materialGroups = {
        'Melaminas': ['Melamina_blanco_liso', 'Melamina_colores'],
        'Cristales': ['Cristal_o_espejo'],
        'Lacas': ['Laca_blanca_lisa', 'Laca_blanca_pantografos_o_uneros', 'Laca_blanca_fresada_o_plafon', 'Laca_blanca_vidriera'],
        'Maderas': ['Madera_roble_barniz_mate_natura', 'Madera_nogal_barniz_mate_natura', 'Madera_roble_barniz_mate_natura_UNERO', 'Madera_roble_barniz_mate_natura_UÑERO_otro'],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                 <Tabs defaultValue="config" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="config">Configuración</TabsTrigger>
                        <TabsTrigger value="suplementos">Suplementos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="config" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className='space-y-2'>
                                <Label>Alto (mm)</Label>
                                <Input name="height" type="number" value={measurements.height} onChange={(e) => handleMeasurementChange('height', e.target.value)} />
                                <Slider
                                    value={[Number(measurements.height) || 0]}
                                    onValueChange={(value) => handleMeasurementChange('height', value[0])}
                                    max={4000}
                                    min={500}
                                    step={10}
                                />
                                {(Number(measurements.height) || 0) > 2400 && (
                                    <p className="text-xs text-muted-foreground mt-1">Sup. altura &gt; 2400mm (+{Math.ceil(((Number(measurements.height) || 0) - 2400) / 100) * 10}%)</p>
                                )}
                                {(Number(measurements.height) || 0) < 1500 && (Number(measurements.height) || 0) >= 800 && (
                                     <p className="text-xs text-muted-foreground mt-1">Dto. altura &lt; 1500mm (-30%)</p>
                                )}
                                {(Number(measurements.height) || 0) < 800 && (Number(measurements.height) || 0) > 0 && (
                                     <p className="text-xs text-muted-foreground mt-1">Dto. altura &lt; 800mm (-50%)</p>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <Label>Ancho (mm)</Label>
                                <Input name="width" type="number" value={measurements.width} onChange={(e) => handleMeasurementChange('width', e.target.value)} />
                                <Slider
                                    value={[Number(measurements.width) || 0]}
                                    onValueChange={(value) => handleMeasurementChange('width', value[0])}
                                    max={6000}
                                    min={500}
                                    step={10}
                                />
                            </div>
                            <div>
                                <Label>Nº Puertas</Label>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setDoorCount(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                                    <Input type="number" className="text-center w-20" value={doorCount} onChange={e => setDoorCount(Number(e.target.value) || 1)} min="1" />
                                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setDoorCount(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Label>Material</Label>
                            <Select value={material} onValueChange={setMaterial}>
                                <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(materialGroups).map(([groupName, groupMaterials]) => (
                                        <SelectGroup key={groupName}>
                                            <SelectLabel>{groupName}</SelectLabel>
                                            {groupMaterials.map((key) => {
                                                const value = materials[key as keyof typeof materials];
                                                if (!value) return null;
                                                return (
                                                    <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')} ({formatCurrency(value)}/ml)</SelectItem>
                                                )
                                            })}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {showLacaColorSwatches && (
                            <div>
                                <Label className="mb-2 block">Color Laca</Label>
                                <div className="flex flex-wrap gap-2 pb-4">
                                    {lacaColorOptions.map((color, index) => (
                                        <button type="button" key={`${color.name}-${index}`} onClick={() => setSelectedLacaColor(color.name)} className="flex flex-col items-center gap-2 w-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1">
                                            <div className="relative">
                                                <Image 
                                                    src={color.imageUrl}
                                                    alt={color.name}
                                                    width={64}
                                                    height={64}
                                                    className={cn('h-16 w-16 rounded-full object-cover border-2 transition-all', 
                                                        selectedLacaColor === color.name ? 'border-primary' : 'border-transparent',
                                                        (color.name === 'Laca Blanca' || color.name === 'Laca RAL') && 'shadow-lg'
                                                    )}
                                                />
                                                 {selectedLacaColor === color.name && (
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/30">
                                                        <Check className="h-6 w-6 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-xs text-center w-full ${selectedLacaColor === color.name ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                                {color.name}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {showMelaminaColorSwatches && (
                            <div className="border-t pt-4">
                                <Label className="mb-2 block">Color Melamina</Label>
                                <div className="flex flex-wrap gap-4">
                                    {melaminaColorOptions.map((color) => (
                                        <button type="button" key={color.name} onClick={() => setSelectedMelaminaColor(color.name)} className="flex flex-col items-center gap-2 w-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1">
                                            <div className="relative">
                                                <Image
                                                    src={color.imageUrl}
                                                    alt={color.name}
                                                    width={64}
                                                    height={64}
                                                    className={cn('h-16 w-16 rounded-full object-cover border-2 transition-all',
                                                        selectedMelaminaColor === color.name ? 'border-primary' : 'border-transparent',
                                                        color.name === 'Blanco' && 'shadow-lg'
                                                    )}
                                                />
                                                {selectedMelaminaColor === color.name && (
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/30">
                                                        <Check className="h-6 w-6 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-xs text-center w-full ${selectedMelaminaColor === color.name ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                                {color.name}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="suplementos" className="pt-4">
                        <ScrollArea className="h-72 border rounded-md p-4">
                            <div className="space-y-2">
                                {tarifa2025["Frente Abatible y Plegable"].Suplementos_y_Accesorios.map((supp, index) => {
                                    if (supp.Concepto.startsWith('Alturas') || supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Concepto === "Laca RAL o según muestra") return null;
                                    const needsQuantity = supp.Valor.includes('ud') || supp.Valor.includes('cada');
                                    return (
                                        <div key={`${supp.Concepto}-${index}`} className="flex items-center justify-between p-2 rounded-md border">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`supp-abatible-${supp.Concepto}`}
                                                    onCheckedChange={(checked) => handleSupplementChange(supp.Concepto, !!checked)}
                                                    checked={supplements[supp.Concepto]?.checked || false}
                                                />
                                                <Label htmlFor={`supp-abatible-${supp.Concepto}`} className="font-normal text-sm">{supp.Concepto} <span className="text-xs text-muted-foreground">({supp.Valor})</span></Label>
                                            </div>
                                            {needsQuantity && supplements[supp.Concepto]?.checked && (
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8"
                                                    min="1"
                                                    value={supplements[supp.Concepto]?.quantity || doorCount}
                                                    onChange={(e) => handleSupplementQuantityChange(supp.Concepto, parseInt(e.target.value) || 1)}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                 </Tabs>
            </div>
            <div className="md:col-span-1 space-y-4 self-start md:sticky md:top-20">
                <Image
                    src="/images/armarios/sidon-armario-abatible-mura-600x400.png"
                    alt="Frente Abatible"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="closet"
                />
                <Card>
                    <CardHeader><CardTitle>Total del Concepto</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="font-semibold text-sm break-words">{name} (x1)</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
}
