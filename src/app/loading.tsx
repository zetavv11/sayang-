"use client";
import { useWorld } from "@/lib/world";
import { BotanicalFlower } from "@/components/garden";
export default function Loading() {
  const { t } = useWorld();
  return (
    <div className="loading-page" role="status">
      <BotanicalFlower />
      <p>{t.loading}</p>
    </div>
  );
}
