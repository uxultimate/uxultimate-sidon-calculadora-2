
"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";

export function PdfLogo(props: { className?: string }) {
  return (
    <img
      src="/images/sidon-logo-2x.png"
      alt="Logo de Sidon"
      width={194}
      height={70}
      className={props.className}
      style={{ objectFit: 'contain', height: '70px', width: '194px' }}
    />
  );
}
