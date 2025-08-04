
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { tarifa2025 } from '@/lib/tarifa';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LineItem } from '@/lib/types';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Minus, Plus, Check as CheckIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface AddLineItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddItem: (item: Omit<LineItem, 'id'>) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const ColorSwatch: React.FC<{ color: string, name: string, isSelected: boolean, onClick: () => void }> = ({ color, name, isSelected, onClick }) => (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1">
        <div className={cn("relative h-8 w-8 rounded-full border border-gray-300 transition-transform group-hover:scale-110", isSelected && "ring-2 ring-offset-2 ring-primary")} style={{ backgroundColor: color }}>
            {isSelected && (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-black/30">
                    <CheckIcon className="h-4 w-4 text-white" />
                </div>
            )}
        </div>
        <p className={cn("text-xs text-muted-foreground", isSelected && "font-semibold text-primary")}>{name}</p>
    </button>
);


const PanelesDivisoriosCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
    const [pricingModel, setPricingModel] = useState<'coleccion' | 'cristal'>('coleccion');
    const [measurements, setMeasurements] = useState({ width: 2000, height: 2400 });
    const [panelType, setPanelType] = useState('Corredera');
    const [panelCollection, setPanelCollection] = useState('Meridian');
    const [panelCristal, setPanelCristal] = useState('Cristal Transparente');
    const [panelSupplements, setPanelSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
    };

    const handlePanelSupplementChange = (concepto: string, checked: boolean) => {
        setPanelSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const handlePanelSupplementQuantityChange = (concepto: string, quantity: number) => {
        setPanelSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], quantity } }));
    };
    
    const panelPriceData = pricingModel === 'coleccion' 
        ? tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal[panelType as keyof typeof tarifa2025['Paneles Divisorios']['Precios_por_Coleccion_Euro_m_lineal']]
        : tarifa2025['Paneles Divisorios'].Precios_por_Cristal_Euro_m_lineal[panelType as keyof typeof tarifa2025['Paneles Divisorios']['Precios_por_Cristal_Euro_m_lineal']];

    React.useEffect(() => {
        const availableOptions = Object.keys(panelPriceData);
        const currentSelection = pricingModel === 'coleccion' ? panelCollection : panelCristal;
        if (!availableOptions.includes(currentSelection)) {
            if (pricingModel === 'coleccion') setPanelCollection(availableOptions[0]);
            else setPanelCristal(availableOptions[0]);
        }
    }, [panelType, panelPriceData, panelCollection, panelCristal, pricingModel]);
    
    const { total, details, name } = useMemo(() => {
        const widthInMeters = measurements.width / 1000;
        
        const selectedKey = pricingModel === 'coleccion' ? panelCollection : panelCristal;
        let basePrice = (panelPriceData[selectedKey as keyof typeof panelPriceData] || 0) * widthInMeters;

        let total = basePrice;
        const detailsArray = [`${measurements.width}x${measurements.height}mm`];
        
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
        
        const finalName = `Panel Divisorio ${panelType} ${selectedKey}`;

        return { total, details: detailsArray.join(', '), name: finalName };
    }, [measurements, panelType, panelCollection, panelCristal, panelPriceData, panelSupplements, pricingModel]);

    const handleSaveItem = () => {
        const lineItem = { name, details, quantity: 1, price: total, total };
        onSave(lineItem);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Ancho (mm)</Label>
                        <Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} />
                    </div>
                    <div>
                        <Label>Alto (mm)</Label>
                        <Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <Label>Tipo de Apertura</Label>
                        <Select value={panelType} onValueChange={setPanelType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.keys(tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal).map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                </div>

                <div>
                    <Label>{pricingModel === 'coleccion' ? 'Colección' : 'Tipo de Cristal'}</Label>
                    <Select 
                        value={pricingModel === 'coleccion' ? panelCollection : panelCristal} 
                        onValueChange={pricingModel === 'coleccion' ? setPanelCollection : setPanelCristal}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(panelPriceData).map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <h4 className="font-medium mb-2">Suplementos y Accesorios</h4>
                    <ScrollArea className="h-48 border rounded-md p-4">
                        <div className="space-y-2">
                            {tarifa2025['Paneles Divisorios'].Suplementos_y_Accesorios.map(supp => {
                                if (supp.Valor.includes('dto') || supp.Valor.includes('consultar')) return null;
                                const needsQuantity = supp.Valor.includes('€ ud');
                                return (
                                    <div key={supp.Concepto} className="flex items-center justify-between p-2 rounded-md border">
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
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src="/images/productos/pre-paneles-divisorios.png"
                    alt="Paneles Divisorios"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="room divider"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
}

const FrenteAbatibleCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState({ width: 1000, height: 2400 });
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
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
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
        const detailsArray = [`${material.replace(/_/g, ' ')}`, `${measurements.width}x${measurements.height}mm`];
        
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
                        supplementPrice = pricePerUnit * (quantity || 1);
                        description += ` (x${quantity || 1})`;
                    }
                    finalTotal += supplementPrice;
                    detailsArray.push(description);
                }
            }
        });

        return { name: finalName, total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, material, materials, supplements, showColorSwatches, selectedColor]);

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
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Ancho (mm)</Label>
                        <Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} />
                    </div>
                    <div>
                        <Label>Alto (mm)</Label>
                        <Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} />
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
                             {(material.startsWith('Laca_') ? colorOptions['Laca'] : colorOptions['Melamina_colores']).map(color => (
                                <ColorSwatch 
                                    key={color.name}
                                    color={color.hex}
                                    name={color.name}
                                    isSelected={selectedColor === color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <h4 className="font-medium mb-2">Suplementos y Accesorios</h4>
                     <ScrollArea className="h-48 border rounded-md p-4">
                        <div className="space-y-2">
                             {tarifa2025["Frente Abatible y Plegable"].Suplementos_y_Accesorios.map(supp => {
                                if (supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar')) return null;
                                const needsQuantity = supp.Valor.includes('ud') || supp.Valor.includes('cada');
                                return (
                                    <div key={supp.Concepto} className="flex items-center justify-between p-2 rounded-md border">
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
                                                value={supplements[supp.Concepto]?.quantity || 1}
                                                onChange={(e) => handleSupplementQuantityChange(supp.Concepto, parseInt(e.target.value) || 1)}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="/images/productos/frentes-abatibles.png"
                    alt="Frente Abatible"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="closet door"
                />
                <Card>
                    <CardHeader><CardTitle>Total del Concepto</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(total)}</p></CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};

const FrenteCorrederaCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState({ width: 1800, height: 2400 });
    const [doorCount, setDoorCount] = useState<'2_puertas' | '3_o_mas_puertas'>('2_puertas');
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
    
    const materials = tarifa2025["Frente Corredera"].Precios_por_Material_Euro_m_lineal[doorCount];

    useEffect(() => {
        if (!materials[material as keyof typeof materials]) {
            setMaterial(Object.keys(materials)[0]);
        }
    }, [doorCount, material, materials]);

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const { total, details } = useMemo(() => {
        const widthInMeters = measurements.width / 1000;
        const heightInMm = measurements.height;
        let basePricePerMeter = materials[material as keyof typeof materials] || 0;
        let baseTotal = basePricePerMeter * widthInMeters;

        const detailsArray = [`${doorCount.replace(/_/g, ' ')}`, `${material.replace(/_/g, ' ')}`, `${measurements.width}x${measurements.height}mm`];
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

        return { total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, material, materials, doorCount, supplements, showColorSwatches, selectedColor]);

    const handleSaveItem = () => {
        onSave({
            name: "Frente Corredera",
            details,
            quantity: 1,
            price: total,
            total,
        });
    };

    return (
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Ancho (mm)</Label>
                        <Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} />
                    </div>
                    <div>
                        <Label>Alto (mm)</Label>
                        <Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Nº Puertas</Label>
                        <Select value={doorCount} onValueChange={(val) => setDoorCount(val as typeof doorCount)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2_puertas">2 puertas</SelectItem>
                                <SelectItem value="3_o_mas_puertas">3 o más puertas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                             {colorOptions.map(color => (
                                <ColorSwatch 
                                    key={color.name}
                                    color={color.hex}
                                    name={color.name}
                                    isSelected={selectedColor === color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <h4 className="font-medium mb-2">Suplementos y Accesorios</h4>
                     <ScrollArea className="h-48 border rounded-md p-4">
                        <div className="space-y-2">
                             {tarifa2025["Frente Corredera"].Suplementos_y_Accesorios.map(supp => {
                                if (supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Valor.includes('ud')) return null;
                                return (
                                    <div key={supp.Concepto} className="flex items-center justify-between p-2 rounded-md border">
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
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="/images/productos/frentes-correderas.png"
                    alt="Frente Corredera"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="sliding door"
                />
                <Card>
                    <CardHeader><CardTitle>Total del Concepto</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(total)}</p></CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};

const InteriorVestidorCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
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

    useEffect(() => {
        if (!materialsForThickness[materialKey as keyof typeof materialsForThickness]) {
            setMaterialKey(Object.keys(materialsForThickness)[0]);
        }
    }, [thickness, materialKey, materialsForThickness]);

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
    };

    const handleSupplementChange = (concepto: string, checked: boolean) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], checked, quantity: prev[concepto]?.quantity || 1 } }));
    };

    const handleSupplementQuantityChange = (concepto: string, quantity: number) => {
        setSupplements(prev => ({ ...prev, [concepto]: { ...prev[concepto], quantity } }));
    };


    const { total, details } = useMemo(() => {
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
        
        const materialName = materialKey.replace(/_/g, ' ');
        const detailsArray = [`${thickness} ${materialName}`, `${measurements.width}x${measurements.height}x${measurements.depth}mm`];
        
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


        return { total: finalTotal, details: detailsArray.join(', ') };
    }, [measurements, thickness, materialKey, materialsForThickness, supplements, showColorSwatches, selectedColor]);

    const handleSaveItem = () => {
        onSave({
            name: "Interior y Vestidor",
            details,
            quantity: 1,
            price: total,
            total,
        });
    };
    
    return (
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><Label>Ancho (mm)</Label><Input name="width" type="number" value={measurements.width} onChange={handleMeasurementChange} /></div>
                    <div><Label>Alto (mm)</Label><Input name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} /></div>
                    <div><Label>Fondo (mm)</Label><Input name="depth" type="number" value={measurements.depth} onChange={handleMeasurementChange} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Grosor</Label>
                        <Select value={thickness} onValueChange={(val) => setThickness(val as typeof thickness)}>
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
                             {colorOptions.map(color => (
                                <ColorSwatch 
                                    key={color.name}
                                    color={color.hex}
                                    name={color.name}
                                    isSelected={selectedColor === color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <h4 className="font-medium mb-2">Suplementos y Añadidos</h4>
                     <ScrollArea className="h-48 border rounded-md p-4">
                        <div className="space-y-2">
                             {tarifa2025["Interior y Vestidor"].Suplementos_y_Anadidos.map(supp => {
                                if (supp.Valor.includes('dto') || supp.Valor.includes('€ m2') || supp.Valor.includes('m/l') || supp.Valor.includes('consultar') || supp.Valor.includes('metro lineal')) return null;
                                const needsQuantity = supp.Valor.includes('ud');
                                return (
                                    <div key={supp.Concepto} className="flex items-center justify-between p-2 rounded-md border">
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
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                <Image
                    src="/images/productos/interiors.png"
                    alt="Interior y Vestidor"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint={"walk-in closet"}
                />
                <Card>
                    <CardHeader><CardTitle>Total del Concepto</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(total)}</p></CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};

const CajonesCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
    const [itemType, setItemType] = useState('Cajones');
    const [width, setWidth] = useState(500);
    const [material, setMaterial] = useState('Melamina_blanco_o_lino_cancun_textil');
    const [quantity, setQuantity] = useState(1);
    
    const itemData = tarifa2025["Cajones_Zapateros_Bandejas"].Precios_por_Unidad_Ancho[itemType as keyof typeof tarifa2025["Cajones_Zapateros_Bandejas"]["Precios_por_Unidad_Ancho"]];
    const materialData = itemData[material as keyof typeof itemData];

    useEffect(() => {
        if (!itemData[material as keyof typeof itemData]) {
            setMaterial(Object.keys(itemData)[0]);
        }
    }, [itemType, material, itemData]);


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

    const handleSaveItem = () => {
        onSave({
            name: `${itemType.replace(/_/g, ' ')}`,
            details: `Ancho: ${width}mm, Material: ${material.replace(/_/g, ' ')}`,
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
                        <Select value={itemType} onValueChange={setItemType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.keys(tarifa2025["Cajones_Zapateros_Bandejas"].Precios_por_Unidad_Ancho).map(type => (
                                    <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Material</Label>
                        <Select value={material} onValueChange={setMaterial}>
                            <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.keys(itemData).map(mat => (
                                    <SelectItem key={mat} value={mat}>{mat.replace(/_/g, ' ')}</SelectItem>
                                ))}
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
                            <Input type="number" className="text-center" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                         </div>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground pt-4">
                    <p>Calculadora para cajones, zapateros y otros accesorios. Selecciona el tipo, material, ancho del hueco y la cantidad.</p>
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Cajones y Accesorios"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="drawer accessory"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(pricePerUnit)} / ud.</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};

const TiradoresCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
    const [selectedTirador, setSelectedTirador] = useState(tarifa2025.Tiradores[0]);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(tarifa2025.Tiradores[0].colors[0]);

    useEffect(() => {
        setSelectedColor(selectedTirador.colors[0]);
    }, [selectedTirador]);

    const colorHexMap: Record<string, string> = {
        "Inox": "#C0C0C0",
        "Latón": "#B8860B",
        "Negro": "#000000",
        "Antracita": "#36454F",
        "Roble": "#A0522D",
        "Teñido Negro / Negro": "#1A1A1A",
        "Latón Antiguo": "#C3A378",
        "Bronce": "#CD7F32",
        "Blanco": "#FFFFFF",
        "Mármol Verde": "#2F5D44",
        "Negro/Roble": "#664228",
        "Teñido Negro": "#1C1C1C",
        "Blanco Mate": "#F5F5F5",
    };

    const total = selectedTirador.Precio * quantity;

    const handleSaveItem = () => {
        onSave({
            name: `Tirador ${selectedTirador.Modulo}`,
            details: `Material: ${selectedTirador.Material}, Acabado: ${selectedColor}`,
            quantity,
            price: selectedTirador.Precio,
            total,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Modelo de Tirador</Label>
                        <Select
                            value={selectedTirador.Modulo}
                            onValueChange={(modulo) => {
                                const tirador = tarifa2025.Tiradores.find(t => t.Modulo === modulo);
                                if (tirador) setSelectedTirador(tirador);
                            }}
                        >
                            <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {tarifa2025.Tiradores.map(t => (
                                    <SelectItem key={t.Modulo} value={t.Modulo}>{t.Modulo} - {t.Acabado}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label>Cantidad</Label>
                         <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" className="text-center" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                         </div>
                    </div>
                </div>
                 <div>
                    <Label className="mb-2 block">Acabado / Color</Label>
                     <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {selectedTirador.colors.map(color => (
                            <ColorSwatch
                                key={color}
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
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Tiradores"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="drawer handle"
                />
                 <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(selectedTirador.Precio)} / ud.</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};

const AxiaEssenzaLedCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void, category: 'Accesorios Axia' | 'Accesorios Essenza' | 'LED' }> = ({ onSave, category }) => {
    const products = tarifa2025[category].Productos;
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    const [quantity, setQuantity] = useState(1);

    const total = selectedProduct.Precio * quantity;

    const handleSaveItem = () => {
        const product = selectedProduct as any;
        const widthInfo = product.Ancho ? `, Ancho: ${product.Ancho}` : (product.Rango_Ancho ? `, Rango Ancho: ${product.Rango_Ancho}` : '');
        const details = `Acabado: ${product.Acabado}${widthInfo}`;
        
        onSave({
            name: `${category === 'LED' ? '' : category + ': '}${product.Producto}`,
            details: details,
            quantity,
            price: product.Precio,
            total,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Producto</Label>
                        <Select
                            value={selectedProduct.Producto}
                            onValueChange={(productName) => {
                                const product = products.find(p => p.Producto === productName);
                                if (product) setSelectedProduct(product);
                            }}
                        >
                            <SelectTrigger className="truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.Producto} value={p.Producto}>{p.Producto}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Cantidad</Label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" className="text-center" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader><CardTitle>Detalles</CardTitle></CardHeader>
                    <CardContent className="text-sm grid grid-cols-2 gap-2">
                        <p><b>Categoría:</b> {category}</p>
                        <p><b>Acabado:</b> {selectedProduct.Acabado}</p>
                        {(selectedProduct as any).Ancho && <p><b>Ancho:</b> {(selectedProduct as any).Ancho}</p>}
                         {(selectedProduct as any).Rango_Ancho && <p><b>Rango Ancho:</b> {(selectedProduct as any).Rango_Ancho}</p>}
                        {(selectedProduct as any).Fondo && <p><b>Fondo:</b> {(selectedProduct as any).Fondo}</p>}
                        {(selectedProduct as any).Alto && <p><b>Alto:</b> {(selectedProduct as any).Alto}</p>}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Accesorios"
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="closet accessory"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(selectedProduct.Precio)} / ud.</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};


export function AddLineItemDialog({ open, onOpenChange, onAddItem }: AddLineItemDialogProps) {
    
    const handleSave = (item: Omit<LineItem, 'id'>) => {
        onAddItem(item);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-full md:h-auto">
              <ScrollArea className="max-h-[90vh] md:max-h-auto">
                <div className="p-1 sm:p-6">
                  <DialogHeader className="pb-4">
                      <DialogTitle>Añadir Concepto al Presupuesto</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                      <Tabs defaultValue="paneles" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 md:grid-cols-9 h-auto">
                              <TabsTrigger value="paneles">Paneles</TabsTrigger>
                              <TabsTrigger value="abatible">Abatible</TabsTrigger>
                              <TabsTrigger value="corredera">Corredera</TabsTrigger>
                              <TabsTrigger value="interior">Interior</TabsTrigger>
                              <TabsTrigger value="cajones">Cajones</TabsTrigger>
                              <TabsTrigger value="tiradores">Tiradores</TabsTrigger>
                              <TabsTrigger value="axia">Axia</TabsTrigger>
                              <TabsTrigger value="essenza">Essenza</TabsTrigger>
                              <TabsTrigger value="led">LED</TabsTrigger>
                          </TabsList>
                          <TabsContent value="paneles" className="pt-4">
                             <PanelesDivisoriosCalculator onSave={handleSave} />
                          </TabsContent>
                          <TabsContent value="abatible" className="pt-4">
                               <FrenteAbatibleCalculator onSave={handleSave} />
                          </TabsContent>
                          <TabsContent value="corredera" className="pt-4">
                               <FrenteCorrederaCalculator onSave={handleSave} />
                          </TabsContent>
                          <TabsContent value="interior" className="pt-4">
                              <InteriorVestidorCalculator onSave={handleSave} />
                          </TabsContent>
                           <TabsContent value="cajones" className="pt-4">
                              <CajonesCalculator onSave={handleSave} />
                          </TabsContent>
                           <TabsContent value="tiradores" className="pt-4">
                              <TiradoresCalculator onSave={handleSave} />
                          </TabsContent>
                           <TabsContent value="axia" className="pt-4">
                              <AxiaEssenzaLedCalculator onSave={handleSave} category="Accesorios Axia"/>
                          </TabsContent>
                           <TabsContent value="essenza" className="pt-4">
                              <AxiaEssenzaLedCalculator onSave={handleSave} category="Accesorios Essenza"/>
                          </TabsContent>
                          <TabsContent value="led" className="pt-4">
                              <AxiaEssenzaLedCalculator onSave={handleSave} category="LED"/>
                          </TabsContent>
                      </Tabs>
                  </div>
                  <DialogFooter className="pr-1 sm:pr-0">
                      <DialogClose asChild>
                          <Button type="button" variant="outline">Cerrar</Button>
                      </DialogClose>
                  </DialogFooter>
                </div>
              </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
