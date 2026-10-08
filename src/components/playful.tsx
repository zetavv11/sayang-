"use client";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Sparkles,
  Sun,
  Cloud,
  Moon,
  ArrowRight,
  Flower2,
} from "lucide-react";
import { randomIndex, useWorld } from "@/lib/world";
import { BotanicalFlower } from "./garden";
import { Chapter, CopyButton, Reveal } from "./ui";
export function Playful({ onRain }: { onRain: () => void }) {
  const { t, toast, chime } = useWorld();
  const [compliment, setCompliment] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [poem, setPoem] = useState<number | null>(null);
  const [meter, setMeter] = useState(50);
  const [holding, setHolding] = useState(false);
  const [hugged, setHugged] = useState(false);
  const [bloom, setBloom] = useState(0);
  const [day, setDay] = useState(0);
  const [feeling, setFeeling] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hugged) return;
    const completion = setTimeout(() => setHugged(false), 4000);
    return () => clearTimeout(completion);
  }, [hugged]);
  useEffect(() => {
    const update = () => {
      const date = new Date();
      setDay(
        Math.floor(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
            86400000,
        ) % 7,
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const hold = () => {
    if (timer.current) return;
    setHolding(true);
    setHugged(false);
    timer.current = setTimeout(() => {
      setHugged(true);
      setHolding(false);
      timer.current = null;
      chime();
    }, 1800);
  };
  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  return (
    <Reveal id="little-joys" className="section playful-section">
      <div className="section-heading centered">
        <Chapter number={7} />
        <h2>{t.playTitle}</h2>
        <p>{t.playDescription}</p>
      </div>
      <div className="play-grid">
        <div className="play-card compliment-card">
          <Sparkles size={23} />
          <span className="eyebrow">{t.complimentTitle}</span>
          <h3 key={compliment}>{t.compliments[compliment]}</h3>
          <button
            className="text-link"
            onClick={() => {
              setCompliment((v) => randomIndex(t.compliments.length, v));
              chime();
            }}
          >
            {t.complimentButton}
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="play-card quiz-card">
          <span className="eyebrow">01 / ♡</span>
          <h3>{t.quiz}</h3>
          <div className="quiz-options">
            {t.quizOptions.map((label, i) => (
              <button
                aria-pressed={answer === i}
                className={answer === i ? "selected" : ""}
                key={i}
                onClick={() => setAnswer(i)}
              >
                <span>{"ABCD"[i]}</span>
                {label}
              </button>
            ))}
          </div>
          {answer !== null && (
            <p className="interaction-result" role="status">
              {answer === 3 ? t.quizCorrect : t.quizRetry}
            </p>
          )}
        </div>
        <div className="play-card hug-card">
          <button
            className={"hug-heart " + (holding ? "holding" : "")}
            aria-label={t.hug}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              hold();
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onBlur={release}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                hold();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                release();
              }
            }}
          >
            <Heart size={48} strokeWidth={1.2} />
          </button>
          <h3>{t.hug}</h3>
          <p aria-live="polite">
            {hugged ? t.hugDone : holding ? t.hugHolding : t.hugHint}
          </p>
        </div>
        <div className="play-card meter-card">
          <Heart size={23} />
          <h3>{t.meter}</h3>
          <strong className="meter-value">
            {meter === 101 ? "∞" : `${meter}%`}
          </strong>
          <input
            aria-label={t.meter}
            type="range"
            min="0"
            max="101"
            value={meter}
            onChange={(e) => setMeter(Number(e.target.value))}
          />
          <div className="meter-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
            <span>∞</span>
          </div>
          {meter === 101 && <p role="status">{t.meterEnd}</p>}
        </div>
      </div>
      <div className="if-section">
        <h3>{t.ifTitle}</h3>
        <div className="if-options">
          {t.ifItems.map((item, i) => (
            <button
              key={i}
              aria-pressed={poem === i}
              className={poem === i ? "selected" : ""}
              onClick={() => setPoem(i)}
            >
              {item}
              <span>↗</span>
            </button>
          ))}
        </div>
        {poem !== null && (
          <p className="poem" key={poem}>
            {t.ifAnswers[poem]}
          </p>
        )}
      </div>
      <div className="care-row">
        <div className="daily-message">
          <span className="eyebrow">
            <Sun size={15} />
            {t.daily}
          </span>
          <h3>{t.dailyMessages[day]}</h3>
          <CopyButton text={t.dailyMessages[day]} />
        </div>
        <div className="feelings">
          <h3>{t.feeling}</h3>
          <div className="feeling-buttons">
            {t.feelings.map((label, i) => (
              <button
                className={feeling === i ? "selected" : ""}
                key={i}
                aria-pressed={feeling === i}
                onClick={() => setFeeling(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <p aria-live="polite">
            {feeling !== null ? t.feelingReplies[feeling] : ""}
          </p>
          <button className="text-link" onClick={() => toast(t.hereReply)}>
            {t.here}
            <Heart size={14} />
          </button>
        </div>
      </div>
      <div className="bloom-row">
        <div className="bloom-game">
          <BotanicalFlower bloom={0.15 + bloom * 0.28} />
          <div>
            <h3>{t.bloomTitle}</h3>
            <p aria-live="polite">{t.bloomSteps[Math.min(bloom, 3)]}</p>
            <button
              className="outline-button"
              onClick={() => {
                setBloom((v) => (v >= 3 ? 0 : v + 1));
                chime();
              }}
            >
              {t.bloom}
              <Flower2 size={16} />
            </button>
          </div>
        </div>
        <div className="forecast">
          <span className="eyebrow">{t.forecast}</span>
          {t.forecastItems.map((item, i) => {
            const Icon = [Sun, Cloud, Moon][i];
            return (
              <p key={i}>
                <Icon size={16} />
                {item}
              </p>
            );
          })}
          <button className="text-link" onClick={onRain}>
            {t.rain}
            <Sparkles size={15} />
          </button>
        </div>
      </div>
      {(holding || hugged) && (
        <div
          className={"hug-light " + (hugged ? "hug-complete" : "")}
          aria-hidden="true"
        />
      )}
    </Reveal>
  );
}
