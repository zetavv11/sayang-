"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Camera, Heart, Music2 } from "lucide-react";
import { love, songs } from "@/config/love";
import { randomIndex, useStored, useWorld } from "@/lib/world";
import { Chapter, CopyButton, FavoriteButton, Modal, Reveal } from "./ui";
export function LoveCounter() {
  const { t } = useWorld();
  const [elapsed, setElapsed] = useState<number | null>(null);
  useEffect(() => {
    const tick = () =>
      setElapsed(
        Math.max(
          0,
          Math.floor(
            (Date.now() -
              new Date(love.RELATIONSHIP_START_DATE + "T00:00:00").getTime()) /
              1000,
          ),
        ),
      );
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const values =
    elapsed === null
      ? ["—", "—", "—", "—"]
      : [
          Math.floor(elapsed / 86400),
          Math.floor(elapsed / 3600) % 24,
          Math.floor(elapsed / 60) % 60,
          elapsed % 60,
        ];
  return (
    <div className="love-counter">
      <div className="counter-copy">
        <Heart size={18} />
        <p>{t.counterTitle}</p>
      </div>
      <div className="counter-digits">
        {values.map((value, i) => (
          <div key={i}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{t.timeUnits[i]}</span>
          </div>
        ))}
      </div>
      <p className="handwritten">{t.counterEnd}</p>
    </div>
  );
}
export function Timeline() {
  const { t } = useWorld();
  const [selected, setSelected] = useState(0);
  return (
    <Reveal id="story" className="section story-section">
      <Chapter number={3} />
      <div className="section-heading">
        <h2>{t.storyTitle}</h2>
        <p>{t.storyDescription}</p>
      </div>
      <div className="timeline-layout">
        <div className="timeline-nav" role="tablist" aria-label={t.storyTitle}>
          {t.storyTitles.map((title, i) => (
            <button
              key={i}
              id={`story-tab-${i}`}
              aria-controls="story-panel"
              role="tab"
              aria-selected={selected === i}
              tabIndex={selected === i ? 0 : -1}
              className={selected === i ? "active" : ""}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => {
                if (
                  [
                    "ArrowDown",
                    "ArrowUp",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 6
                        : (i +
                            (["ArrowDown", "ArrowRight"].includes(e.key)
                              ? 1
                              : 6)) %
                          7;
                  setSelected(next);
                  document.getElementById(`story-tab-${next}`)?.focus();
                }
              }}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{title}</span>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
        <div className="story-photo">
          <Image
            src={love.PHOTOS[selected % love.PHOTOS.length]}
            alt={t.memoryAlt[selected % 4]}
            fill
            sizes="(max-width: 700px) 90vw, 35vw"
          />
          <span className="photo-tape" />
        </div>
        <div
          className="story-detail"
          id="story-panel"
          role="tabpanel"
          aria-labelledby={`story-tab-${selected}`}
          key={selected}
        >
          <span className="eyebrow">{t.storyDates[selected]}</span>
          <h3>{t.storyTitles[selected]}</h3>
          <p>{t.storyBodies[selected]}</p>
          <a
            href={
              "https://open.spotify.com/search/" +
              encodeURIComponent(
                songs[selected].title + " " + songs[selected].artist,
              )
            }
            target="_blank"
            rel="noopener noreferrer"
            className="story-song"
          >
            <Music2 size={15} />
            {songs[selected].title}
          </a>
          <div className="story-arrows">
            <button
              aria-label={t.storyTitles[(selected + 6) % 7]}
              className="icon-button"
              onClick={() => setSelected((v) => (v + 6) % 7)}
            >
              <ArrowLeft size={18} />
            </button>
            <span>{String(selected + 1).padStart(2, "0")} / 07</span>
            <button
              aria-label={t.storyTitles[(selected + 1) % 7]}
              className="icon-button"
              onClick={() => setSelected((v) => (v + 1) % 7)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
const isCount = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 20;
export function MemoryGallery() {
  const { t, favorite, toast, chime } = useWorld();
  const [selected, setSelected] = useState<number | null>(null);
  const [photos, setPhotos] = useStored("camera", 0, isCount);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(false), 550);
    return () => clearTimeout(timer);
  }, [flash]);
  return (
    <>
      <Reveal id="memories" className="section memories-section">
        <div className="section-heading split-heading">
          <div>
            <Chapter number={4} />
            <h2>{t.memoriesTitle}</h2>
          </div>
          <div>
            <p>{t.memoriesDescription}</p>
            <button
              className="text-link"
              onClick={() => setSelected(randomIndex(love.PHOTOS.length))}
            >
              {t.timeMachine}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="polaroid-grid">
          {love.PHOTOS.map((src, i) => (
            <div className="polaroid" key={src}>
              <button
                className="polaroid-image"
                onClick={() => setSelected(i)}
                onDoubleClick={() => {
                  favorite(`memory-${i}`);
                  toast("♡");
                }}
              >
                <Image
                  src={src}
                  alt={t.memoryAlt[i % 4]}
                  fill
                  sizes="(max-width: 700px) 70vw, 25vw"
                />
              </button>
              <div className="polaroid-caption">
                <span>{t.memoryCaptions[i % 4]}</span>
                <FavoriteButton id={`memory-${i}`} />
              </div>
              <span className="polaroid-number">
                {String(i + 1).padStart(2, "0")} / {t.brand}
              </span>
            </div>
          ))}
        </div>
        <div className="camera-row">
          <Camera size={21} />
          <p className="handwritten">{t.cameraCaption}</p>
          <button
            className="outline-button"
            onClick={() => {
              setPhotos((v) => Math.min(v + 1, 20));
              setFlash(true);
              chime();
            }}
          >
            {t.camera}
            <span>+</span>
          </button>
        </div>
        {photos > 0 && (
          <div className="camera-memories">
            {Array.from({ length: photos }, (_, i) => (
              <div className="captured-memory" key={i}>
                <Heart size={28} />
                <p>{t.cameraEmpty}</p>
                <span>
                  {t.cameraCaption} {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Reveal>
      <div className="memory-film">
        <div className="film-track">
          {[...love.PHOTOS, ...love.PHOTOS].map((src, i) => (
            <div key={i}>
              <Image
                src={src}
                alt={i < love.PHOTOS.length ? t.memoryAlt[i % 4] : ""}
                fill
                sizes="300px"
              />
            </div>
          ))}
        </div>
        <h3>{t.filmTitle}</h3>
      </div>
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={t.memoriesTitle}
        className="memory-modal"
      >
        {selected !== null && (
          <>
            <div
              className="memory-large"
              onDoubleClick={() => {
                favorite(`memory-${selected}`);
                toast("♡");
              }}
            >
              <Image
                src={love.PHOTOS[selected]}
                alt={t.memoryAlt[selected % 4]}
                fill
                sizes="90vw"
              />
            </div>
            <div className="memory-modal-caption">
              <div>
                <h3>{t.memoryCaptions[selected % 4]}</h3>
                <p>{t.memoryStories[selected % 4]}</p>
              </div>
              <FavoriteButton id={`memory-${selected}`} />
              <CopyButton text={t.memoryStories[selected % 4]} />
            </div>
          </>
        )}
      </Modal>
      {flash && <div className="camera-flash" aria-hidden="true" />}
    </>
  );
}
