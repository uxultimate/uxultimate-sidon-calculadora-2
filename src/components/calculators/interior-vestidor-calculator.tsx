
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lacaColorOptions, melaminaColorOptions } from './utils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface InteriorVestidorCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const InteriorVestidorCalculator: React.FC<InteriorVestidorCalculatorProps> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState<{width: number | '', height: number | '', depth: number | ''}>({ width: 2000, height: 2400, depth: 550 });
    const [thickness, setThickness] = useState<'19mm' | '30mm'>('19mm');
    const [materialKey, setMaterialKey] = useState<string>('Melamina_blanco_o_lino_cancun_textil');
    const [supplements, setSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    const [selectedMelaminaColor, setSelectedMelaminaColor] = useState<string>('Blanco');
    const [selectedLacaColor, setSelectedLacaColor] = useState<string>('Laca Blanca');

    const showMelaminaColorSwatches = materialKey === 'Melamina_colores';
    const showLacaColorSwatches = materialKey === 'Laca_blanca';
    
    const materialsForThickness = tarifa2025["Interior y Vestidor"].Precios_por_metro_lineal_unidad[thickness];

    const materialGroups = {
        'Melaminas': ['Melamina_blanco_o_lino_cancun_textil', 'Melamina_colores'],
        'Lacas': ['Laca_blanca'],
        'Maderas': ['Madera_roble'],
        'Colecciones (30mm)': ['30mm_Coleccion_Aire_o_Columna'],
    };

    const handleThicknessChange = (newThickness: '19mm' | '30mm') => {
        setThickness(newThickness);
        const newMaterials = tarifa2025["Interior y Vestidor"].Precios_por_metro_lineal_unidad[newThickness];
        if (!newMaterials[materialKey as keyof typeof newMaterials]) {
            setMaterialKey(Object.keys(newMaterials)[0]);
        }
    };

    const handleMeasurementChange = (field: 'width' | 'height' | 'depth', value: string | number) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const handleSupplementQuantityChange = (concepto: string, quantity: number) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], quantity } }));
    };


    const { total, details, name } = useMemo(() => {
        const widthInMeters = (Number(measurements.width) || 0) / 1000;
        const widthInMm = Number(measurements.width) || 0;
        const heightInMm = Number(measurements.height) || 0;
        const depthInMm = Number(measurements.depth) || 0;

        let priceRange;
        const materialData = materialsForThickness[materialKey as keyof typeof materialsForThickness];
        if (typeof materialData !== 'number' && materialData) {
            if (widthInMm <= 1000) priceRange = materialData.hasta_1000;
            else if (widthInMm <= 2000) priceRange = materialData.hasta_2000;
            else if (widthInMm <= 3000) priceRange = materialData.hasta_3000;
            else priceRange = materialData.mas_de_3000;
        } else if (typeof materialData === 'number') {
            priceRange = materialData;
        }

        const basePricePerMeter = priceRange || 0;
        let baseTotal = basePricePerMeter * widthInMeters;
        
        const finalName = "Interior y Vestidor";
        const materialName = materialKey.replace(/_/g, ' ');
        const detailsArray = [`${thickness} ${materialName}`, `${measurements.height}x${measurements.width}x${measurements.depth}mm`];
        
        let finalTotal = baseTotal;

        if (heightInMm > 2400) {
            const extraHeightCm = Math.ceil((heightInMm - 2400) / 100);
            const extraCostPercentage = extraHeightCm * 0.10;
            finalTotal += baseTotal * extraCostPercentage;
            detailsArray.push(`Sup. altura > 2400mm (+${(extraCostPercentage*100).toFixed(0)}%)`);
        } else if (heightInMm > 0 && heightInMm < 800) {
             finalTotal *= 0.50; // 50% discount
             detailsArray.push('Dto. altura < 800mm (-50%)');
        } else if (heightInMm > 0 && heightInMm < 1500) {
             finalTotal *= 0.70; // 30% discount
             detailsArray.push('Dto. altura < 1500mm (-30%)');
        }

        if (depthInMm > 650) {
            const extraDepthCm = Math.ceil((depthInMm - 650) / 100);
            const extraCostPercentage = extraDepthCm * 0.10;
            finalTotal += baseTotal * extraCostPercentage;
            detailsArray.push(`Sup. fondo > 650mm (+${(extraCostPercentage*100).toFixed(0)}%)`);
        } else if (depthInMm > 0 && depthInMm < 400) {
            finalTotal *= 0.75; // 25% discount
            detailsArray.push('Dto. fondo < 400mm (-25%)');
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
        } else if (materialKey === 'Melamina_blanco_o_lino_cancun_textil') {
            detailsArray.push('Blanco o Lino Cancun Textil');
        }

        Object.entries(supplements).forEach(([concepto, { checked, quantity }]) => {
            if (checked) {
                const supplementInfo = tarifa2025["Interior y Vestidor"].Suplementos_y_Anadidos.find(s => s.Concepto === concepto);
                if (supplementInfo) {
                    let supplementPrice = 0;
                    let description = `${concepto}`;
                    
                    if (supplementInfo.Valor.includes('%')) {
                        const percentage = parseFloat(supplementInfo.Valor.replace('%', '')) / 100;
                        supplementPrice = baseTotal * percentage;
                    } else if (supplementInfo.Valor.includes('ud. hueco') || supplementInfo.Valor.includes('ud.')) {
                        const pricePerUnit = parseFloat(supplementInfo.Valor.replace(/€ ud\.? (hueco)?/i, ''));
                        supplementPrice = pricePerUnit * (quantity || 1);
                        description += ` (x${quantity || 1})`;
                    }

                    finalTotal += supplementPrice;
                    detailsArray.push(description);
                }
            }
        });


        return { name: finalName, total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, thickness, materialKey, materialsForThickness, supplements, showMelaminaColorSwatches, selectedMelaminaColor, showLacaColorSwatches, selectedLacaColor]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity: 1,
            price: total,
            total,
        });
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
                            <div className="space-y-2">
                                <Label>Alto (mm)</Label>
                                <Input name="height" type="number" value={measurements.height} onChange={(e) => handleMeasurementChange('height', e.target.value)} className="mb-[15px]" />
                                <Slider
                                    value={[Number(measurements.height) || 0]}
                                    onValueChange={(value) => handleMeasurementChange('height', value[0])}
                                    max={4000}
                                    min={500}
                                    step={10}
                                />
                                {(Number(measurements.height) || 0) > 2400 && (
                                    <p className="text-xs text-muted-foreground mt-1">Sup. altura &gt; 2400mm (+10% cada 10cm)</p>
                                )}
                                {(Number(measurements.height) || 0) < 1500 && (Number(measurements.height) || 0) >= 800 && (
                                     <p className="text-xs text-muted-foreground mt-1">Dto. altura &lt; 1500mm (-30%)</p>
                                )}
                                {(Number(measurements.height) || 0) < 800 && (Number(measurements.height) || 0) > 0 && (
                                     <p className="text-xs text-muted-foreground mt-1">Dto. altura &lt; 800mm (-50%)</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Ancho (mm)</Label>
                                <Input name="width" type="number" value={measurements.width} onChange={(e) => handleMeasurementChange('width', e.target.value)} className="mb-[15px]" />
                                <Slider
                                    value={[Number(measurements.width) || 0]}
                                    onValueChange={(value) => handleMeasurementChange('width', value[0])}
                                    max={6000}
                                    min={500}
                                    step={10}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fondo (mm)</Label>
                                <Input name="depth" type="number" value={measurements.depth} onChange={(e) => handleMeasurementChange('depth', e.target.value)} className="mb-[15px]" />
                                <Slider
                                    value={[Number(measurements.depth) || 0]}
                                    onValueChange={(value) => handleMeasurementChange('depth', value[0])}
                                    max={1000}
                                    min={300}
                                    step={10}
                                />
                                {(Number(measurements.depth) || 0) > 650 && (
                                    <p className="text-xs text-muted-foreground mt-1">Sup. fondo &gt; 650mm (+10% cada 10cm)</p>
                                )}
                                {(Number(measurements.depth) || 0) < 400 && (Number(measurements.depth) || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">Dto. fondo &lt; 400mm (-25%)</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Grosor</Label>
                                <Select value={thickness} onValueChange={(val) => handleThicknessChange(val as typeof thickness)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="19mm">19mm</SelectItem>
                                        <SelectItem value="30mm">30mm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Material</Label>
                                <Select value={materialKey} onValueChange={setMaterialKey}>
                                    <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(materialGroups).map(([groupName, materials]) => {
                                            const availableMaterials = materials.filter(mat => Object.keys(materialsForThickness).includes(mat));
                                            if (availableMaterials.length === 0) return null;
                                            return (
                                                <SelectGroup key={groupName}>
                                                    <SelectLabel>{groupName}</SelectLabel>
                                                    {availableMaterials.map((key) => (
                                                        <SelectItem key={key} value={key}>
                                                            {key.replace(/_/g, ' ').replace('30mm ', '')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {showLacaColorSwatches && (
                            <div className="border-t pt-4">
                                <Label className="mb-2 block">Color Laca (+20% sobre material)</Label>
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
                             <div className='border-t pt-4'>
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
                                {tarifa2025["Interior y Vestidor"].Suplementos_y_Anadidos.map((supp, index) => {
                                    if (supp.Concepto.startsWith('Alturas') || supp.Concepto.startsWith('Fondos') || supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Valor.includes('metro lineal') || supp.Concepto === "Laca RAL o según muestra") return null;
                                    const needsQuantity = supp.Valor.includes('ud');
                                    return (
                                        <div key={`${supp.Concepto}-${index}`} className="flex items-center justify-between p-2 rounded-md border">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`supp-interior-${supp.Concepto}`}
                                                    onCheckedChange={(checked) => handleSupplementChange(supp.Concepto, !!checked)}
                                                    checked={supplements[supp.Concepto]?.checked || false}
                                                />
                                                <Label htmlFor={`supp-interior-${supp.Concepto}`} className="font-normal text-sm">{supp.Concepto} <span className="text-xs text-muted-foreground">({supp.Valor})</span></Label>
                                            </div>
                                            {needsQuantity && supplements[supp.Concepto]?.checked && (
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8"
                                                    min="1"
                                                    value={supplements[supp.Concepto]?.quantity || 1}
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
                    src="/images/interior/sidon-armarios-vestidor-modular-19-600x400.png?v=1.0"
                    alt="Interior y Vestidor"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="wardrobe"
                />
                <Card>
                    <CardHeader><CardTitle>Total del Concepto</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="font-semibold text-sm break-words">{name}</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
