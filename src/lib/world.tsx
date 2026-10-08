"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import en from "@/i18n/en.json";
import id from "@/i18n/id.json";
import { love } from "@/config/love";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
export type Dictionary = typeof en;
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
export function useStored<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem("little-world:" + key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const value = useMemo(() => {
    try {
      const data: unknown = JSON.parse(raw || "null");
      return validate(data) ? data : fallback;
    } catch {
      return fallback;
    }
  }, [raw, fallback, validate]);
  const set = useCallback(
    (next: T | ((current: T) => T)) => {
      try {
        const previous: unknown = JSON.parse(
          localStorage.getItem("little-world:" + key) || "null",
        );
        const current = validate(previous) ? previous : fallback;
        localStorage.setItem(
          "little-world:" + key,
          JSON.stringify(
            typeof next === "function" ? (next as (v: T) => T)(current) : next,
          ),
        );
        listeners.forEach((fn) => fn());
        return true;
      } catch {
        window.dispatchEvent(new Event("world-storage-error"));
        return false;
      }
    },
    [key, fallback, validate],
  );
  return [value, set] as const;
}
export const isStrings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
const isLanguage = (v: unknown): v is "en" | "id" => v === "en" || v === "id";
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const EMPTY: string[] = [];
type WorldContext = {
  t: Dictionary;
  lang: "en" | "id";
  setLang: (lang: "en" | "id") => void;
  night: boolean;
  toggleNight: () => void;
  favorites: string[];
  favorite: (key: string) => void;
  toast: (text: string) => void;
  copy: (text: string) => Promise<void>;
  sound: boolean;
  toggleSound: () => void;
  chime: () => void;
};
const Context = createContext<WorldContext | null>(null);
export function WorldProvider({ children }: { children: ReactNode }) {
  const [lang, storeLang] = useStored(
    "language",
    love.DEFAULT_LANGUAGE,
    isLanguage,
  );
  const [night, storeNight] = useStored("night", false, isBool);
  const [favorites, storeFavorites] = useStored("favorites", EMPTY, isStrings);
  const [notice, setNotice] = useState("");
  const [sound, setSound] = useState(false);
  const [changing, setChanging] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const languageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useMemo(() => {
    const base: Dictionary = { ...en, ...(lang === "id" ? id : {}) };
    const overrides = love.CONTENT[lang];
    for (const key of Object.keys(overrides) as (keyof typeof overrides)[]) {
      const value = overrides[key];
      if (typeof value === "string" && value)
        Object.assign(base, { [key]: value });
      else if (Array.isArray(value) && value.length)
        Object.assign(base, {
          [key]: (base[key] as string[]).map((v, i) => value[i] || v),
        });
    }
    return base;
  }, [lang]);
  const toast = useCallback((text: string) => setNotice(text), []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = night ? "night" : "day";
  }, [lang, night]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const onError = () => toast(t.storageError);
    window.addEventListener("world-storage-error", onError);
    return () => window.removeEventListener("world-storage-error", onError);
  }, [t, toast]);
  useEffect(
    () => () => {
      if (languageTimer.current) clearTimeout(languageTimer.current);
      void audio.current?.close();
    },
    [],
  );
  const chime = useCallback(() => {
    if (!sound || !audio.current) return;
    const ctx = audio.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 523.25;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }, [sound]);
  const toggleSound = () => {
    try {
      if (!audio.current) audio.current = new AudioContext();
      void audio.current.resume();
      setSound((v) => !v);
    } catch {
      toast(t.errorBody);
    }
  };
  const setLang = (next: "en" | "id") => {
    if (next === lang) return;
    setChanging(true);
    if (languageTimer.current) clearTimeout(languageTimer.current);
    languageTimer.current = setTimeout(() => {
      storeLang(next);
      setChanging(false);
    }, 180);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t.copied);
    } catch {
      toast(t.copyFailed);
    }
  };
  return (
    <Context.Provider
      value={{
        t,
        lang,
        setLang,
        night,
        toggleNight: () => storeNight((v) => !v),
        favorites,
        favorite: (key) => {
          storeFavorites((v) =>
            v.includes(key) ? v.filter((x) => x !== key) : [...v, key],
          );
          chime();
        },
        toast,
        copy,
        sound,
        toggleSound,
        chime,
      }}
    >
      <MotionConfig reducedMotion="user">
        <div
          className={
            changing ? "language-world language-changing" : "language-world"
          }
        >
          {children}
        </div>
        <AnimatePresence>
          {changing && (
            <motion.span
              className="language-sparkle"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              ✧
            </motion.span>
          )}
        </AnimatePresence>
        {notice &&
          createPortal(
            <motion.div
              key={notice}
              role="status"
              className="toast"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {notice}
            </motion.div>,
            document.querySelector("dialog[open] .dialog-inner") ??
              document.body,
          )}
      </MotionConfig>
    </Context.Provider>
  );
}
export function useWorld() {
  const context = useContext(Context);
  if (!context) throw new Error("WorldProvider required");
  return context;
}
export function randomIndex(length: number, current = -1) {
  if (length < 2) return 0;
  const next = Math.floor(Math.random() * (length - 1));
  return current < 0
    ? Math.floor(Math.random() * length)
    : next >= current
      ? next + 1
      : next;
}
