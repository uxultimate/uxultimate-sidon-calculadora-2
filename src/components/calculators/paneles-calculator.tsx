
"use client";

import React, { useState } from 'react';
import { tarifa2025 } from '@/lib/tarifa';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LineItem } from '@/lib/types';

export const PanelesCalculator: React.FC<{ onSave: (item: Omit<LineItem, 'id'>) => void }> = ({ onSave }) => {
    const [panelType, setPanelType] = useState('Corredera');
    
    // This function is kept for future use but is not currently wired up to a button.
    const handleSaveItem = () => {
        const lineItem = { name: "Test Item", details: `Panel Type: ${panelType}`, quantity: 1, price: 0, total: 0 };
        onSave(lineItem);
    };

    return (
        <div className="p-4">
            <div className="w-full sm:w-1/2">
                <Label>Tipo de Apertura</Label>
                <Select value={panelType} onValueChange={setPanelType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.keys(tarifa2025['Paneles Divisorios'].Precios_por_Coleccion_Euro_m_lineal).map((type, index) => (
                            <SelectItem key={`${type}-${index}`} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground mt-2">
                    Selected: {panelType}
                </p>
            </div>
        </div>
    );
}
