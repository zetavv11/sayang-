"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flower2 } from "lucide-react";
import { useWorld } from "@/lib/world";
import { love } from "@/config/love";
import { BotanicalFlower, FloatingPetals, FlowerGarden } from "./garden";
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const motionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotionSnapshot = () => false;
export default function Opening({ onEnter }: { onEnter: () => void }) {
  const { t } = useWorld();
  const reduced = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotionSnapshot,
  );
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );
  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    exitTimer.current = setTimeout(onEnter, reduced ? 0 : 650);
  };
  useEffect(() => {
    if (reduced) return;
    const timers = [2800, 5100, 7500, 9300].map((time, i) =>
      setTimeout(() => setStep(i + 1), time),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduced]);
  const current = reduced ? 4 : step;
  return (
    <motion.div
      className={"opening " + (leaving ? "opening-leaving" : "")}
      exit={{ opacity: 0, filter: "blur(12px)", scale: 1.03 }}
      transition={{ duration: 0.9 }}
    >
      <div className="opening-glow" />
      <FloatingPetals />
      {current >= 2 && (
        <motion.div
          className="opening-garden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          inert
        >
          <FlowerGarden onSecret={() => {}} />
        </motion.div>
      )}
      <div className="opening-top">
        <Flower2 size={24} />
        <span>{t.brandSub}</span>
      </div>
      <div className={"opening-flower " + (current > 0 ? "bloomed" : "")}>
        <BotanicalFlower />
      </div>
      <div className="opening-message" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6 }}
          >
            {current < 4 ? (
              <h1>{current === 0 ? "✧" : t.opening[current - 1]}</h1>
            ) : (
              <>
                <span className="eyebrow">
                  {t.opening[3].replace("{name}", love.HER_NAME)}
                </span>
                <h1>{t.opening[4]}</h1>
                <button className="primary-button" onClick={enter}>
                  {t.opening[5]}
                  <ArrowRight size={17} />
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <button className="opening-skip" onClick={enter}>
        {t.skip}
        <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}
