
"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { useQuote } from "@/context/quote-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function Header() {
    const { handleCancel } = useQuote();
    return (
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 z-50">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
            </Link>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Presupuesto
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción borrará el presupuesto actual, incluyendo todos los conceptos, grupos y datos del cliente. No podrás recuperar los datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>Confirmar y Borrar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>
    );
}
