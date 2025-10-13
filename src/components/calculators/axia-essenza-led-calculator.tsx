
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { tarifa2025 } from '@/lib/tarifa';
import type { LineItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface AxiaEssenzaLedCalculatorProps {
    onSave: (item: Omit<LineItem, 'id'>) => void;
    category: 'Accesorios Axia' | 'Accesorios Essenza';
}

type Product = typeof tarifa2025['Accesorios Axia']['Productos'][0] | typeof tarifa2025['Accesorios Essenza']['Productos'][0];

const axiaGroupKeywords: Record<string, string[]> = {
    'Pantaloneros': ['pantalonero'],
    'Zapateros': ['zapatero'],
    'Soportes y Elevadores': ['elevador'],
    'Espejos': ['espejo'],
    'Cestos y Tolvas': ['cesto', 'tolva'],
    'Barras y Percheros': ['barra', 'corbatero'],
    'Tablas de Planchar': ['planchar'],
};

const essenzaGroupKeywords: Record<string, string[]> = {
    'Cestos': ['cesto'],
    'Pantaloneros': ['pantalonero'],
    'Zapateros': ['zapatero'],
    'Kits': ['kit'],
};


const axiaImageMap: Record<string, string> = {
    'pantalonero doble': '/images/axia/pantalonero-doble-600x400.png',
    'pantalonero doble (ancho)': '/images/axia/pantalonero-doble-600x400.png',
    'zapatero extensible': '/images/axia/zapatero-extensible-600x400.png',
    'soporte elevador ropa': '/images/axia/soporte-elevador-ropa-600x400.png',
    'pantalonero doble bandejas': '/images/axia/pantalonero-doble-bandejas-600x400.png',
    'espejo extraíble': '/images/axia/espejo-extraible-600x400.png',
    'pantalonero percha cuadrada': '/images/axia/pantalonero-percha-cuadrada-600x400.png',
    'corbatero': '/images/axia/corbatero-600x400.png',
    'barra extraíble': '/images/axia/barra-extraible-600x400.png',
    'tolva': '/images/axia/tolva-600x400.png',
    'tabla de planchar extraible': '/images/axia/tabla-de-planchar-extraible-600x400.png',
};

const axiaSmallImageMap: Record<string, string> = {
    'pantalonero doble': '/images/axia/small/pantalonero-doble-150x100.png',
    'pantalonero doble (ancho)': '/images/axia/small/pantalonero-doble-150x100.png',
    'zapatero extensible': '/images/axia/small/zapatero-extensible-150x100.png',
    'soporte elevador ropa': '/images/axia/small/soporte-elevador-ropa-150x100.png',
    'pantalonero doble bandejas': '/images/axia/small/pantalonero-doble-bandejas-150x100.png',
    'espejo extraíble': '/images/axia/small/espejo-extraible-150x100.png',
    'pantalonero percha cuadrada': '/images/axia/small/pantalonero-percha-cuadrada-150x100.png',
    'corbatero': '/images/axia/small/corbatero-150x100.png',
    'barra extraíble': '/images/axia/small/barra-extraible-150x100.png',
    'tolva': '/images/axia/small/tolva-150x100.png',
    'tabla de planchar extraible': '/images/axia/small/tabla-de-planchar-extraible-150x100.png',
};

const essenzaImageMap: Record<string, string> = {
    'cesto profundo': '/images/essenza/cesto-profundo-600x400.png',
    'cesto': '/images/essenza/cesto-600x400.png',
    'pantalonero': '/images/essenza/pantaloreno-600x400.png',
    'zapatero': '/images/essenza/zapatero-600x400.png',
    'kit porta-relojes': '/images/essenza/kit-porta-relojes-600x400.png',
    'kit porta-pendientes': '/images/essenza/porta-pendientes-600x400.png',
    'kit modular': '/images/essenza/kit-modular-2-4-6-espacios-600x400.png',
};

const essenzaSmallImageMap: Record<string, string> = {
    'cesto profundo': '/images/essenza/small/cesto-profundo-150x100.png',
    'cesto': '/images/essenza/small/cesto-150x100.png',
    'pantalonero': '/images/essenza/small/pantaloreno-150x100.png',
    'zapatero': '/images/essenza/small/zapatero-150x100.png',
    'kit porta-relojes': '/images/essenza/small/kit-porta-relojes-150x100.png',
    'kit porta-pendientes': '/images/essenza/small/porta-pendientes-150x100.png',
    'kit modular': '/images/essenza/small/kit-modular-2-4-6-espacios-150x100.png',
};


const getProductIdentifier = (p: Product) => `${p.Producto}-${(p as any).Ancho || (p as any).Rango_Ancho}`;

const getSmallImage = (productName: string, category: 'Accesorios Axia' | 'Accesorios Essenza'): string => {
    const lowerProductName = productName.toLowerCase();
    const imageMap = category === 'Accesorios Axia' ? axiaSmallImageMap : essenzaSmallImageMap;

    for (const key in imageMap) {
        if (lowerProductName.includes(key)) {
            return `${imageMap[key]}?v=1.0`;
        }
    }
    return 'https://placehold.co/150x100.png?v=1.0';
};


export const AxiaEssenzaLedCalculator: React.FC<AxiaEssenzaLedCalculatorProps> = ({ onSave, category }) => {
    const products = tarifa2025[category].Productos;
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    const [quantity, setQuantity] = useState(1);

    const groupedProducts = useMemo(() => {
        const groups: Record<string, Product[]> = {};
        const others: Product[] = [];
        const groupKeywords = category === 'Accesorios Axia' ? axiaGroupKeywords : essenzaGroupKeywords;

        products.forEach(product => {
            let assigned = false;
            for (const groupName in groupKeywords) {
                if (groupKeywords[groupName].some(keyword => product.Producto.toLowerCase().includes(keyword))) {
                    if (!groups[groupName]) {
                        groups[groupName] = [];
                    }
                    groups[groupName].push(product);
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                if (!groups['Otros']) groups['Otros'] = [];
                others.push(product);
            }
        });
        
        if (others.length > 0) {
            groups['Otros'] = (groups['Otros'] || []).concat(others);
        }

        return groups;
    }, [products, category]);
    

    const handleProductChange = (productIdentifier: string) => {
        const product = products.find(p => getProductIdentifier(p) === productIdentifier);
        if (product) setSelectedProduct(product);
    }

    const total = selectedProduct.Precio * quantity;

    const {name, details} = useMemo(() => {
        const product = selectedProduct as any;
        const widthInfo = product.Ancho ? `, Ancho: ${product.Ancho}` : (product.Rango_Ancho ? `, Rango Ancho: ${product.Rango_Ancho}` : '');
        const finalName = `${category}: ${product.Producto}`;
        const finalDetails = `Acabado: ${product.Acabado}${widthInfo}`;
        return { name: finalName, details: finalDetails };
    }, [category, selectedProduct]);

    const handleSaveItem = () => {
        onSave({
            name,
            details,
            quantity,
            price: selectedProduct.Precio,
            total,
        });
    };
    
    const selectedProductIdentifier = getProductIdentifier(selectedProduct);

    const currentImage = useMemo(() => {
        const productName = selectedProduct.Producto.toLowerCase();
        const imageMap = category === 'Accesorios Axia' ? axiaImageMap : essenzaImageMap;

        for (const key in imageMap) {
            if (productName.includes(key)) {
                return `${imageMap[key]}?v=1.0`;
            }
        }
        return '/images/placeholder-600x400.png?v=1.0';
    }, [selectedProduct, category]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <Label>Producto</Label>
                        <ScrollArea className="h-96 w-full rounded-md border mt-2">
                             <div className="p-2 pr-3 space-y-1">
                                {Object.entries(groupedProducts).map(([groupName, productsInGroup]) => (
                                    <div key={groupName}>
                                        <p className="py-1.5 px-2 text-sm font-semibold text-muted-foreground">{groupName}</p>
                                        {productsInGroup.map((p, index) => {
                                            const identifier = getProductIdentifier(p);
                                            const isSelected = selectedProductIdentifier === identifier;
                                            return (
                                                 <button
                                                    key={`${identifier}-${index}`}
                                                    type="button"
                                                    onClick={() => handleProductChange(identifier)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                                                        isSelected
                                                            ? "bg-accent text-accent-foreground"
                                                            : "hover:bg-accent/50"
                                                    )}
                                                >
                                                    <Image
                                                        src={getSmallImage(p.Producto, category)}
                                                        alt={p.Producto}
                                                        width={80}
                                                        height={53}
                                                        className="rounded-md object-cover bg-white w-20 h-14"
                                                    />
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-sm leading-tight">{p.Producto}</p>
                                                        {((p as any).Ancho || (p as any).Rango_Ancho) && (
                                                            <p className="text-xs text-muted-foreground">{((p as any).Ancho || (p as any).Rango_Ancho)}mm</p>
                                                        )}
                                                    </div>
                                                     {isSelected && (
                                                        <Check className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div>
                        <Label>Cantidad</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" className="text-center w-20" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                         <Card className='mt-4'>
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
                </div>
            </div>
            <div className="md:col-span-1 space-y-4">
                 <Image
                    src={currentImage}
                    alt={selectedProduct.Producto}
                    width={600}
                    height={400}
                    className="rounded-md object-cover aspect-[3/2]"
                    data-ai-hint="accessory"
                    key={currentImage} 
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Total del Concepto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(total)}</p>
                        <p className="text-sm text-muted-foreground mb-2">{formatCurrency(selectedProduct.Precio)} / ud.</p>
                        <p className="font-semibold text-sm break-words">{name} (x{quantity})</p>
                        <p className="text-xs text-muted-foreground break-words">{details}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleSaveItem} className="w-full">Añadir al Presupuesto</Button>
            </div>
        </div>
    );
};
