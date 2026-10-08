"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Bookmark, Copy, X, ArrowUpRight } from "lucide-react";
import { useWorld } from "@/lib/world";
export function Reveal({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -25px 0px" }}
      transition={{ duration: 0.7 }}
    >
      {children}
    </motion.section>
  );
}
export function Chapter({
  number,
  children,
}: {
  number: number;
  children?: ReactNode;
}) {
  const { t } = useWorld();
  return (
    <div className="chapter-label">
      <span className="chapter-line" />
      {t.chapter} {String(number).padStart(2, "0")}
      <span> / </span>
      {children || t.chapterNames[number - 1]}
    </div>
  );
}
export function FavoriteButton({ id }: { id: string }) {
  const { t, favorites, favorite } = useWorld();
  const active = favorites.includes(id);
  return (
    <button
      className={"icon-button favorite " + (active ? "is-favorite" : "")}
      aria-label={active ? t.unfavorite : t.favorite}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        favorite(id);
      }}
    >
      <Bookmark size={17} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
export function CopyButton({ text }: { text: string }) {
  const { t, copy } = useWorld();
  return (
    <button
      className="icon-button"
      aria-label={t.copy}
      onClick={() => void copy(text)}
    >
      <Copy size={16} />
    </button>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else dialog.close();
    return () => {
      dialog.close();
      document.body.style.overflow = "";
    };
  }, [open]);
  const { t } = useWorld();
  return (
    <dialog
      ref={ref}
      className={"world-dialog " + className}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <button
          className="icon-button dialog-close"
          aria-label={t.close}
          onClick={onClose}
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className="text-link">
      {children}
      <ArrowUpRight size={16} />
    </a>
  );
}
