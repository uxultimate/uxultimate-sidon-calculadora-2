
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

interface InteriorVestidorCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const InteriorVestidorCalculator: React.FC<InteriorVestidorCalculatorProps> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState({ width: 2000, height: 2400, depth: 550 });
    const [thickness, setThickness] = useState<'19mm' | '30mm'>('19mm');
    const [materialKey, setMaterialKey] = useState<string>('Melamina_blanco_o_lino_cancun_textil');
    const [supplements, setSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    const [selectedColor, setSelectedColor] = useState<string>('Gris Antracita');

    const colorOptions = [
        { name: "Gris Antracita", hex: "#36454F" },
        { name: "Beige", hex: "#F5F5DC" },
        { name: "Roble", hex: "#A0522D" },
        { name: "Nogal", hex: "#664228" },
        { name: "Lino", hex: "#FAF0E6" },
    ];
    
    const showColorSwatches = materialKey === 'Melamina_colores';
    
    const materialsForThickness = tarifa2025["Interior y Vestidor"].Precios_por_metro_lineal_unidad[thickness];

    const handleThicknessChange = (newThickness: '19mm' | '30mm') => {
        setThickness(newThickness);
        const newMaterials = tarifa2025["Interior y Vestidor"].Precios_por_metro_lineal_unidad[newThickness];
        if (!newMaterials[materialKey as keyof typeof newMaterials]) {
            setMaterialKey(Object.keys(newMaterials)[0]);
        }
    };


    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const handleSupplementQuantityChange = (concepto: string, quantity: number) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], quantity } }));
    };


    const { total, details, name } = useMemo(() => {
        const widthInMeters = measurements.width / 1000;
        const widthInMm = measurements.width;
        const heightInMm = measurements.height;
        const depthInMm = measurements.depth;

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
        
        if (showColorSwatches) {
            detailsArray.push(selectedColor);
        }

        let finalTotal = baseTotal;

        if (heightInMm > 2400) {
            const extraHeightCm = Math.ceil((heightInMm - 2400) / 100);
            finalTotal += baseTotal * (extraHeightCm * 0.10);
            detailsArray.push(`Suplemento altura > 2400mm`);
        } else if (heightInMm < 800) {
             finalTotal *= 0.50; // 50% discount
             detailsArray.push('Dto. altura < 800mm');
        } else if (heightInMm < 1500) {
             finalTotal *= 0.70; // 30% discount
             detailsArray.push('Dto. altura < 1500mm');
        }

        if (depthInMm > 650) {
            const extraDepthCm = Math.ceil((depthInMm - 650) / 100);
            finalTotal += baseTotal * (extraDepthCm * 0.10);
            detailsArray.push(`Suplemento fondo > 650mm`);
        } else if (depthInMm < 400) {
            finalTotal *= 0.75; // 25% discount
            detailsArray.push('Dto. fondo < 400mm');
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
    }, [measurements, thickness, materialKey, materialsForThickness, supplements, showColorSwatches, selectedColor]);

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
                            <div><Label>Alto (mm)</Label><Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} /></div>
                            <div><Label>Ancho (mm)</Label><Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} /></div>
                            <div><Label>Fondo (mm)</Label><Input name="depth" type="number" value={measurements.depth} onChange={handleMeasurementChange} /></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Grosor</Label>
                                <Select value={thickness} onValueChange={(val) => handleThicknessChange(val as typeof thickness)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="19mm">19mm</SelectItem>
                                        <SelectItem value="30mm">30mm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Material</Label>
                                <Select value={materialKey} onValueChange={setMaterialKey}>
                                    <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(materialsForThickness).map((key) => (
                                            (typeof materialsForThickness[key as keyof typeof materialsForThickness] !== 'object' || 
                                            'hasta_1000' in (materialsForThickness[key as keyof typeof materialsForThickness] as object)) &&
                                            <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {showColorSwatches && (
                            <div>
                                <Label className="mb-2 block">Color</Label>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {colorOptions.map((color, index) => (
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
                                {tarifa2025["Interior y Vestidor"].Suplementos_y_Anadidos.map((supp, index) => {
                                    if (supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Valor.includes('metro lineal')) return null;
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
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="https://placehold.co/600x400.png"
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
