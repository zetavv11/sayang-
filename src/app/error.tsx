"use client";
import { Flower2 } from "lucide-react";
import { useWorld } from "@/lib/world";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useWorld();
  return (
    <main className="error-page">
      <Flower2 size={40} />
      <h1>{t.errorTitle}</h1>
      <p>{t.errorBody}</p>
      <button className="primary-button" onClick={reset}>
        {t.retry}
      </button>
    </main>
  );
}
