"use client";
import { useState } from "react";
import { ArrowUpRight, Search, Bookmark, Command } from "lucide-react";
import { love, songs } from "@/config/love";
import { randomIndex, useWorld } from "@/lib/world";
import { Modal, CopyButton, FavoriteButton } from "./ui";
export default function CommandPalette({
  open,
  onClose,
  onSecret,
  initialFavorites = false,
}: {
  open: boolean;
  onClose: () => void;
  onSecret: () => void;
  initialFavorites?: boolean;
}) {
  const { t, favorites, toggleNight, toast } = useWorld();
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(initialFavorites);
  const [detail, setDetail] = useState<{
    id: string;
    title: string;
    text: string;
  } | null>(null);
  const go = (id: string) => {
    onClose();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const commands = [
    ...[
      "home",
      "story",
      "music",
      "encouragement",
      "letters",
      "reasons",
      "future",
    ].map((id, i) => ({
      id: "nav-" + id,
      title: [
        t.home,
        t.nav[1],
        t.nav[2],
        t.nav[3],
        t.nav[4],
        t.reasonsTitle,
        t.futureTitle,
      ][i].replaceAll("\n", " "),
      kind: t.chapter,
      text: "",
      action: () => go(id),
    })),
    {
      id: "nav-night",
      title: t.night,
      kind: t.chapter,
      text: "",
      action: () => {
        toggleNight();
        onClose();
      },
    },
    {
      id: "nav-secret",
      title: t.secretTitle,
      kind: t.chapter,
      text: "",
      action: () => {
        onClose();
        onSecret();
      },
    },
    {
      id: "nav-compliment",
      title: t.complimentButton,
      kind: t.chapter,
      text: "",
      action: () => {
        toast(t.compliments[randomIndex(t.compliments.length)]);
        onClose();
      },
    },
  ];
  const content = [
    ...t.encouragement.moods.map((item, i) => ({
      id: `encouragement-${i}`,
      title: item.title,
      kind: t.nav[3],
      text: `${item.body}

${item.step}`,
    })),
    ...t.encouragement.affirmations.map((text, i) => ({
      id: `affirmation-${i}`,
      title: text,
      kind: t.nav[3],
      text,
    })),
    {
      id: "letter--1",
      title: t.envelope,
      kind: t.nav[4],
      text: t.mainLetter.replace("{author}", love.YOUR_NAME),
    },
    ...t.letterTitles.map((title, i) => ({
      id: `letter-${i}`,
      title,
      kind: t.nav[4],
      text: t.letterBodies[i],
    })),
    ...t.reasons.map((title, i) => ({
      id: `reason-${i}`,
      title,
      kind: `${i + 1} / 100`,
      text: title,
    })),
    ...t.quotes.map((title, i) => ({
      id: `quote-${i}`,
      title,
      kind: t.quoteButton,
      text: title,
    })),
    {
      id: "song-playlist",
      title: t.playlistName,
      kind: t.nav[2],
      text: t.playlistNote,
    },
    ...songs.map((song, i) => ({
      id: `song-${i}`,
      title: song.title + " — " + song.artist,
      kind: t.nav[2],
      text: t.songNotes[i],
    })),
  ];
  const results = [...commands, ...content].filter(
    (item) =>
      (!onlyFavorites || favorites.includes(item.id)) &&
      `${item.title} ${item.text}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.search}
      className="search-modal"
    >
      <div className="search-top">
        <Search size={20} />
        <input
          autoFocus
          aria-label={t.search}
          placeholder={t.search}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDetail(null);
          }}
        />
        <kbd>
          <Command size={11} /> K
        </kbd>
      </div>
      <div className="search-filters">
        <button
          className={!onlyFavorites ? "selected" : ""}
          onClick={() => {
            setOnlyFavorites(false);
            setDetail(null);
          }}
        >
          {t.all}
        </button>
        <button
          className={onlyFavorites ? "selected" : ""}
          onClick={() => {
            setOnlyFavorites(true);
            setDetail(null);
          }}
        >
          <Bookmark size={13} />
          {t.favorites}
        </button>
      </div>
      {detail ? (
        <div className="search-detail">
          <button className="text-link" onClick={() => setDetail(null)}>
            ← {t.all}
          </button>
          <h3>{detail.title}</h3>
          <p>{detail.text}</p>
          <CopyButton text={detail.text} />
          <FavoriteButton id={detail.id} />
        </div>
      ) : (
        <div className="search-results">
          {results.slice(0, query ? 200 : 30).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if ("action" in item && typeof item.action === "function") {
                  item.action();
                } else {
                  setDetail(item);
                }
              }}
            >
              <span>
                <small>{item.kind}</small>
                {item.title}
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
          {!results.length && (
            <p className="empty-state">
              {onlyFavorites ? t.noFavorites : t.searchEmpty}
            </p>
          )}
        </div>
      )}
      <p className="search-footer">{t.searchHint}</p>
    </Modal>
  );
}
