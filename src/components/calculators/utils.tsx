
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Check as CheckIcon } from 'lucide-react';

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
    { name: "Laca Blanca", imageUrl: "/images/colores/laca/laca-blanca-01.jpg" },
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


export const melaminaColorOptions = [
    { name: 'Aqua Blue', imageUrl: '/images/colores/melamina/melamina-aqua-blue-01.jpg' },
    { name: 'Azul Nautico', imageUrl: '/images/colores/melamina/melamina-azul-nautico-19.jpg' },
    { name: 'Blanco', imageUrl: '/images/colores/melamina/melamina-blanco-02.jpg' },
    { name: 'Britanian Oak', imageUrl: '/images/colores/melamina/melamina-britanian-oak-03.jpg' },
    { name: 'Cemento', imageUrl: '/images/colores/melamina/melamina-cemento-04.jpg' },
    { name: 'Crema Sil', imageUrl: '/images/colores/melamina/melamina-crema-sil-05.jpg' },
    { name: 'Espiga Pimienta', imageUrl: '/images/colores/melamina/melamina-espiga-pimienta-06.jpg' },
    { name: 'Espiga Sal', imageUrl: '/images/colores/melamina/melamina-espiga-sal-07.jpg' },
    { name: 'Gris Coco', imageUrl: '/images/colores/melamina/melamina-gris-coco-08.jpg' },
    { name: 'Gris Talco', imageUrl: '/images/colores/melamina/melamina-gris-talco-09.jpg' },
    { name: 'Gris Tormenta', imageUrl: '/images/colores/melamina/melamina-gris-tormenta-10.jpg' },
    { name: 'Gris Tortora', imageUrl: '/images/colores/melamina/melamina-gris-tortora-11.jpg' },
    { name: 'Hickory Frida', imageUrl: '/images/colores/melamina/melamina-hickory-frida-12.jpg' },
    { name: 'Lino Cancun', imageUrl: '/images/colores/melamina/melamina-lino-cancun-13.jpg' },
    { name: 'Lino Habana', imageUrl: '/images/colores/melamina/melamina-lino-habana-14.jpg' },
    { name: 'Malva Talco', imageUrl: '/images/colores/melamina/melamina-malva-talco-15.jpg' },
    { name: 'Marmol Atenea', imageUrl: '/images/colores/melamina/melamina-marmol-atenea-16.jpg' },
    { name: 'Marmol Blanco', imageUrl: '/images/colores/melamina/melamina-marmol-blanco-17.jpg' },
    { name: 'Marmol Hades', imageUrl: '/images/colores/melamina/melamina-marmol-hades-18.jpg' },
    { name: 'Mineral Grey', imageUrl: '/images/colores/melamina/melamina-mineral-grey-19.jpg' },
    { name: 'Nogal Slow', imageUrl: '/images/colores/melamina/melamina-nogal-slow-20.jpg' },
    { name: 'Nogal Valentina', imageUrl: '/images/colores/melamina/melamina-nogal-valentina-21.jpg' },
    { name: 'Olmo Sabi', imageUrl: '/images/colores/melamina/melamina-olmo-sabi-22.jpg' },
    { name: 'Olmo Wabi', imageUrl: '/images/colores/melamina/melamina-olmo-wabi-23.jpg' },
    { name: 'Roble Amazonas', imageUrl: '/images/colores/melamina/melamina-roble-amazonas-24.jpg' },
    { name: 'Roble Dafne', imageUrl: '/images/colores/melamina/melamina-roble-dafne-25.jpg' },
    { name: 'Roble Denver', imageUrl: '/images/colores/melamina/melamina-roble-denver-26.jpg' },
    { name: 'Roble Hera', imageUrl: '/images/colores/melamina/melamina-roble-hera-27.jpg' },
    { name: 'Roble Hercules', imageUrl: '/images/colores/melamina/melamina-roble-hercules-28.jpg' },
    { name: 'Roble Sinatra', imageUrl: '/images/colores/melamina/melamina-roble-sinatra-29.jpg' },
    { name: 'Roble Trufa', imageUrl: '/images/colores/melamina/melamina-roble-trufa-30.jpg' },
    { name: 'Talco', imageUrl: '/images/colores/melamina/melamina-talco-31.jpg' },
    { name: 'Tasmanian Moka', imageUrl: '/images/colores/melamina/melamina-tasmanian-moka-32.jpg' },
    { name: 'Verde Arcilla', imageUrl: '/images/colores/melamina/melamina-verde-arcilla-33.jpg' },
    { name: 'Verde Jungla', imageUrl: '/images/colores/melamina/melamina-verde-jungla-34.jpg' },
    { name: 'Verde Oliva', imageUrl: '/images/colores/melamina/melamina-verde-oliva-35.jpg' },
    { name: 'Verde Salvia', imageUrl: '/images/colores/melamina/melamina-verde-salvia-36.jpg' },
    { name: 'Verde Talco', imageUrl: '/images/colores/melamina/melamina-verde-talco-37.jpg' }
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

    