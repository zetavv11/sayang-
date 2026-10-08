"use client";
import { useState } from "react";
import { ArrowRight, Heart, Mail, Shuffle, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { love } from "@/config/love";
import { randomIndex, useWorld } from "@/lib/world";
import { Chapter, CopyButton, FavoriteButton, Modal, Reveal } from "./ui";
export function LoveLetters() {
  const { t, chime } = useWorld();
  const [selected, setSelected] = useState<number | null>(null);
  const text =
    selected === -1
      ? t.mainLetter.replace("{author}", love.YOUR_NAME)
      : selected !== null
        ? t.letterBodies[selected]
        : "";
  return (
    <Reveal id="letters" className="section letters-section">
      <div className="letter-intro">
        <Chapter number={5} />
        <h2>{t.lettersTitle}</h2>
        <p>{t.lettersDescription}</p>
        <button
          className="envelope"
          aria-label={t.envelope}
          onClick={() => {
            setSelected(-1);
            chime();
          }}
        >
          <span className="envelope-paper">
            {t.letterTo}
            <span>{love.HER_NAME}</span>
          </span>
          <span className="envelope-flap" />
          <span className="wax-seal">
            <Heart size={25} strokeWidth={1} />
          </span>
          <span className="envelope-caption">
            {t.envelope}
            <ArrowRight size={14} />
          </span>
        </button>
      </div>
      <div className="open-when">
        <h3>{t.openWhen}</h3>
        <div>
          {t.letterTitles.map((title, i) => (
            <button
              key={i}
              className="letter-row"
              onClick={() => {
                setSelected(i);
                chime();
              }}
            >
              <span className="letter-row-icon">
                <Mail size={19} strokeWidth={1.2} />
              </span>
              <span>{title}</span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      </div>
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected === -1 ? t.envelope : t.letterTitles[selected || 0]}
        className="letter-modal"
      >
        <div className="letter-paper">
          <span className="eyebrow">{t.letterTo}</span>
          <Heart className="letter-heart" size={25} />
          <h3>
            {selected !== null && selected >= 0
              ? t.letterTitles[selected]
              : love.HER_NAME}
          </h3>
          <p className="letter-writing" key={selected}>
            {text}
          </p>
          <div className="letter-tools">
            <CopyButton text={text} />
            <FavoriteButton id={`letter-${selected}`} />
          </div>
        </div>
      </Modal>
    </Reveal>
  );
}
export function ReasonCards() {
  const { t } = useWorld();
  const [index, setIndex] = useState(0);
  const [all, setAll] = useState(false);
  return (
    <Reveal id="reasons" className="section reasons-section">
      <Chapter number={6} />
      <h2>{t.reasonsTitle}</h2>
      <div className="reason-stage">
        <span className="sr-only">{index + 1} / 100</span>
        <span className="reason-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <span className="reason-flower">✧</span>
            <p>{t.reasons[index]}</p>
            {index === 99 && <p className="handwritten">{t.reasonEnd}</p>}
          </motion.div>
        </AnimatePresence>
        <FavoriteButton id={`reason-${index}`} />
      </div>
      <div className="center-actions">
        <button
          className="primary-button"
          onClick={() => setIndex((v) => (v + 1) % 100)}
        >
          {t.reasonNext}
          <ArrowRight size={16} />
        </button>
        <button
          className="outline-button"
          onClick={() => setIndex((v) => randomIndex(100, v))}
        >
          <Shuffle size={15} />
          {t.reasonRandom}
        </button>
      </div>
      <button
        className="text-link all-reasons"
        aria-expanded={all}
        onClick={() => setAll((v) => !v)}
      >
        {t.reasonAll}
        <ChevronDown size={15} />
      </button>
      {all && (
        <div className="all-reasons-list">
          {t.reasons.map((reason, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={i}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <p>{reason}</p>
              <FavoriteButton id={`reason-${i}`} />
            </motion.div>
          ))}
          <h3>{t.reasonEnd}</h3>
        </div>
      )}
    </Reveal>
  );
}
export function QuoteMoment() {
  const { t } = useWorld();
  const [index, setIndex] = useState(0);
  return (
    <Reveal className="quote-moment">
      <span className="quote-star">✳</span>
      <blockquote key={index}>{t.quotes[index]}</blockquote>
      <div className="center-actions">
        <button
          className="text-link"
          onClick={() => setIndex((v) => randomIndex(t.quotes.length, v))}
        >
          {t.quoteButton}
          <ArrowRight size={14} />
        </button>
        <FavoriteButton id={`quote-${index}`} />
        <CopyButton text={t.quotes[index]} />
      </div>
    </Reveal>
  );
}
