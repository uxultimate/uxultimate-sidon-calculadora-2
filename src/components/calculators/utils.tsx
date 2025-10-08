
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
    { name: "Blanco Roto", imageUrl: "https://picsum.photos/seed/laca-blanca-01/64/64" },
    { name: "Ayure", imageUrl: "https://picsum.photos/seed/laca-ayure-03/64/64" },
    { name: "Azul Light", imageUrl: "https://picsum.photos/seed/laca-azul-light-04/64/64" },
    { name: "Beige Grisaceo", imageUrl: "https://picsum.photos/seed/laca-beige-grisaceo-05/64/64" },
    { name: "Desierto", imageUrl: "https://picsum.photos/seed/laca-desierto-06/64/64" },
    { name: "Gris Azulado", imageUrl: "https://picsum.photos/seed/laca-gris-azulado-14/64/64" },
    { name: "Gris Coco", imageUrl: "https://picsum.photos/seed/laca-gris-coco-07/64/64" },
    { name: "Gris Medio", imageUrl: "https://picsum.photos/seed/laca-gris-medio-08/64/64" },
    { name: "Gris Perla", imageUrl: "https://picsum.photos/seed/laca-gris-perla-09/64/64" },
    { name: "Laca RAL", imageUrl: "https://picsum.photos/seed/laca-ral-02/64/64" },
    { name: "Verde Alga", imageUrl: "https://picsum.photos/seed/laca-verde-alga-10/64/64" },
    { name: "Verde Bosque", imageUrl: "https://picsum.photos/seed/laca-verde-bosque-11/64/64" },
    { name: "Verde Musgo", imageUrl: "https://picsum.photos/seed/laca-verde-musgo-12/64/64" },
    { name: "Vulcano", imageUrl: "https://picsum.photos/seed/laca-vulcano-13/64/64" },
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

    