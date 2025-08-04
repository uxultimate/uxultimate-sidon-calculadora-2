
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-6 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
                404 - Página no encontrada
            </h1>
            <p className="text-lg text-muted-foreground">
                Vaya, parece que la página que buscas no existe.
            </p>
        </div>
        <Button asChild>
            <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
    </div>
  );
}
