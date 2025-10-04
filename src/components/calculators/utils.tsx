
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
