"use client";
import { useState } from "react";
import {
  ArrowRight,
  CloudSun,
  Feather,
  Sprout,
  Sun,
  Sparkles,
} from "lucide-react";
import { isStrings, useStored, useWorld } from "@/lib/world";
import { Chapter, CopyButton, FavoriteButton, Reveal } from "./ui";
const icons = [Feather, CloudSun, Sprout, Sun];
const EMPTY: string[] = [];
export default function Encouragement() {
  const { t } = useWorld();
  const text = t.encouragement;
  const [selected, setSelected] = useState(0);
  const [affirmation, setAffirmation] = useState(0);
  const [steps, setSteps] = useStored("encouragement-steps", EMPTY, isStrings);
  const message = text.moods[selected];
  const done = text.steps.filter((_, i) => steps.includes(String(i))).length;
  return (
    <Reveal id="encouragement" className="section encouragement-section">
      <div className="section-heading split-heading">
        <div>
          <Chapter number={4} />
          <h2>{text.title}</h2>
        </div>
        <p>{text.description}</p>
      </div>
      <div className="encouragement-layout">
        <div className="encouragement-choices">
          <span className="eyebrow">{text.eyebrow}</span>
          <h3>{text.choose}</h3>
          <div role="group" aria-label={text.choose}>
            {text.moods.map((item, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={i}
                  className={selected === i ? "selected" : ""}
                  aria-pressed={selected === i}
                  aria-controls="encouragement-message"
                  onClick={() => setSelected(i)}
                >
                  <Icon size={19} strokeWidth={1.4} />
                  <span>{item.label}</span>
                  <ArrowRight size={16} />
                </button>
              );
            })}
          </div>
          <div className="encouragement-botanical" aria-hidden="true">
            <Sun size={78} strokeWidth={0.7} />
            <Sprout size={100} strokeWidth={0.8} />
          </div>
        </div>
        <article
          id="encouragement-message"
          className="encouragement-letter"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="encouragement-number" aria-hidden="true">
            0{selected + 1} / 04
          </span>
          <Sparkles
            className="encouragement-spark"
            size={26}
            strokeWidth={1}
            aria-hidden="true"
          />
          <h3>{message.title}</h3>
          <p>{message.body}</p>
          <div className="encouragement-step">
            <span className="eyebrow">{text.stepLabel}</span>
            <p>{message.step}</p>
          </div>
          <div className="encouragement-signature">
            <span className="handwritten">{text.signature}</span>
            <div>
              <CopyButton
                text={`${message.title}\n\n${message.body}\n\n${message.step}`}
              />
              <FavoriteButton id={`encouragement-${selected}`} />
            </div>
          </div>
        </article>
      </div>
      <div className="encouragement-affirmation">
        <span className="eyebrow">{text.affirmationLabel}</span>
        <p aria-live="polite">“{text.affirmations[affirmation]}”</p>
        <div>
          <button
            className="text-link"
            onClick={() =>
              setAffirmation((i) => (i + 1) % text.affirmations.length)
            }
          >
            {text.another}
            <ArrowRight size={16} />
          </button>
          <CopyButton text={text.affirmations[affirmation]} />
          <FavoriteButton id={`affirmation-${affirmation}`} />
        </div>
      </div>
      <div className="encouragement-kindness">
        <div>
          <Sprout size={24} strokeWidth={1.3} aria-hidden="true" />
          <h3>{text.stepsTitle}</h3>
          <p>{text.stepsDescription}</p>
        </div>
        <div className="kindness-checklist">
          {text.steps.map((step, i) => (
            <label key={i}>
              <input
                type="checkbox"
                checked={steps.includes(String(i))}
                onChange={() =>
                  setSteps((current) =>
                    current.includes(String(i))
                      ? current.filter((v) => v !== String(i))
                      : [...current, String(i)],
                  )
                }
              />
              <span>{step}</span>
            </label>
          ))}
          <p role="status">
            {done === text.steps.length
              ? text.complete
              : text.progress
                  .replace("{count}", String(done))
                  .replace("{total}", String(text.steps.length))}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
