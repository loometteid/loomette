'use client';

import { useRouter } from "next/navigation";
import { Fragment, PropsWithChildren } from 'react';

export default function CalendarLoadingTemplate({ children }: PropsWithChildren) {
  const router = useRouter();

  return <Fragment key={router.bfcacheId}>{children}</Fragment>
}
