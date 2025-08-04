
"use client";

import React from "react";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background flex-col gap-4 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold text-destructive">Algo salió mal</h1>
            <p className="text-muted-foreground max-w-md text-center">
                Ocurrió un error inesperado en la aplicación.
            </p>
             {this.state.error && (
                <pre className="mt-2 w-full max-w-md overflow-x-auto rounded-md bg-muted p-4 text-xs">
                    {this.state.error.message}
                </pre>
            )}
            <div className="flex items-center gap-4 mt-4">
               <Button onClick={() => this.setState({ hasError: false, error: null })}>Reintentar</Button>
               <Button variant="outline" onClick={() => window.location.href = '/'}>Volver al Inicio</Button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
