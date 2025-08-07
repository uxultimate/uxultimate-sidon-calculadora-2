
"use client";

import React, { useState } from 'react';
import { QuoteForm } from '@/components/quote-form';
import { useToast } from '@/hooks/use-toast';
import { QuotePDFPreview } from '@/components/quote-pdf-preview';
import type { CompanyProfile, Quote, LineItem } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';


interface CalculatorOneProps {
    lineItems: LineItem[];
    removeLineItem: (id: number) => void;
    currentQuote: Quote | null;
    setCurrentQuote: (quote: Quote | null) => void;
    handleCancel: () => void;
}

export function CalculatorOne({ lineItems, removeLineItem, currentQuote, setCurrentQuote, handleCancel }: CalculatorOneProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const pdfRenderRef = React.useRef<HTMLDivElement>(null);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);

    // Mock company profile
    const companyProfile: CompanyProfile = {
        name: "Sidon",
        cif: "B12345678",
        address: "Calle Falsa 123, Ciudad Real",
        phone: "+34 123 456 789",
        email: "contacto@sidon.es",
        logoUrl: "/images/sidon-logo-n.svg"
    };

    const handleSave = async (quoteData: any) => {
        setIsSaving(true);
        try {
            const quoteNumber = `P-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            
            const finalQuote = {
                ...quoteData,
                id: Math.random().toString(36).substring(2, 9),
                quoteNumber: quoteNumber,
                status: 'draft',
                createdAt: new Date(),
            } as Quote;

            setCurrentQuote(finalQuote);

            toast({
                title: "Presupuesto Generado",
                description: "El presupuesto se ha calculado y está listo para previsualizar y descargar."
            });
            
        } catch (error) {
            console.error("Error saving quote: ", error);
            toast({
                variant: "destructive",
                title: "Error al Guardar",
                description: "No se pudo generar el presupuesto."
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDownloadPdf = async () => {
        const quoteElement = pdfRenderRef.current;
        if (!quoteElement) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar el contenido del presupuesto para generar el PDF.' });
            return;
        }
    
        setIsProcessingPdf(true);
        try {
            const canvas = await html2canvas(quoteElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                width: quoteElement.offsetWidth,
                height: quoteElement.offsetHeight,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageHeight = pdf.internal.pageSize.getHeight();
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            const PADDING = 10;
            const contentWidth = pageWidth - (PADDING * 2);
    
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / contentWidth;
            const contentHeight = canvasHeight / ratio;
    
            let heightLeft = contentHeight;
            let position = PADDING; // Start with top padding
    
            // Add the first page, respecting top padding
            pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, contentHeight);
            heightLeft -= (pageHeight - PADDING * 2); // Account for top and bottom padding
    
            while (heightLeft > 0) {
                position = heightLeft - contentHeight + PADDING; // Adjust position for the new page
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, contentHeight);
                heightLeft -= (pageHeight - PADDING * 2); // Account for top and bottom padding
            }
            
            pdf.save(`presupuesto-${currentQuote?.quoteNumber || 'documento'}.pdf`);
            toast({ title: "PDF Descargado", description: "El presupuesto se ha guardado como PDF." });
    
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'Error de PDF', description: 'No se pudo generar el archivo PDF.' });
        } finally {
            setIsProcessingPdf(false);
        }
    };
    
    return (
        <div className="flex flex-col gap-8">
            <QuoteForm onSave={handleSave} isSaving={isSaving} lineItems={lineItems} removeLineItem={removeLineItem} onCancel={handleCancel} />

            {currentQuote && (
                <div className='mt-8'>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Previsualización del Presupuesto</h2>
                        <Button onClick={handleDownloadPdf} disabled={isProcessingPdf}>
                            {isProcessingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Descargar PDF
                        </Button>
                    </div>
                     <div className="w-full">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                            <QuotePDFPreview quote={currentQuote} company={companyProfile} />
                        </div>
                    </div>
                    {/* Hidden element for PDF generation */}
                    <div className="fixed -left-[9999px] top-0 bg-white" style={{ width: '210mm' }}>
                         <div ref={pdfRenderRef}>
                             <QuotePDFPreview quote={currentQuote} company={companyProfile} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
