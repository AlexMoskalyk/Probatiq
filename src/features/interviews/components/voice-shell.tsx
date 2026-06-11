"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { errorToast } from "@/src/lib/error-toast";
import type { ReactNode } from "react";

export function VoiceShell({ children }: { children: ReactNode }) {
  return (
    <VoiceProvider
      onError={(err) => {
        console.error("[hume]", err.type, err.reason, err.message, err.error);
        errorToast(`${err.type}: ${err.message}`);
      }}
      onClose={(event) => {
        console.warn("[hume] close", event?.code, event?.reason);
      }}
    >
      {children}
    </VoiceProvider>
  );
}
