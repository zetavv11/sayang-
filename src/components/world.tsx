"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Flower2,
  Heart,
  Headphones,
  Mail,
  Moon,
  Music2,
  Search,
  Share2,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Ellipsis,
  Camera,
  BookOpen,
  LockKeyhole,
} from "lucide-react";
import { love } from "@/config/love";
import { useStored, useWorld } from "@/lib/world";
import { Chapter, CopyButton, Modal, Reveal } from "./ui";
import { FlowerGarden, FloatingPetals } from "./garden";
import Opening from "./opening";
import MusicPlayer from "./music";
import { LoveCounter, MemoryGallery, Timeline } from "./story";
import { LoveLetters, QuoteMoment, ReasonCards } from "./letters";
const Playful = dynamic(() => import("./playful").then((m) => m.Playful));
const Future = dynamic(() => import("./future"));
const CommandPalette = dynamic(() => import("./command-palette"));
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export default function World() {
  const {
    t,
    lang,
    setLang,
    night,
    toggleNight,
    sound,
    toggleSound,
    toast,
    copy,
    chime,
  } = useWorld();
  const [savedEntered, saveEntered] = useStored("entered", false, isBool);
  const [entryOverride, setEntryOverride] = useState<boolean | null>(null);
  const entered = entryOverride ?? savedEntered;
  const setEntered = (value: boolean) => {
    setEntryOverride(value);
    saveEntered(value);
  };
  const [search, setSearch] = useState(false);
  const [favorites, setFavorites] = useState(false);
  const [more, setMore] = useState(false);
  const [secret, setSecret] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [rain, setRain] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const [finalVisible, setFinalVisible] = useState(false);
  const [event, setEvent] = useState("");
  const [active, setActive] = useState("home");
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(
    null,
  );
  const finalRef = useRef<HTMLElement>(null);
  const ambientScroll = useRef(0);
  useEffect(() => {
    if (!ambient && ambientScroll.current)
      window.scrollTo({ top: ambientScroll.current, behavior: "instant" });
  }, [ambient]);
  const cursor = useRef<HTMLDivElement>(null);
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heartHeld, setHeartHeld] = useState(false);
  const triggerRain = useCallback(() => {
    setRain(true);
    chime();
  }, [chime]);
  useEffect(() => {
    if (!rain) return;
    const timer = setTimeout(() => setRain(false), 7500);
    return () => clearTimeout(timer);
  }, [rain]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const date = new Date();
      const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (love.HER_BIRTHDAY.slice(5) === monthDay) {
        setEvent("birthday");
        setRain(true);
      } else if (love.RELATIONSHIP_START_DATE.slice(5) === monthDay) {
        setEvent("anniversary");
        setRain(true);
      } else if (date.getHours() < 4) setEvent("midnight");
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  useEffect(() => {
    if (!entered) return;
    const node = finalRef.current;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => setFinalVisible(e.isIntersecting)),
      { threshold: 0.16 },
    );
    if (node) observer.observe(node);
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((el) => chapterObserver.observe(el));
    return () => {
      observer.disconnect();
      chapterObserver.disconnect();
    };
  }, [entered, ambient]);
  useEffect(() => {
    if (!entered) return;
    let buffer: string[] = [];
    const konami = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setFavorites(false);
        setSearch((v) => !v);
        return;
      }
      if (e.key === "Escape" && ambient) {
        setAmbient(false);
        return;
      }
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return;
      buffer = [
        ...buffer,
        e.key.length === 1 ? e.key.toLowerCase() : e.key,
      ].slice(-10);
      if (buffer.join("|") === konami.join("|")) {
        triggerRain();
        toast(t.konami);
        buffer = [];
      }
      if (buffer.slice(-4).join("") === "love") {
        toast(t.secretWord);
        triggerRain();
        buffer = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered, ambient, t, toast, triggerRain]);
  useEffect(() => {
    if (
      !entered ||
      !matchMedia("(pointer:fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const move = (e: PointerEvent) => {
      if (cursor.current) {
        cursor.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        cursor.current.style.opacity = "1";
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [entered]);
  useEffect(
    () => () => {
      if (heartTimer.current) clearTimeout(heartTimer.current);
    },
    [],
  );
  const holdHeart = () => {
    if (heartTimer.current) return;
    setHeartHeld(true);
    heartTimer.current = setTimeout(() => {
      toast(t.heartPress);
      setHeartHeld(false);
      heartTimer.current = null;
    }, 1600);
  };
  const releaseHeart = () => {
    if (heartTimer.current) clearTimeout(heartTimer.current);
    heartTimer.current = null;
    setHeartHeld(false);
  };
  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({
          title: t.brand,
          text: t.heroStay,
          url: location.href,
        });
      else await copy(location.href);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        await copy(location.href);
    }
  };
  const navIds = ["home", "story", "music", "memories", "letters"];
  const navIcons = [Heart, BookOpen, Headphones, Camera, Mail];
  return (
    <div
      className={"world " + (event === "birthday" ? "birthday-world" : "")}
      style={{ "--personal-rose": love.FAVORITE_COLOR } as CSSProperties}
    >
      {!entered && (
        <Opening
          onEnter={() => {
            setEntered(true);
            window.scrollTo(0, 0);
            chime();
          }}
        />
      )}
      {entered && (
        <>
          {!ambient && (
            <>
              <header
                className={"navigation " + (finalVisible ? "nav-hidden" : "")}
              >
                <a href="#home" className="brand" aria-label={t.home}>
                  <Flower2 size={28} strokeWidth={1.2} />
                  <span>
                    {t.brand}
                    <small>{t.brandSub}</small>
                  </span>
                  <i>♡</i>
                </a>
                <nav className="desktop-nav" aria-label={t.brand}>
                  {t.nav.map((label, i) => (
                    <a
                      className={active === navIds[i] ? "active" : ""}
                      key={i}
                      href={"#" + navIds[i]}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
                <div className="nav-controls">
                  <div
                    className="language-switch"
                    role="group"
                    aria-label="Language / Bahasa"
                  >
                    <button
                      aria-pressed={lang === "id"}
                      onClick={() => setLang("id")}
                    >
                      ID
                    </button>
                    <span>/</span>
                    <button
                      aria-pressed={lang === "en"}
                      onClick={() => setLang("en")}
                    >
                      EN
                    </button>
                  </div>
                  <button
                    className="icon-button theme-button"
                    aria-label={night ? t.day : t.night}
                    onClick={toggleNight}
                  >
                    {night ? <Sun size={17} /> : <Moon size={17} />}
                  </button>
                  <button
                    className="icon-button"
                    aria-label={t.search}
                    onClick={() => {
                      setFavorites(false);
                      setSearch(true);
                    }}
                  >
                    <Search size={17} />
                  </button>
                  <button
                    className="icon-button desktop-more"
                    aria-label={t.more}
                    onClick={() => setMore(true)}
                  >
                    <Ellipsis size={19} />
                  </button>
                </div>
              </header>
              <nav
                className={"mobile-nav " + (finalVisible ? "nav-hidden" : "")}
                aria-label={t.brand}
              >
                {[0, 1, 2, 3].map((i) => {
                  const Icon = navIcons[i];
                  return (
                    <a
                      className={active === navIds[i] ? "active" : ""}
                      key={i}
                      href={"#" + navIds[i]}
                    >
                      <Icon size={19} />
                      <span>{t.nav[i]}</span>
                    </a>
                  );
                })}
                <button onClick={() => setMore(true)}>
                  <Ellipsis size={21} />
                  <span>{t.more}</span>
                </button>
              </nav>
            </>
          )}
          <main hidden={ambient} inert={ambient}>
            <section id="home" className="hero">
              <div className="hero-content">
                <div className="eyebrow hero-eyebrow">
                  <span />
                  {t.eyebrow}
                </div>
                <h1>
                  {t.heroTitle[0]}
                  <br />
                  <em>{t.heroTitle[1]}</em>
                  <span className="title-star" aria-hidden="true">
                    ✳
                  </span>
                </h1>
                <p className="hero-greeting">
                  {t.heroGreeting.replace(
                    "{nickname}",
                    love.HER_NICKNAME === "beautiful"
                      ? t.nickname
                      : love.HER_NICKNAME,
                  )}
                </p>
                <p className="hero-description">{t.heroDescription}</p>
                <p className="hero-stay">{t.heroStay}</p>
                <div className="hero-action">
                  <a className="primary-button" href="#our-world">
                    {t.heroCta}
                    <ArrowRight size={16} />
                  </a>
                  <span className="handwritten">
                    {t.heroNote}
                    <svg viewBox="0 0 70 30" aria-hidden="true">
                      <path d="M65 5 Q30 35 5 15 M5 15 L9 24 M5 15 L15 13" />
                    </svg>
                  </span>
                </div>
                <div className="hero-bottom">
                  <span className="tiny-flower">✳</span>
                  <span>
                    {love.HER_NAME}
                    <i> & </i>
                    {love.YOUR_NAME}
                  </span>
                  <span className="hero-bottom-line" />
                  <span>
                    {t.partOne} <span className="heart-dot">♡</span>
                  </span>
                </div>
              </div>
              <div className="hero-visual">
                <div className="garden-photo">
                  <Image
                    src="/images/garden-blush.jpg"
                    alt={t.gardenAlt}
                    fill
                    priority
                    sizes="(max-width: 700px) 100vw, 52vw"
                  />
                  <div className="photo-gradient" />
                  <div className="garden-caption">
                    <span>{t.gardenTag}</span>
                    <p>{t.gardenCaption}</p>
                  </div>
                </div>
                <div className="garden-stamp">
                  <Flower2 size={29} strokeWidth={1} />
                  <span>{t.letterTo}</span>
                </div>
                <FlowerGarden onSecret={() => setSecret(true)} />
                <div className="garden-note">
                  <span>♡</span>
                  <p>{t.heroStay}</p>
                  <Sparkles size={13} />
                </div>
                <span className="hero-orbit" />
              </div>
              <a className="hero-scroll" href="#our-world">
                <span>{t.scroll}</span>
                <ArrowDown size={14} />
              </a>
            </section>
            {event && (
              <div className={"occasion-banner " + event}>
                {t[event as "birthday" | "anniversary" | "midnight"]}
              </div>
            )}
            <div className="section counter-section">
              <LoveCounter />
            </div>
            <Reveal id="our-world" className="section world-intro">
              <div className="section-heading centered">
                <Chapter number={1} />
                <h2>{t.worldTitle}</h2>
                <p>{t.worldDescription}</p>
              </div>
              <div className="chapter-grid">
                {t.chapterCards.map(([title, description], i) => {
                  const Icon = [Music2, Camera, Mail][i];
                  return (
                    <a
                      className={"chapter-card chapter-card-" + i}
                      key={i}
                      href={"#" + ["music", "memories", "letters"][i]}
                    >
                      <span className="card-index">
                        0{i + 1}
                        <ArrowUpRight size={17} />
                      </span>
                      <div className="chapter-illustration">
                        {i === 0 ? (
                          <>
                            <span className="little-record" />
                            <span className="record-label">
                              <Heart size={19} />
                            </span>
                          </>
                        ) : i === 1 ? (
                          <>
                            <span className="mini-polaroid">
                              <Image
                                src="/images/sea.jpg"
                                alt=""
                                fill
                                sizes="120px"
                              />
                            </span>
                            <span className="mini-polaroid back-photo">
                              <Image
                                src="/images/sunset.jpg"
                                alt=""
                                fill
                                sizes="120px"
                              />
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="mini-envelope">
                              <Heart size={24} />
                            </span>
                            <span className="envelope-spark">✧</span>
                          </>
                        )}
                      </div>
                      <div className="chapter-card-copy">
                        <h3>{title}</h3>
                        <p>{description}</p>
                        <Icon size={16} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </Reveal>
            <MusicPlayer />
            <QuoteMoment />
            <Timeline />
            <MemoryGallery />
            <LoveLetters />
            <ReasonCards />
            <Playful onRain={triggerRain} />
            <Future />
            <section ref={finalRef} id="final" className="final-scene">
              <div className="final-moon" />
              <FlowerGarden onSecret={() => setSecret(true)} />
              <div className="final-words">
                <span className="eyebrow">{t.letterTo}</span>
                {t.finalLines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.3 }}
                  >
                    {line}
                  </motion.p>
                ))}
                <motion.h2
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1 }}
                >
                  {t.finalLove}
                </motion.h2>
                <p>{t.finalSub}</p>
                <button
                  className="outline-button"
                  onClick={() => {
                    ambientScroll.current = window.scrollY;
                    setAmbient(true);
                  }}
                >
                  {t.stay}
                  <Heart size={15} />
                </button>
              </div>
            </section>
            <footer>
              <button
                className={"footer-heart " + (heartHeld ? "holding" : "")}
                aria-label={t.finalLove}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  holdHeart();
                }}
                onPointerUp={releaseHeart}
                onPointerCancel={releaseHeart}
                onBlur={releaseHeart}
                onKeyDown={(e) => {
                  if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                    e.preventDefault();
                    holdHeart();
                  }
                }}
                onKeyUp={releaseHeart}
              >
                <Heart size={27} strokeWidth={1} />
              </button>
              <p>{t.footer.replace("{name}", love.HER_NAME)}</p>
              <span>
                {t.partOne}
                <i> / </i>
                {t.footerSub}
              </span>
              <div className="footer-actions">
                <button onClick={() => void share()}>
                  {t.share}
                  <Share2 size={13} />
                </button>
                <button
                  onClick={() => {
                    setEntered(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  {t.replay}
                  <RotateCcw size={13} />
                </button>
              </div>
              <p className="footer-secret">{t.footerSecret}</p>
            </footer>
          </main>
          {ambient && (
            <div
              className="ambient-scene"
              onDoubleClick={() => setAmbient(false)}
            >
              <Image src="/images/garden-blush.jpg" alt="" fill sizes="100vw" />
              <div inert className="ambient-decoration">
                <FlowerGarden immersive onSecret={() => {}} />
              </div>
              <FloatingPetals />
              <button className="sr-only" onClick={() => setAmbient(false)}>
                {t.close}
              </button>
            </div>
          )}
          <Modal
            open={more}
            onClose={() => setMore(false)}
            title={t.more}
            className="more-modal"
          >
            <h2>{t.brand}</h2>
            <div className="more-list">
              <button
                onClick={() => {
                  setMore(false);
                  setFavorites(true);
                  setSearch(true);
                }}
              >
                <Bookmark size={18} />
                {t.favorites}
                <ArrowRight size={16} />
              </button>
              <button onClick={toggleSound}>
                {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}{" "}
                {t.sound}
                <span>{sound ? t.on : t.off}</span>
              </button>
              <button onClick={toggleNight}>
                {night ? <Sun size={18} /> : <Moon size={18} />}{" "}
                {night ? t.day : t.night}
              </button>
              <button onClick={() => void share()}>
                <Share2 size={18} />
                {t.share}
              </button>
              <button
                onClick={async () => {
                  if (!installPrompt) {
                    toast(t.installHint);
                    return;
                  }
                  try {
                    await installPrompt.prompt();
                    await installPrompt.userChoice;
                  } catch {
                    toast(t.installHint);
                  } finally {
                    setInstallPrompt(null);
                  }
                }}
              >
                <Download size={18} />
                {t.install}
              </button>
              {[
                ["letters", t.nav[4]],
                ["reasons", t.reasonsTitle],
                ["future", t.futureTitle],
                ["little-joys", t.playTitle],
              ].map(([id, label]) => (
                <a href={"#" + id} onClick={() => setMore(false)} key={id}>
                  <ArrowUpRight size={18} />
                  {label.replaceAll("\n", " ")}
                </a>
              ))}
            </div>
          </Modal>
          {search && (
            <CommandPalette
              open={search}
              onClose={() => setSearch(false)}
              onSecret={() => setSecret(true)}
              initialFavorites={favorites}
            />
          )}
          <Modal
            open={secret}
            onClose={() => {
              setSecret(false);
              setSecretOpen(false);
            }}
            title={t.secretTitle}
            className="secret-modal"
          >
            <div className="secret-content">
              <Sparkles size={30} />
              <h2>{t.secretTitle}</h2>
              <p>{t.secretDescription}</p>
              {secretOpen ? (
                <div className="secret-letter">
                  <p>{t.secretLetter}</p>
                  <CopyButton text={t.secretLetter} />
                </div>
              ) : (
                <button
                  className="secret-envelope"
                  onClick={() => {
                    setSecretOpen(true);
                    chime();
                  }}
                >
                  <LockKeyhole size={26} />
                  <span>{t.secretLock}</span>
                </button>
              )}
            </div>
          </Modal>
          <div ref={cursor} className="custom-cursor" aria-hidden="true" />
          {rain && <FloatingPetals rain />}
          <button
            className={
              "sound-dock " + (finalVisible || ambient ? "dock-hidden" : "")
            }
            onClick={toggleSound}
            aria-label={`${t.sound}: ${sound ? t.on : t.off}`}
            aria-pressed={sound}
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>
              {t.sound} {sound ? t.on : t.off}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
