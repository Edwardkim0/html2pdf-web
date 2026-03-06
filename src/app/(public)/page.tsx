"use client";

import { useEffect } from "react";
import ConverterApp from "@/components/converter/ConverterApp";

export default function HomePage() {
  useEffect(() => {
    // Fire-and-forget visit tracking
    fetch("/api/visits", { method: "POST" }).catch(() => {
      // Silently ignore tracking errors
    });
  }, []);

  return <ConverterApp />;
}
