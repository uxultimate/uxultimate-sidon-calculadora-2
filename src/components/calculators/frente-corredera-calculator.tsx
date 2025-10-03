
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { TiradoresCalculator } from './tiradores-calculator';

interface FrenteCorrederaCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const FrenteCorrederaCalculator: React.FC<FrenteCorrederaCalculatorProps> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState({ width: 1800, height: 2400 });
    const [doorCount, setDoorCount] = useState(2);
    const [material, setMaterial] = useState('Melamina_blanco_liso');
    const [supplements, setSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    const [selectedColor, setSelectedColor] = useState<string>('Gris Antracita');

    const colorOptions = [
        { name: "Gris Antracita", hex: "#36454F" },
        { name: "Beige", hex: "#F5F5DC" },
        { name: "Roble", hex: "#A0522D" },
        { name: "Nogal", hex: "#664228" },
        { name: "Lino", hex: "#FAF0E6" },
    ];
    
    const showColorSwatches = material === 'Melamina_color';
    
    const doorCountKey = doorCount >= 3 ? '3_o_mas_puertas' : '2_puertas';
    const materials = tarifa2025["Frente Corredera"].Precios_por_Material_Euro_m_lineal[doorCountKey];

    useEffect(() => {
        const currentMaterials = tarifa2025["Frente Corredera"].Precios_por_Material_Euro_m_lineal[doorCountKey];
        if (!currentMaterials[material as keyof typeof currentMaterials]) {
            setMaterial(Object.keys(currentMaterials)[0]);
        }
    }, [doorCountKey, material]);


    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const { total, details, name } = useMemo(() => {
        const widthInMeters = measurements.width / 1000;
        const heightInMm = measurements.height;
        let basePricePerMeter = materials[material as keyof typeof materials] || 0;
        let baseTotal = basePricePerMeter * widthInMeters;

        const finalName = `Frente Corredera`;
        const detailsArray = [`${doorCount} puertas`, `${material.replace(/_/g, ' ')}`, `${measurements.height}x${measurements.width}mm`];
        if (showColorSwatches) {
            detailsArray.push(selectedColor);
        }
        let finalTotal = baseTotal;

        if (heightInMm > 2400) {
            const extraHeightCm = Math.ceil((heightInMm - 2400) / 100);
            finalTotal += baseTotal * (extraHeightCm * 0.10);
        } else if (heightInMm < 800) {
            finalTotal *= 0.50; // 50% discount
            detailsArray.push('Dto. altura < 800mm');
        } else if (heightInMm < 1500) {
            finalTotal *= 0.70; // 30% discount
            detailsArray.push('Dto. altura < 1500mm');
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
    }, [measurements, material, materials, doorCount, supplements, showColorSwatches, selectedColor]);

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
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="config">Configuración</TabsTrigger>
                        <TabsTrigger value="suplementos">Suplementos</TabsTrigger>
                        <TabsTrigger value="tiradores">Tiradores</TabsTrigger>
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
                                <Input name="doorCount" type="number" value={doorCount} min="2" onChange={(e) => setDoorCount(Number(e.target.value) || 2)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div>
                                <Label>Material</Label>
                                <Select value={material} onValueChange={setMaterial}>
                                    <SelectTrigger className="truncate"><SelectValue placeholder="Selecciona un material" /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(materials).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')} ({formatCurrency(value as number)}/ml)</SelectItem>
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
                                {tarifa2025["Frente Corredera"].Suplementos_y_Accesorios.map((supp, index) => {
                                    if (supp.Concepto.startsWith('Alturas') || supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Valor.includes('ud')) return null;
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
                    <TabsContent value="tiradores" className="pt-4">
                        <TiradoresCalculator onSave={onSave} />
                    </TabsContent>
                </Tabs>
            </div>
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="https://placehold.co/600x400.png"
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
                        <p className="font-semibold text-sm break-words">{name}</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
