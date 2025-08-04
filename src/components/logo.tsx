"use client";

import Image from "next/image";
import * as React from "react";

export function Logo(props: { className?: string }) {
  return (
    <Image
      src="/images/sidon-logo-n.svg"
      alt="Logo de Sidon"
      width={90}
      height={22}
      priority // Carga el logo más rápido, es importante para el LCP
      className={props.className}
    />
  );
}
