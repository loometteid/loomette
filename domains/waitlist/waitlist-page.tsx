"use client";

import { useState } from "react";
import { WaitlistShell } from "./components/waitlist-shell";
import { WaitlistForm } from "./components/waitlist-form";
import { WaitlistSuccess } from "./components/waitlist-success";
import type { WaitlistFormValues } from "./schemas/waitlist.schema";

export function WaitlistPage() {
  const [submittedData, setSubmittedData] = useState<WaitlistFormValues | null>(
    null,
  );

  return (
    <WaitlistShell
      title={submittedData ? "Spot reserved." : "Be the first in line."}
      subtitle="YOUR WARDROBE, FINALLY ORGANIZED"
      data-testid="waitlist-page"
    >
      {submittedData ? (
        <WaitlistSuccess
          email={submittedData.email}
          name={submittedData.name}
        />
      ) : (
        <WaitlistForm onSuccess={(values) => setSubmittedData(values)} />
      )}
    </WaitlistShell>
  );
}
