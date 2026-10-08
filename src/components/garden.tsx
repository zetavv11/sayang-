"use client";
import { useRef, useState, type CSSProperties } from "react";
import { useWorld } from "@/lib/world";
import { love } from "@/config/love";
export function BotanicalFlower({
  className = "",
  bloom = 1,
}: {
  className?: string;
  bloom?: number;
}) {
  return (
    <div
      className={"botanical-flower " + className}
      style={{ "--bloom": bloom } as CSSProperties}
      aria-hidden="true"
    >
      <div className="flower-stem" />
      <i className="flower-leaf leaf-one" />
      <i className="flower-leaf leaf-two" />
      <div className="flower-head">
        {Array.from({ length: 12 }, (_, i) => (
          <i
            className="flower-petal"
            key={i}
            style={{ "--i": i, "--angle": `${i * 30}deg` } as CSSProperties}
          />
        ))}
        <span className="flower-center" />
      </div>
    </div>
  );
}
export function FloatingPetals({ rain = false }: { rain?: boolean }) {
  return (
    <div
      className={"particles " + (rain ? "heart-rain" : "")}
      aria-hidden="true"
    >
      {Array.from({ length: rain ? 24 : 12 }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${(i * 29 + 5) % 100}%`,
              animationDelay: `${-i * 1.7}s`,
              animationDuration: `${12 + (i % 5) * 3}s`,
              "--drift": `${i % 2 ? 80 : -80}px`,
            } as CSSProperties
          }
        >
          {rain && i % 3 === 0 ? "♡" : ""}
        </i>
      ))}
    </div>
  );
}
export function FlowerGarden({
  onSecret,
  immersive = false,
}: {
  onSecret: () => void;
  immersive?: boolean;
}) {
  const { t, toast, chime } = useWorld();
  const clicks = useRef(0);
  const [lights, setLights] = useState(0);
  const [landed, setLanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={"interactive-garden " + (immersive ? "immersive-garden" : "")}
      onPointerMove={(e) => {
        if (
          e.pointerType === "mouse" &&
          ref.current &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          const rect = ref.current.getBoundingClientRect();
          ref.current.style.setProperty(
            "--garden-x",
            `${((e.clientX - rect.left) / rect.width - 0.5) * 10}px`,
          );
        }
      }}
    >
      <div className="garden-moon" />
      <div className="garden-flowers">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            aria-label={`${t.flowerLabel} ${i + 1}`}
            title={love.FAVORITE_FLOWER}
            className={"flower-target flower-target-" + i}
            onClick={() => {
              chime();
              if (i === 2 && ++clicks.current % 3 === 0) onSecret();
              else toast(t.flowerMessages[i]);
            }}
            onDoubleClick={() => toast(t.doubleFlower)}
          >
            <BotanicalFlower />
          </button>
        ))}
      </div>
      <button
        className={"butterfly " + (landed ? "landed" : "")}
        aria-label={t.butterflyLabel}
        onClick={() => {
          setLanded((v) => !v);
          toast(t.butterfly);
          chime();
        }}
      >
        <span />
        <span />
      </button>
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          className={"firefly " + (lights > i ? "gathered" : "")}
          style={
            {
              "--left": `${15 + i * 17}%`,
              "--top": `${20 + ((i * 13) % 55)}%`,
              "--delay": `${i * 0.8}s`,
            } as CSSProperties
          }
          aria-label={`${t.fireflyLabel} ${i + 1}`}
          onClick={() => {
            const next = lights + 1;
            setLights(next);
            chime();
            if (next >= 5) {
              toast(t.firefly);
              setLights(0);
            }
          }}
        />
      ))}
      <FloatingPetals />
    </div>
  );
}
