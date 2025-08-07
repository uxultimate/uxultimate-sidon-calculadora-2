"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";

export function PdfLogo(props: { className?: string }) {
  return (
    <img
      src="/images/sidon-logo-2x.png"
      alt="Logo de Sidon"
      width={145}
      height={30}
      className={props.className}
      style={{ width: '145px', height: '30px' }}
    />
  );
}
