"use client";

import NextLink from "next/link";
import { ComponentProps } from "react";

export function Link({
  children,
  className,
  ...props
}: ComponentProps<typeof NextLink>) {
  return (
    <Link
      className={[
        "text-green-600 hover:text-green-700 hover:underline",
        className,
      ].join(" ")}
      {...props}>
      {children}
    </Link>
  );
}
