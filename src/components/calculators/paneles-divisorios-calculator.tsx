
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorSwatch } from './utils';
import { formatCurrency } from '@/lib/utils';

interface PanelesDivisoriosCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

export const PanelesDivisoriosCalculator: React.FC<PanelesDivisoriosCalculatorProps> = ({ onSave }) => {
    const [pricingModel, setPricingModel] = useState<'coleccion' | 'cristal'>('coleccion');
    const [measurements, setMeasurements] = useState({ width: 2000, height: 2400 });
    const [openingType, setOpeningType] = useState('Corredera');
    const [doorCount, setDoorCount] = useState(1);
    const [panelCollection, setPanelCollection] = useState('Meridian');
    const [panelCristal, setPanelCristal] = useState('Cristal Transparente');
    const [panelSupplements, setPanelSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    
    const openingOptions = ['Corredera', 'Fijo', 'Abatible', 'Plegable'];

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
    };

    const handlePanelSupplementChange = (concepto: string, checked: boolean) => {
        setPanelSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const handlePanelSupplementQuantityChange = (concepto: string, quantity: number) => {
        setPanelSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], quantity } }));
    };
    
    const constructedPanelType = useMemo(() => {
        if (openingType === 'Abatible' && doorCount === 2) return 'Abatible Doble';
        if (openingType === 'Plegable' && doorCount > 1) return `Plegable ${doorCount} Puertas`;
        return openingType;
    }, [openingType, doorCount]);

    const panelPriceData = useMemo(() => {
        const source = pricingModel === 'coleccion' 
            ? tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal
            : tarifa2025['Paneles Divisorios'].Precios_por_Cristal_Euro_m_lineal;

        return source[constructedPanelType as keyof typeof source];
    }, [pricingModel, constructedPanelType]);

    
    const { total, details, name } = useMemo(() => {
        const widthInMeters = measurements.width / 1000;
        
        const priceData = pricingModel === 'coleccion' 
            ? tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal
            : tarifa2025['Paneles Divisorios'].Precios_por_Cristal_Euro_m_lineal;
        
        const priceListForType = priceData[constructedPanelType as keyof typeof priceData] || {};
        
        const selectedKey = pricingModel === 'coleccion' ? panelCollection : panelCristal;
        let basePrice = (priceListForType[selectedKey as keyof typeof priceListForType] || 0) * widthInMeters;

        let total = basePrice;
        const detailsArray = [`${measurements.height}x${measurements.width}mm`];
        
        if (measurements.height < 1500) {
            const discount = total * 0.25;
            total -= discount;
            detailsArray.push('Dto. altura < 1500mm');
        }

        Object.entries(panelSupplements).forEach(([concepto, { checked, quantity }]) => {
            if (checked) {
                const supplementInfo = tarifa2025['Paneles Divisorios'].Suplementos_y_Accesorios.find(s => s.Concepto === concepto);
                if (supplementInfo) {
                    let supplementPrice = 0;
                    let description = `${concepto}`;
                    
                    if (supplementInfo.Valor.includes('%')) {
                        const percentage = parseFloat(supplementInfo.Valor.replace('%', '')) / 100;
                        supplementPrice = basePrice * percentage;
                    } else if (supplementInfo.Valor.includes('€ m2')) {
                         const pricePerSqm = parseFloat(supplementInfo.Valor.replace('€ m2', ''));
                         const area = (measurements.width / 1000) * (measurements.height / 1000);
                         supplementPrice = pricePerSqm * area;
                    } else if (supplementInfo.Valor.includes('€ m/l')) {
                         const pricePerLm = parseFloat(supplementInfo.Valor.replace('€ m/l', ''));
                         supplementPrice = pricePerLm * widthInMeters;
                    } else if (supplementInfo.Valor.includes('€ ud')) {
                        const pricePerUnit = parseFloat(supplementInfo.Valor.replace(/€ ud\.?/i, ''));
                        supplementPrice = pricePerUnit * (quantity || 1);
                        description += ` (x${quantity || 1})`;
                    }
                    total += supplementPrice;
                    detailsArray.push(description);
                }
            }
        });
        
        const doorString = doorCount > 1 ? `${doorCount} Puertas` : '1 Puerta';
        const finalName = `Panel Divisorio ${openingType} ${doorString} ${selectedKey}`;

        return { total, details: detailsArray.join(', '), name: finalName };
    }, [measurements, openingType, doorCount, panelCollection, panelCristal, panelSupplements, pricingModel, constructedPanelType]);

    const handleSaveItem = () => {
        const lineItem = { name, details, quantity: 1, price: total, total };
        onSave(lineItem);
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
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Alto (mm)</Label>
                                <Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} />
                            </div>
                            <div>
                                <Label>Ancho (mm)</Label>
                                <Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Tipo de Apertura</Label>
                                <Select value={openingType} onValueChange={setOpeningType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {openingOptions.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Nº de Puertas</Label>
                                <Input 
                                    type="number" 
                                    value={doorCount} 
                                    onChange={(e) => setDoorCount(Math.max(1, parseInt(e.target.value)))} 
                                    min="1"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label>Modelo de Precio</Label>
                            <RadioGroup defaultValue="coleccion" value={pricingModel} onValueChange={(val) => setPricingModel(val as any)} className="flex items-center space-x-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="coleccion" id="coleccion" />
                                    <Label htmlFor="coleccion">Por Colección</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cristal" id="cristal" />
                                    <Label htmlFor="cristal">Por Cristal</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label>{pricingModel === 'coleccion' ? 'Colección' : 'Tipo de Cristal'}</Label>
                            <Select 
                                value={pricingModel === 'coleccion' ? panelCollection : panelCristal} 
                                onValueChange={pricingModel === 'coleccion' ? setPanelCollection : setPanelCristal}
                                disabled={!panelPriceData}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {panelPriceData && Object.keys(panelPriceData).map((option) => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!panelPriceData && <p className="text-xs text-destructive mt-1">La combinación de apertura y nº de puertas no es válida.</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="suplementos" className="pt-4">
                        <ScrollArea className="h-72 border rounded-md p-4">
                            <div className="space-y-2">
                                {tarifa2025['Paneles Divisorios'].Suplementos_y_Accesorios.map((supp, index) => {
                                    if (supp.Valor.includes('dto') || supp.Valor.includes('consultar')) return null;
                                    const needsQuantity = supp.Valor.includes('€ ud');
                                    return (
                                        <div key={`${supp.Concepto}-${index}`} className="flex items-center justify-between p-2 rounded-md border">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`supp-${supp.Concepto}`}
                                                    onCheckedChange={(checked) => handlePanelSupplementChange(supp.Concepto, !!checked)}
                                                    checked={panelSupplements[supp.Concepto]?.checked || false}
                                                />
                                                <Label htmlFor={`supp-${supp.Concepto}`} className="font-normal text-sm">{supp.Concepto} <span className="text-xs text-muted-foreground">({supp.Valor})</span></Label>
                                            </div>
                                            {needsQuantity && panelSupplements[supp.Concepto]?.checked && (
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8"
                                                    min="1"
                                                    value={panelSupplements[supp.Concepto]?.quantity || 1}
                                                    onChange={(e) => handlePanelSupplementQuantityChange(supp.Concepto, parseInt(e.target.value) || 1)}
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
                    alt="Paneles Divisorios"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="divider"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
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
}
