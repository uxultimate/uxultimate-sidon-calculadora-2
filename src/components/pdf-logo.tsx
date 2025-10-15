"use client";

import * as React from "react";

export function PdfLogo(props: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/sidon-logo-2x.png"
      alt="Logo de Sidon"
      width={145}
      height={30}
      className={props.className}
    />
  );
}
