
"use client";

import React, { useState, useRef } from 'react';
import { QuoteForm } from '@/components/quote-form';
import { useToast } from '@/hooks/use-toast';
import { QuotePDFPreview } from '@/components/quote-pdf-preview';
import type { CompanyProfile, Quote, LineItem, LineItemGroup, ClientProfile } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useQuote } from '@/context/quote-context';


interface CalculatorOneProps {
    stagedLineItems: LineItem[];
    removeStagedLineItem: (id: number) => void;
    currentQuote: Quote | null;
    setCurrentQuote: (quote: Quote | null) => void;
    onCancel: () => void;
    lineItemGroups: LineItemGroup[];
    addGroupToQuote: (reference: string) => void;
    removeLineItemGroup: (id: string) => void;
    moveLineItemGroupUp: (id: string) => void;
    moveLineItemGroupDown: (id: string) => void;
}

export function CalculatorOne({ 
    stagedLineItems, 
    removeStagedLineItem, 
    currentQuote, 
    setCurrentQuote, 
    onCancel,
    lineItemGroups,
    addGroupToQuote,
    removeLineItemGroup,
    moveLineItemGroupUp,
    moveLineItemGroupDown,
}: CalculatorOneProps) {
    const { toast } = useToast();
    const { clientProfile, setClientProfile, discountPercentage, setDiscountPercentage } = useQuote();
    const [isSaving, setIsSaving] = useState(false);
    const pdfRenderRef = React.useRef<HTMLDivElement>(null);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const companyProfile: CompanyProfile = {
        name: "Sidon",
        address: "C/ Pico Almanzor, 24-26\nArganda del Rey, Madrid",
        phone: "+34 918 703 223",
        email: "hola@sidonarmarios.com",
        logoUrl: "/images/sidon-logo-n.svg"
    };

    const handleGenerateQuote = async () => {
        setIsSaving(true);
        if (lineItemGroups.length === 0) {
            toast({
                variant: "destructive",
                title: "Presupuesto Vacío",
                description: "Añade al menos un grupo de conceptos al presupuesto.",
            });
            setIsSaving(false);
            return;
        }

        if (!clientProfile.contactName || !clientProfile.contactEmail) {
             toast({
                variant: "destructive",
                title: "Faltan datos del cliente",
                description: "El nombre y el email del cliente son obligatorios.",
            });
            setIsSaving(false);
            return;
        }

        try {
            const quoteNumber = `P-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            
            const subtotal = lineItemGroups.reduce((acc, group) => acc + group.total, 0);
            const discountAmount = subtotal * (discountPercentage / 100);
            const subtotalAfterDiscount = subtotal - discountAmount;
            const tax = subtotalAfterDiscount * 0.21;
            const total = subtotalAfterDiscount + tax;

            const finalQuote: Quote = {
                id: Math.random().toString(36).substring(2, 9),
                quoteNumber: quoteNumber,
                status: 'draft',
                createdAt: new Date(),
                ...clientProfile,
                lineItemGroups,
                subtotal,
                discountPercentage,
                discountAmount,
                tax,
                total,
            };

            setCurrentQuote(finalQuote);

            toast({
                title: "Presupuesto Generado",
                description: "El presupuesto se ha calculado y está listo para previsualizar y descargar."
            });
            
            setTimeout(() => {
                previewRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
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
            
            const PADDING = 10;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const contentWidth = pageWidth - (PADDING * 2);
    
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / contentWidth;
            const contentHeight = canvasHeight / ratio;
    
            let heightLeft = contentHeight;
            let position = 0;
            
            const pageContentHeight = pageHeight - (PADDING * 2);
    
            pdf.addImage(imgData, 'PNG', PADDING, PADDING, contentWidth, contentHeight);
            heightLeft -= pageContentHeight;
    
            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', PADDING, position + PADDING, contentWidth, contentHeight);
                heightLeft -= pageContentHeight;
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
            <QuoteForm 
                stagedLineItems={stagedLineItems} 
                removeStagedLineItem={removeStagedLineItem}
                onCancel={onCancel}
                lineItemGroups={lineItemGroups}
                addGroupToQuote={addGroupToQuote}
                onGenerateQuote={handleGenerateQuote}
                isGenerating={isSaving}
                removeLineItemGroup={removeLineItemGroup}
                moveLineItemGroupUp={moveLineItemGroupUp}
                moveLineItemGroupDown={moveLineItemGroupDown}
                clientProfile={clientProfile}
                setClientProfile={setClientProfile}
                discountPercentage={discountPercentage}
                setDiscountPercentage={setDiscountPercentage}
            />

            {currentQuote && (
                <div className='mt-8' ref={previewRef}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Presupuesto Generado</h2>
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
