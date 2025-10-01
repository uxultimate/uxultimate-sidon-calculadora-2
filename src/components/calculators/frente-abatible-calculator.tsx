
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, ColorSwatch } from './utils';

interface FrenteAbatibleCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const FrenteAbatibleCalculator: React.FC<FrenteAbatibleCalculatorProps> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState({ width: 1000, height: 2400 });
    const [doorCount, setDoorCount] = useState(2);
    const [material, setMaterial] = useState('Laca_blanca_lisa');
    const materials = tarifa2025["Frente Abatible y Plegable"].Precios_por_Material_Euro_m_lineal["19mm"];
    const [supplements, setSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    const [selectedColor, setSelectedColor] = useState<string>('Blanco');
    
    const colorOptions: Record<string, { name: string, hex: string }[]> = {
        'Melamina_colores': [
            { name: "Gris Antracita", hex: "#36454F" },
            { name: "Beige", hex: "#F5F5DC" },
            { name: "Roble", hex: "#A0522D" },
            { name: "Nogal", hex: "#664228" }
        ],
        'Laca': [
            { name: "Blanco", hex: "#FFFFFF" },
            { name: "Gris Claro", hex: "#D3D3D3" },
            { name: "Gris Oscuro", hex: "#A9A9A9" },
            { name: "Negro", hex: "#000000" }
        ]
    };
    
    const showColorSwatches = material === 'Melamina_colores' || material.startsWith('Laca_');


    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
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
        const widthInMeters = measurements.width / 1000;
        const heightInMm = measurements.height;
        let basePricePerMeter = materials[material as keyof typeof materials] || 0;
        let baseTotal = basePricePerMeter * widthInMeters;

        const isPlegable = supplements['Herraje plegable']?.checked;
        const finalName = isPlegable ? "Frente Plegable" : "Frente Abatible";
        const detailsArray = [`${doorCount} puertas`, `${material.replace(/_/g, ' ')}`, `${measurements.height}x${measurements.width}mm`];
        
        if (showColorSwatches) {
            detailsArray.push(selectedColor);
        }

        let finalTotal = baseTotal;

        if (heightInMm > 2400) {
            const extraHeightCm = Math.ceil((heightInMm - 2400) / 100);
            const extraCost = baseTotal * (extraHeightCm * 0.10);
            finalTotal += extraCost;
            detailsArray.push(`Suplemento altura > 2400mm`);
        } else if (heightInMm < 800) {
            finalTotal *= 0.50; // 50% discount
            detailsArray.push('Dto. altura < 800mm');
        } else if (heightInMm < 1500) {
            finalTotal *= 0.70; // 30% discount
            detailsArray.push('Dto. altura < 1500mm');
        }

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
                    }
                    finalTotal += supplementPrice;
                    detailsArray.push(description);
                }
            }
        });

        return { name: finalName, total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, material, materials, supplements, showColorSwatches, selectedColor, doorCount]);

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
                            <div>
                                <Label>Alto (mm)</Label>
                                <Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} />
                                {measurements.height > 2400 && (
                                    <p className="text-xs text-muted-foreground mt-1">Suplemento por altura: +10% cada 10cm</p>
                                )}
                            </div>
                            <div>
                                <Label>Ancho (mm)</Label>
                                <Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} />
                            </div>
                            <div>
                                <Label>Nº Puertas</Label>
                                <Input name="doorCount" type="number" value={doorCount} min="1" onChange={(e) => setDoorCount(Number(e.target.value) || 1)} />
                            </div>
                        </div>
                        <div>
                            <Label>Material</Label>
                            <Select value={material} onValueChange={setMaterial}>
                                <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(materials).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')} ({formatCurrency(value)}/ml)</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {showColorSwatches && (
                            <div>
                                <Label className="mb-2 block">Color</Label>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {(material.startsWith('Laca_') ? colorOptions['Laca'] : colorOptions['Melamina_colores']).map((color, index) => (
                                        <ColorSwatch 
                                            key={`${color.name}-${index}`}
                                            color={color.hex}
                                            name={color.name}
                                            isSelected={selectedColor === color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="suplementos" className="pt-4">
                        <ScrollArea className="h-72 border rounded-md p-4">
                            <div className="space-y-2">
                                {tarifa2025["Frente Abatible y Plegable"].Suplementos_y_Accesorios.map((supp, index) => {
                                    if (supp.Concepto.startsWith('Alturas') || supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar')) return null;
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
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="https://placehold.co/600x400.png"
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
                        <p className="font-semibold text-sm break-words">{name}</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
