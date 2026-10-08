"use client";
import Link from "next/link";
import { Flower2, ArrowRight } from "lucide-react";
import { useWorld } from "@/lib/world";
export default function NotFound() {
  const { t, lang, setLang } = useWorld();
  return (
    <main className="error-page">
      <Flower2 size={40} strokeWidth={1} />
      <span className="eyebrow">404 / {t.brand}</span>
      <h1>{t.notFoundTitle}</h1>
      <p>{t.notFound}</p>
      <Link className="primary-button" href="/">
        {t.backHome}
        <ArrowRight size={16} />
      </Link>
      <button
        className="text-link"
        onClick={() => setLang(lang === "en" ? "id" : "en")}
      >
        ID / EN
      </button>
    </main>
  );
}
