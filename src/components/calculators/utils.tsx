
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Check as CheckIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';


export const ColorSwatch: React.FC<{ color: string, name: string, isSelected: boolean, onClick: () => void }> = ({ color, name, isSelected, onClick }) => (
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

export const lacaColorOptions = [
    { name: "Blanco Roto", imageUrl: "/images/colores/laca/laca-blanca-01.jpg" },
    { name: "Laca RAL", imageUrl: "/images/colores/laca/laca-ral-02.jpg" },
    { name: "Ayure", imageUrl: "/images/colores/laca/laca-ayure-03.jpg" },
    { name: "Azul Light", imageUrl: "/images/colores/laca/laca-azul-light-04.jpg" },
    { name: "Beige Grisaceo", imageUrl: "/images/colores/laca/laca-beige-grisaceo-05.jpg" },
    { name: "Desierto", imageUrl: "/images/colores/laca/laca-desierto-06.jpg" },
    { name: "Gris Coco", imageUrl: "/images/colores/laca/laca-gris-coco-07.jpg" },
    { name: "Gris Medio", imageUrl: "/images/colores/laca/laca-gris-medio-08.jpg" },
    { name: "Gris Perla", imageUrl: "/images/colores/laca/laca-gris-perla-09.jpg" },
    { name: "Verde Alga", imageUrl: "/images/colores/laca/laca-verde-alga-10.jpg" },
    { name: "Verde Bosque", imageUrl: "/images/colores/laca/laca-verde-bosque-11.jpg" },
    { name: "Verde Musgo", imageUrl: "/images/colores/laca/laca-verde-musgo-12.jpg" },
    { name: "Vulcano", imageUrl: "/images/colores/laca/laca-vulcano-13.jpg" },
    { name: "Gris Azulado", imageUrl: "/images/colores/laca/laca-gris-azulado-14.jpg" },
];


export const colorHexMap: Record<string, string> = {
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

    
