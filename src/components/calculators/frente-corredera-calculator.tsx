
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { tarifa2025 } from '@/lib/tarifa';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lacaColorOptions, melaminaColorOptions } from './utils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Check, Minus, Plus } from 'lucide-react';

interface FrenteCorrederaCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export function FrenteCorrederaCalculator({ onSave }: FrenteCorrederaCalculatorProps) {
    const [measurements, setMeasurements] = useState<{width: number | '', height: number | ''}>({ width: 1800, height: 2400 });
    const [doorCount, setDoorCount] = useState(2);
    const [material, setMaterial] = useState('Melamina_blanco_liso');
    const [supplements, setSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    const [selectedMelaminaColor, setSelectedMelaminaColor] = useState<string>('Blanco');
    const [selectedLacaColor, setSelectedLacaColor] = useState<string>('Laca Blanca');

    const showLacaColorSwatches = material.startsWith('Laca_');
    const showMelaminaColorSwatches = material === 'Melamina_color';
    
    const doorCountKey = doorCount >= 3 ? '3_o_mas_puertas' : '2_puertas';
    const materials = tarifa2025["Frente Corredera"].Precios_por_Material_Euro_m_lineal[doorCountKey];

    useEffect(() => {
        const currentMaterials = tarifa2025["Frente Corredera"].Precios_por_Material_Euro_m_lineal[doorCountKey];
        if (!currentMaterials[material as keyof typeof currentMaterials]) {
            setMaterial(Object.keys(currentMaterials)[0]);
        }
    }, [doorCountKey, material]);


    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const { total, details, name } = useMemo(() => {
        const widthInMeters = (Number(measurements.width) || 0) / 1000;
        const heightInMm = Number(measurements.height) || 0;
        let basePricePerMeter = materials[material as keyof typeof materials] || 0;
        let baseTotal = basePricePerMeter * widthInMeters;

        const finalName = `Frente Corredera`;
        
        const doorString = `${doorCount} ${doorCount > 1 ? 'puertas' : 'puerta'}`;
        const detailsArray = [doorString, `${material.replace(/_/g, ' ')}`, `${measurements.height}x${measurements.width}mm`];
        
        let finalTotal = baseTotal;

        if (heightInMm > 2400) {
            const extraHeightCm = Math.ceil((heightInMm - 2400) / 100);
            const extraCostPercentage = extraHeightCm * 0.10;
            finalTotal += baseTotal * extraCostPercentage;
            detailsArray.push(`Sup. altura > 2400mm (+${(extraCostPercentage * 100).toFixed(0)}%)`);
        } else if (heightInMm > 0 && heightInMm < 800) {
            finalTotal *= 0.50; // 50% discount
            detailsArray.push('Dto. altura < 800mm (-50%)');
        } else if (heightInMm > 0 && heightInMm < 1500) {
            finalTotal *= 0.70; // 30% discount
            detailsArray.push('Dto. altura < 1500mm (-30%)');
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

        Object.entries(supplements).forEach(([concepto, { checked }]) => {
            if (checked) {
                const supplementInfo = tarifa2025["Frente Corredera"].Suplementos_y_Accesorios.find(s => s.Concepto === concepto);
                if (supplementInfo) {
                    let supplementPrice = 0;
                    
                    if (supplementInfo.Valor.includes('%')) {
                        const percentage = parseFloat(supplementInfo.Valor.replace('%', '')) / 100;
                        supplementPrice = baseTotal * percentage;
                         detailsArray.push(concepto);
                    }
                    finalTotal += supplementPrice;
                }
            }
        });

        return { name: finalName, total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, material, materials, doorCount, supplements, showMelaminaColorSwatches, selectedMelaminaColor, showLacaColorSwatches, selectedLacaColor]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity: 1,
            price: total,
            total,
        });
    };
    
    const materialGroups = {
        'Melaminas': ['Melamina_blanco_liso', 'Melamina_color'],
        'Espejos y Cristales': ['Espejo_plata', 'Cristal_color'],
        'Lacas': ['Laca_blanca_lisa', 'Laca_blanca_pico', 'Laca_blanca_fresada_o_plafon', 'Laca_blanca_aspa_o_vidriera'],
        'Maderas': ['Madera_roble_barniz_mate_natura', 'Madera_nogal_barniz_mate_natura'],
        'Colecciones': ['Coleccion_Mallorca', 'Coleccion_Vitrina']
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
                            <div>
                                <Label>Alto (mm)</Label>
                                <Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} />
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
                            <div>
                                <Label>Ancho (mm)</Label>
                                <Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} />
                            </div>
                            <div>
                                <Label>Nº Puertas</Label>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setDoorCount(q => Math.max(2, q - 1))}><Minus className="h-4 w-4" /></Button>
                                    <Input type="number" className="text-center w-20" value={doorCount} onChange={e => setDoorCount(Number(e.target.value) || 2)} min="2" />
                                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setDoorCount(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div>
                                <Label>Material</Label>
                                <Select value={material} onValueChange={setMaterial}>
                                    <SelectTrigger className="truncate"><SelectValue placeholder="Selecciona un material" /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(materialGroups).map(([groupName, groupMaterials]) => (
                                            <SelectGroup key={groupName}>
                                                <SelectLabel>{groupName}</SelectLabel>
                                                {groupMaterials.map((key) => {
                                                    const value = materials[key as keyof typeof materials];
                                                    if (!value) return null;
                                                    return (
                                                        <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')} ({formatCurrency(value as number)}/ml)</SelectItem>
                                                    )
                                                })}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        {showLacaColorSwatches && (
                            <div className="border-t pt-4">
                                <Label className="mb-2 block">Color Laca (+20% sobre material)</Label>
                                <div className="flex flex-wrap gap-2 pb-4">
                                    {lacaColorOptions.map((color, index) => (
                                        <div key={`${color.name}-${index}`} className="flex flex-col items-center gap-2 w-20">
                                            <button type="button" onClick={() => setSelectedLacaColor(color.name)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
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
                             <div className="border-t pt-4">
                                <Label className="mb-2 block">Color Melamina</Label>
                                <div className="flex flex-wrap gap-4">
                                    {melaminaColorOptions.map((color) => (
                                        <div key={color.name}>
                                            <div className="flex flex-col items-center gap-2 w-20">
                                                <button type="button" onClick={() => setSelectedMelaminaColor(color.name)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
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
                    </TabsContent>
                    <TabsContent value="suplementos" className="pt-4">
                        <ScrollArea className="h-72 border rounded-md p-4">
                            <div className="space-y-2">
                                {tarifa2025["Frente Corredera"].Suplementos_y_Accesorios.map((supp, index) => {
                                    if (supp.Concepto.startsWith('Alturas') || supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Valor.includes('ud') || supp.Concepto === "Laca RAL o según muestra") return null;
                                    return (
                                        <div key={`${supp.Concepto}-${index}`} className="flex items-center justify-between p-2 rounded-md border">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`supp-corredera-${supp.Concepto}`}
                                                    onCheckedChange={(checked) => handleSupplementChange(supp.Concepto, !!checked)}
                                                    checked={supplements[supp.Concepto]?.checked || false}
                                                />
                                                <Label htmlFor={`supp-corredera-${supp.Concepto}`} className="font-normal text-sm">{supp.Concepto} <span className="text-xs text-muted-foreground">({supp.Valor})</span></Label>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="/images/armarios/sidon-armario-corredera-cuadro-600x400.png"
                    alt="Frente Corredera"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="sliding"
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

    