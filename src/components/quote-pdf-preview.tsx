
"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CompanyProfile, Quote } from '@/lib/types';
import { PdfLogo } from './pdf-logo';
import { formatCurrency } from '@/lib/utils';

interface QuotePDFPreviewProps {
    quote: Quote;
    company: CompanyProfile;
}


export const QuotePDFPreview: React.FC<QuotePDFPreviewProps> = ({ quote, company }) => {

    const creationDate = quote.createdAt ? (quote.createdAt as Date).toLocaleDateString('es-ES') : 'Pendiente';
    const displayQuoteNumber = quote.quoteNumber || quote.id.slice(0, 6).toUpperCase();
    const subtotalAfterDiscount = quote.subtotal - (quote.discountAmount || 0);

    return (
        <Card className="p-8 shadow-none border-0 bg-white rounded-none pb-8">
            <CardHeader className="p-0 mb-8 grid grid-cols-2 gap-4 items-start">
                <div>
                    <PdfLogo />
                    {company && (
                        <div className='mt-4'>
                            <p className="text-sm font-semibold text-gray-800">{company.name}</p>
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
            
            <div>
                <h4 className="font-semibold text-gray-800">Cliente:</h4>
                <div className="text-sm text-muted-foreground">
                    <p className="font-bold">{quote.contactName}</p>
                    {quote.contactCompanyName && <p>{quote.contactCompanyName}</p>}
                    {quote.contactCif && <p>{quote.contactCif}</p>}
                    {quote.contactAddress && <p>{quote.contactAddress}</p>}
                    {quote.contactEmail && <p>{quote.contactEmail}</p>}
                    {quote.contactPhone && <p>{quote.contactPhone}</p>}
                </div>
            </div>


            <Separator className="my-6" />

            <CardContent className="p-0">
                <div className="rounded-md border my-8 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ud</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right w-[120px]">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quote.lineItemGroups.map((group) => (
                                <React.Fragment key={group.id}>
                                    <TableRow className="bg-muted/30">
                                        <TableCell className="font-bold">1</TableCell>
                                        <TableCell className="font-bold">{group.reference}</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(group.total)}</TableCell>
                                    </TableRow>
                                    {group.lineItems.map((item, itemIndex) => (
                                        <TableRow key={`${group.id}-${itemIndex}`} className="text-sm">
                                            <TableCell></TableCell>
                                            <TableCell colSpan={2}>
                                                <p className="text-muted-foreground break-words whitespace-normal">
                                                    {item.quantity > 1 && `${item.quantity}x `}{item.name}: {item.details}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col items-end gap-4 p-0 pt-8">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                    </div>
                    {quote.discountAmount && quote.discountAmount > 0 && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Dto. Adicional ({quote.discountPercentage}%)</span>
                            <span className='text-destructive'>-{formatCurrency(quote.discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Imponible</span>
                        <span>{formatCurrency(subtotalAfterDiscount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">IVA (21%)</span>
                        <span>{formatCurrency(quote.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(quote.total)}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
