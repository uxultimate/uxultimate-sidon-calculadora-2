"use client";

import Image from "next/image";
import * as React from "react";

export function PdfLogo(props: { className?: string }) {
  return (
    <Image
      src="/images/sidon-logo-2x.png"
      alt="Logo de Sidon"
      width={145}
      height={30}
      className={props.className}
    />
  );
}
