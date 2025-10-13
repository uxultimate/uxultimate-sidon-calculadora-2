
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
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PanelesDivisoriosCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
}

const collectionImages: Record<string, string> = {
    'Meridian': '/images/paneles/sidon-armarios-panel-meridian-600x400.png',
    'Paralel': '/images/paneles/sidon-armarios-panel-paralel-600x400.png',
    'Desi': '/images/paneles/sidon-armarios-panel-desi-600x400.png',
};

const cristalImages: Record<string, string> = {
    'Cristal Transparente': '/images/paneles/cristal/sidon-armarios-panel-livorno-corredera-closed-600x400.png',
    'Cristal Ahumado': '/images/paneles/cristal/sidon-armarios-panel-joros-paralel-600x400.png',
    'Cristal Fluted (Acanalado)': '/images/paneles/cristal/sidon-armarios-panel-fluted-600x400.png',
};

const panelSmallImages: Record<string, string> = {
    'Meridian': '/images/paneles/small/sidon-armarios-panel-meridian-150x100.png',
    'Paralel': '/images/paneles/small/sidon-armarios-panel-paralel-150x100.png',
    'Desi': '/images/paneles/small/sidon-armarios-panel-desi-150x100.png',
    'Cristal Transparente': '/images/paneles/small/sidon-armarios-panel-livorno-corredera-closed-150x100.png',
    'Cristal Ahumado': '/images/paneles/small/sidon-armarios-panel-joros-paralel-150x100.png',
    'Cristal Fluted (Acanalado)': '/images/paneles/small/sidon-armarios-panel-fluted-150x100.png',
}

const panelOptions = [
    { name: 'Meridian', type: 'coleccion' as const },
    { name: 'Paralel', type: 'coleccion' as const },
    { name: 'Desi', type: 'coleccion' as const },
    { name: 'Cristal Transparente', displayName: 'Livorno (Transparente)', type: 'cristal' as const },
    { name: 'Cristal Ahumado', displayName: 'Joros (Ahumado)', type: 'cristal' as const },
    { name: 'Cristal Fluted (Acanalado)', displayName: 'Flutes (Acanalado)', type: 'cristal' as const },
];

export const PanelesDivisoriosCalculator: React.FC<PanelesDivisoriosCalculatorProps> = ({ onSave }) => {
    const [measurements, setMeasurements] = useState({ width: 2000, height: 2400 });
    const [openingType, setOpeningType] = useState('Corredera');
    const [doorCount, setDoorCount] = useState(1);
    const [selectedPanel, setSelectedPanel] = useState('Meridian');
    const [panelSupplements, setPanelSupplements] = useState<Record<string, { checked: boolean, quantity: number }>>({});
    
    const openingOptions = ['Corredera', 'Fijo', 'Abatible', 'Plegable'];

    const pricingModel = useMemo(() => {
        const selectedOption = panelOptions.find(opt => opt.name === selectedPanel);
        return selectedOption?.type === 'coleccion' ? 'coleccion' : 'cristal';
    }, [selectedPanel]);

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

    const { total, details, name } = useMemo(() => {
        const widthInMeters = measurements.width / 1000;
        
        const priceData = pricingModel === 'coleccion' 
            ? tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal
            : tarifa2025['Paneles Divisorios'].Precios_por_Cristal_Euro_m_lineal;
        
        const priceListForType = priceData[constructedPanelType as keyof typeof priceData] || {};
        
        let basePrice = (priceListForType[selectedPanel as keyof typeof priceListForType] || 0) * widthInMeters;

        let total = basePrice;
        
        const doorString = `${doorCount} ${doorCount > 1 ? 'Puertas' : 'Puerta'}`;
        
        const selectedOption = panelOptions.find(opt => opt.name === selectedPanel);
        const displayName = selectedOption?.displayName || selectedPanel;
        const finalName = `Panel Divisorio ${displayName}`;

        const detailsArray = [openingType, doorString, `${measurements.height}x${measurements.width}mm`];
        
        if (measurements.height < 1500) {
            total *= 0.75; // 25% discount
            detailsArray.push('Dto. altura < 1500mm (-25%)');
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

        return { total, details: detailsArray.join(', '), name: finalName };
    }, [measurements, openingType, doorCount, selectedPanel, panelSupplements, pricingModel, constructedPanelType]);

    const handleSaveItem = () => {
        const lineItem = { name, details, quantity: 1, price: total, total };
        onSave(lineItem);
    };

    const currentImage = useMemo(() => {
        const selectedOption = panelOptions.find(opt => opt.name === selectedPanel);
        if (selectedOption?.type === 'coleccion') {
            return collectionImages[selectedPanel] || 'https://placehold.co/600x400.png';
        }
        if (selectedOption?.type === 'cristal') {
            return cristalImages[selectedPanel] || 'https://placehold.co/600x400.png';
        }
        return 'https://placehold.co/600x400.png';
    }, [selectedPanel]);

    const isOptionDisabled = (option: typeof panelOptions[0]) => {
        const priceData = option.type === 'coleccion' 
            ? tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal
            : tarifa2025['Paneles Divisorios'].Precios_por_Cristal_Euro_m_lineal;
    
        const priceListForType = priceData[constructedPanelType as keyof typeof priceData];
    
        return !priceListForType || !priceListForType[option.name as keyof typeof priceListForType];
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
                                {measurements.height > 2700 && (
                                    <p className="text-xs text-destructive mt-1">Altura superior a 2700mm, consultar.</p>
                                )}
                                {measurements.height < 1500 && (
                                    <p className="text-xs text-muted-foreground mt-1">Dto. altura &lt; 1500mm (-25%)</p>
                                )}
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
                            <Label>Colección / Cristal</Label>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {panelOptions.map((option) => (
                                    <button
                                        key={option.name}
                                        type="button"
                                        onClick={() => setSelectedPanel(option.name)}
                                        disabled={isOptionDisabled(option)}
                                        className={cn(
                                            "rounded-lg border bg-card text-card-foreground shadow-sm transition-all flex flex-col items-center gap-1 p-1 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
                                            selectedPanel === option.name && "ring-2 ring-primary"
                                        )}
                                    >
                                        <Image 
                                            src={panelSmallImages[option.name] || 'https://placehold.co/120x80.png'}
                                            alt={option.displayName || option.name}
                                            width={120}
                                            height={80}
                                            className="rounded-md object-cover"
                                        />
                                        <div className={cn("text-xs text-center font-medium w-full flex items-center justify-center gap-1 h-8 px-1",
                                             selectedPanel === option.name ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            <span className="truncate">{option.displayName || option.name}</span>
                                            {selectedPanel === option.name && (
                                                <Check className="h-4 w-4 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="suplementos" className="pt-4">
                        <ScrollArea className="h-[29rem] border rounded-md p-4">
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
                    src={currentImage}
                    alt={selectedPanel}
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="divider"
                    priority
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
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

    


    