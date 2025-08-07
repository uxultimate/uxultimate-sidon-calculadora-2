
"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CompanyProfile, Quote } from '@/lib/types';
import Image from 'next/image';
import { PdfLogo } from './pdf-logo';

interface QuotePDFPreviewProps {
    quote: Quote;
    company: CompanyProfile;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

export const QuotePDFPreview: React.FC<QuotePDFPreviewProps> = ({ quote, company }) => {

    const creationDate = quote.createdAt ? (quote.createdAt as Date).toLocaleDateString('es-ES') : 'Pendiente';
    const displayQuoteNumber = quote.quoteNumber || quote.id.slice(0, 6).toUpperCase();

    return (
        <Card className="p-8 shadow-none border-0 bg-white rounded-none pb-8">
            <CardHeader className="p-0 mb-8 grid grid-cols-2 gap-4">
                <div>
                    <PdfLogo />
                    {company && (
                        <div className='mt-4'>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{company.address}</p>
                            <p className="text-sm text-muted-foreground">{company.email}</p>
                            <p className="text-sm text-muted-foreground">{company.phone}</p>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <h3 className="text-lg font-semibold">PRESUPUESTO</h3>
                    <p className="text-sm text-muted-foreground">{displayQuoteNumber}</p>
                    <p className="mt-2 text-sm"><span className="font-semibold">Fecha:</span> {creationDate}</p>
                </div>
            </CardHeader>

            <Separator className="my-6" />

            <CardContent className="p-0">
                <div className="rounded-md border my-8 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-center w-[100px]">Cantidad</TableHead>
                                <TableHead className="text-right w-[120px]">Precio Unit.</TableHead>
                                <TableHead className="text-right w-[120px]">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quote.lineItems.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground break-words whitespace-normal">{item.details}</p>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatPrice(item.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col items-end gap-4 p-0 pt-8">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">IVA (21%)</span>
                        <span>{formatPrice(quote.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(quote.total)}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
