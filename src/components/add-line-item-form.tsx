
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LineItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { PanelesDivisoriosCalculator } from './calculators/paneles-divisorios-calculator';
import { FrenteAbatibleCalculator } from './calculators/frente-abatible-calculator';
import { FrenteCorrederaCalculator } from './calculators/frente-corredera-calculator';
import { InteriorVestidorCalculator } from './calculators/interior-vestidor-calculator';
import { CajonesCalculator } from './calculators/cajones-calculator';
import { TiradoresCalculator } from './calculators/tiradores-calculator';
import { AxiaEssenzaLedCalculator } from './calculators/axia-essenza-led-calculator';


interface AddLineItemFormProps {
    onAddItem: (item: Omit<LineItem, 'id'>) => void;
}

export function AddLineItemForm({ onAddItem }: AddLineItemFormProps) {
    const { toast } = useToast();
    
    const handleSave = (item: Omit<LineItem, 'id'>) => {
        onAddItem(item);
        toast({
            title: "Concepto añadido",
            description: `${item.name} se ha añadido al presupuesto.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                 <CardTitle>Añadir Concepto al Presupuesto</CardTitle>
                 <CardDescription>Selecciona una categoría y completa los detalles para añadir un nuevo concepto al presupuesto.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="paneles" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto mb-4">
                        <TabsTrigger value="paneles">Paneles</TabsTrigger>
                        <TabsTrigger value="frentes">Frentes de Armario</TabsTrigger>
                        <TabsTrigger value="interiores">Interiores y Accesorios</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="paneles" className="mt-4">
                        <PanelesDivisoriosCalculator onSave={handleSave} />
                    </TabsContent>

                    <TabsContent value="frentes" className="mt-4">
                        <Tabs defaultValue="abatible" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-auto mb-4">
                                <TabsTrigger value="abatible">Abatible y Plegable</TabsTrigger>
                                <TabsTrigger value="corredera">Corredera</TabsTrigger>
                            </TabsList>
                            <TabsContent value="abatible" className="mt-4">
                                <FrenteAbatibleCalculator onSave={handleSave} />
                            </TabsContent>
                            <TabsContent value="corredera" className="mt-4">
                                <FrenteCorrederaCalculator onSave={handleSave} />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                    
                    <TabsContent value="interiores" className="mt-4">
                         <Tabs defaultValue="interior" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 h-auto mb-4">
                                <TabsTrigger value="interior">Interior y Vestidor</TabsTrigger>
                                <TabsTrigger value="cajones">Cajones y Bandejas</TabsTrigger>
                                <TabsTrigger value="tiradores">Tiradores</TabsTrigger>
                                <TabsTrigger value="axia">Accesorios Axia</TabsTrigger>
                                <TabsTrigger value="essenza">Accesorios Essenza</TabsTrigger>
                            </TabsList>
                            <TabsContent value="interior" className="mt-4">
                                <InteriorVestidorCalculator onSave={handleSave} />
                            </TabsContent>
                             <TabsContent value="cajones" className="mt-4">
                                <CajonesCalculator onSave={handleSave} />
                            </TabsContent>
                             <TabsContent value="tiradores" className="mt-4">
                                <TiradoresCalculator onSave={handleSave} />
                            </TabsContent>
                            <TabsContent value="axia" className="mt-4">
                                <AxiaEssenzaLedCalculator onSave={handleSave} category="Accesorios Axia"/>
                            </TabsContent>
                            <TabsContent value="essenza" className="mt-4">
                                <AxiaEssenzaLedCalculator onSave={handleSave} category="Accesorios Essenza"/>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

