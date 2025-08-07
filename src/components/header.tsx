
"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { useQuote } from "@/context/quote-context";

export function Header() {
    const { handleCancel } = useQuote();
    return (
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 z-50">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
            </Link>
            <Button onClick={handleCancel} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Presupuesto
            </Button>
        </header>
    );
}
