"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";

export default function CalendarTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  // @see https://nextjs.org/docs/app/api-reference/functions/use-router#bfcacheid
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}

