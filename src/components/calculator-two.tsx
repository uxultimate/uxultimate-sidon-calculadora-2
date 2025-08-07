
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface CalculatorTwoProps {
    lineItems: LineItem[];
    removeLineItem: (id: number) => void;
}

export function CalculatorTwo({ lineItems, removeLineItem }: CalculatorTwoProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
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
            return null;
        }

        setIsProcessingPdf(true);
        try {
            const canvas = await html2canvas(quoteElement, {
                 scale: 2, 
                 useCORS: true,
                 width: 800,
                 windowWidth: 800,
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            
            const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4', hotfixes: ['px_scaling'] });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            pdf.save(`presupuesto-${currentQuote?.quoteNumber || 'documento'}.pdf`);
            toast({ title: "PDF Descargado", description: "El presupuesto se ha guardado como PDF." });

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'Error de PDF', description: 'No se pudo generar el archivo PDF.' });
        } finally {
            setIsProcessingPdf(false);
        }
    };
    
    if (lineItems.length === 0 && !currentQuote) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Conceptos del Presupuesto</CardTitle>
                    <CardDescription>
                        Añada un concepto para empezar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p>Añade un concepto para empezar a crear el presupuesto.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="flex flex-col gap-8 py-4">
            <QuoteForm onSave={handleSave} isSaving={isSaving} lineItems={lineItems} removeLineItem={removeLineItem} />

            {currentQuote && (
                <div className='mt-8'>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Previsualización del Presupuesto</h2>
                        <Button onClick={handleDownloadPdf} disabled={isProcessingPdf}>
                            {isProcessingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Descargar PDF
                        </Button>
                    </div>
                    <QuotePDFPreview quote={currentQuote} company={companyProfile} />
                    {/* Hidden element for PDF generation */}
                    <div className="absolute -left-[9999px] top-auto" style={{ width: '800px', height: 'auto' }}>
                        <div ref={pdfRenderRef}>
                             <QuotePDFPreview quote={currentQuote} company={companyProfile} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
