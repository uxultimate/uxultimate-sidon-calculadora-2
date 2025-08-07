
"use client";

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { LineItem } from '@/lib/types';
import { PanelesCalculator } from './calculators/paneles-calculator';

interface AddLineItemDialogTwoProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddItem: (item: Omit<LineItem, 'id'>) => void;
}

export function AddLineItemDialogTwo({ open, onOpenChange, onAddItem }: AddLineItemDialogTwoProps) {
    
    const handleSave = (item: Omit<LineItem, 'id'>) => {
        onAddItem(item);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-6">
                <div className="flex-1 overflow-y-auto">
                    <PanelesCalculator onSave={handleSave} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
