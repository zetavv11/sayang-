"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CalendarHeart,
  Send,
  Shuffle,
  Trash2,
  LockKeyhole,
} from "lucide-react";
import { isStrings, randomIndex, useStored, useWorld } from "@/lib/world";
import { love, safeUrl, songs } from "@/config/love";
import { Chapter, Modal, Reveal } from "./ui";
const EMPTY: string[] = [];
type Capsule = { id: string; title: string; message: string; date: string };
const EMPTY_CAPSULES: Capsule[] = [];
const isCapsules = (value: unknown): value is Capsule[] =>
  Array.isArray(value) &&
  value.every(
    (v) =>
      v &&
      typeof v === "object" &&
      ["id", "title", "message", "date"].every((k) => typeof v[k] === "string"),
  );
export default function Future() {
  const { t, toast } = useWorld();
  const [checked, setChecked] = useStored("future", EMPTY, isStrings);
  const [capsules, setCapsules] = useStored(
    "capsules",
    EMPTY_CAPSULES,
    isCapsules,
  );
  const [date, setDate] = useState<number | null>(null);
  const [opened, setOpened] = useState<Capsule | null>(null);
  return (
    <>
      <Reveal id="future" className="section future-section">
        <div className="section-heading split-heading">
          <div>
            <Chapter number={8} />
            <h2>{t.futureTitle}</h2>
          </div>
          <p>{t.futureDescription}</p>
        </div>
        <div className="future-layout">
          <div className="future-checklist">
            <div className="checklist-heading">
              <span className="eyebrow">{t.forever}</span>
              <span>{checked.filter((v) => /^\d$/.test(v)).length} / ∞</span>
            </div>
            {t.futureItems.map((item, i) => (
              <label
                className={checked.includes(String(i)) ? "checked" : ""}
                key={i}
              >
                <input
                  type="checkbox"
                  checked={checked.includes(String(i))}
                  onChange={() =>
                    setChecked((v) =>
                      v.includes(String(i))
                        ? v.filter((x) => x !== String(i))
                        : [...v, String(i)],
                    )
                  }
                />
                <span className="custom-check">
                  {checked.includes(String(i)) && <Check size={13} />}
                </span>
                <span>{item}</span>
              </label>
            ))}
            <button className="text-link" onClick={() => toast(t.futureReply)}>
              {t.futureButton}
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="date-generator">
            <CalendarHeart size={29} strokeWidth={1.2} />
            <h3>{t.dateTitle}</h3>
            {date === null ? (
              <p className="date-empty">{t.futureReply}</p>
            ) : (
              <dl key={date}>
                {[
                  t.dateActivities[date],
                  t.dateFoods[(date + 2) % 5],
                  songs[date * 2].title,
                  t.dateVibes[date],
                  t.dateClothes[date],
                ].map((item, i) => (
                  <div key={i}>
                    <dt>{t.dateLabels[i]}</dt>
                    <dd>{item}</dd>
                  </div>
                ))}
              </dl>
            )}
            <button
              className="primary-button"
              onClick={() => setDate((v) => randomIndex(5, v ?? -1))}
            >
              {t.dateButton}
              <Shuffle size={15} />
            </button>
          </div>
        </div>
        <div className="capsule">
          <div>
            <span className="eyebrow">{t.brandSub}</span>
            <h3>{t.capsuleTitle}</h3>
            <p>{t.capsuleDescription}</p>
            <button
              className="text-link"
              onClick={() => {
                if (!capsules.length) toast(t.capsuleEmpty);
                else setOpened(capsules[randomIndex(capsules.length)]);
              }}
            >
              {t.capsuleOpen}
              <ArrowRight size={15} />
            </button>
            <span className="capsule-count">
              {capsules.length.toString().padStart(2, "0")} ♡
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const title = String(data.get("title") || "").trim();
              const message = String(data.get("message") || "").trim();
              if (!title || !message) return;
              const entry = {
                id: crypto.randomUUID(),
                title,
                message,
                date: String(data.get("date") || ""),
              };
              if (setCapsules((v) => [...v, entry])) {
                toast(t.saved);
                e.currentTarget.reset();
              }
            }}
          >
            <label>
              <span>{t.capsuleMemory}</span>
              <input
                required
                maxLength={100}
                name="title"
                placeholder={t.capsuleMemory}
              />
            </label>
            <label>
              <span>{t.capsuleMessage}</span>
              <textarea
                required
                maxLength={4000}
                name="message"
                rows={3}
                placeholder={t.capsuleMessage}
              />
            </label>
            <label>
              <span>{t.capsuleDate}</span>
              <input required name="date" type="date" />
            </label>
            <button className="outline-button" type="submit">
              {t.capsuleSave}
              <Send size={15} />
            </button>
          </form>
        </div>
        <Modal
          open={opened !== null}
          onClose={() => setOpened(null)}
          title={t.capsuleTitle}
        >
          <div className="letter-paper">
            <span className="eyebrow">{opened?.date}</span>
            <h3>{opened?.title}</h3>
            <p className="letter-writing">{opened?.message}</p>
            <button
              className="text-link"
              onClick={() => {
                if (setCapsules((v) => v.filter((x) => x.id !== opened?.id)))
                  setOpened(null);
              }}
            >
              <Trash2 size={15} />
              {t.capsuleDelete}
            </button>
          </div>
        </Modal>
      </Reveal>
      <Reveal id="part-two" className="part-two">
        <LockKeyhole size={27} strokeWidth={1} />
        <span className="eyebrow">{t.chapter} II</span>
        <h2>{t.partTitle}</h2>
        <p>{t.partDescription}</p>
        {safeUrl(love.PART_2_URL) ? (
          <a
            className="outline-button"
            href={safeUrl(love.PART_2_URL)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.partButton}
            <ArrowRight size={15} />
          </a>
        ) : (
          <button className="outline-button" onClick={() => toast(t.partEmpty)}>
            {t.partButton}
            <ArrowRight size={15} />
          </button>
        )}
        <span className="handwritten">{t.continued}</span>
      </Reveal>
    </>
  );
}
