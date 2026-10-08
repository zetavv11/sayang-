"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Play,
  Pause,
  Music2,
  Heart,
  Moon,
  CloudRain,
  Sun,
  Sparkles,
  Flower2,
  Cloud,
  Headphones,
  Search,
  Info,
  RotateCcw,
} from "lucide-react";
import { useWorld } from "@/lib/world";
import { useYouTubePlayer } from "@/lib/use-youtube-player";
import { love, songs, spotifyPlaylist } from "@/config/love";
import { Chapter, FavoriteButton, Reveal } from "./ui";
const moodIcons = [
  Heart,
  Moon,
  Cloud,
  Flower2,
  Sun,
  CloudRain,
  Sparkles,
  Headphones,
];
export default function MusicPlayer({
  suspended = false,
}: {
  suspended?: boolean;
}) {
  const { t, toast } = useWorld();
  const [mood, setMood] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const {
    host,
    videoId: currentVideoId,
    enabled,
    status,
    playing,
    select: selectMedia,
    toggle,
    retry,
  } = useYouTubePlayer(suspended);
  const playlist = spotifyPlaylist();
  const activeTrack = songs.find((song) => currentVideoId === song.youtubeId);
  const destination = `https://www.youtube.com/watch?v=${activeTrack?.youtubeId || songs[0].youtubeId}`;
  useEffect(() => {
    document.body.dataset.music = playing ? "playing" : "paused";
    return () => {
      delete document.body.dataset.music;
    };
  }, [playing]);
  useEffect(() => {
    const container = host.current;
    if (!enabled || !container) return;
    const label = () => {
      const frame = container.querySelector("iframe");
      if (frame)
        frame.title = `${t.playlist}: ${activeTrack?.title || t.playlistName}`;
    };
    label();
    const observer = new MutationObserver(label);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled, host, activeTrack, t.playlist, t.playlistName]);
  const selected = songs
    .map((song, index) => ({ ...song, index }))
    .filter(
      (song) =>
        (mood === null || song.moods.includes(mood)) &&
        `${song.title} ${song.artist}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
    );
  const select = (video: string) => {
    selectMedia(video);
    requestAnimationFrame(() =>
      document
        .getElementById("youtube-player")
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };
  return (
    <Reveal
      id="music"
      className={"music-section section " + (playing ? "music-playing" : "")}
    >
      <div className="section-heading split-heading">
        <div>
          <Chapter number={2} />
          <h2>{t.musicTitle}</h2>
        </div>
        <p>{t.musicDescription}</p>
      </div>
      <div className="music-layout">
        <div className="playlist-card">
          <div className="album">
            <Image
              src="/images/garden-blush.jpg"
              alt={t.albumAlt}
              fill
              sizes="(max-width: 700px) 80vw, 330px"
            />
            <div className="album-type">
              <span>{t.playlist}</span>
              <span>{t.playlistName}</span>
              <i>{t.albumVolume}</i>
            </div>
            <div className="vinyl" />
          </div>
          <div className="playlist-info">
            <span className="eyebrow">
              <Music2 size={12} /> {activeTrack ? t.selectedSong : t.playlist}
            </span>
            <h3>{activeTrack?.title || t.playlistName}</h3>
            <p>{activeTrack?.artist || t.playlistNote}</p>
            <div className="player-actions">
              <button
                className="round-play"
                aria-label={
                  playing
                    ? t.pauseSong
                    : activeTrack
                      ? `${t.playSong} ${activeTrack.title}`
                      : t.play
                }
                onClick={() => {
                  if (status === "ready") toggle();
                  else if (status === "error") retry();
                  else select(currentVideoId || songs[0].youtubeId);
                }}
              >
                {playing ? (
                  <Pause size={19} fill="currentColor" />
                ) : (
                  <Play size={19} fill="currentColor" />
                )}
              </button>
              <a href={destination} target="_blank" rel="noopener noreferrer">
                {t.youtube}
                <ArrowUpRight size={15} />
              </a>
              <FavoriteButton
                id={
                  activeTrack
                    ? `song-${songs.indexOf(activeTrack)}`
                    : "song-playlist"
                }
              />
            </div>
            <a
              className="text-link back-to-playlist"
              href={`https://open.spotify.com/playlist/${playlist}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.spotifyPlaylistLink}
              <Music2 size={13} />
            </a>
            <p className="music-provider-note">{t.fullSongNote}</p>
            <div className="sound-waves" aria-hidden="true">
              {Array.from({ length: 25 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: `${8 + ((i * 17) % 23)}px`,
                    animationDelay: `${i * 0.09}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="recommendations">
          <div className="mood-heading">
            <h3>{t.mood}</h3>
            <Sparkles size={17} />
          </div>
          <label className="song-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              aria-label={t.searchSongs}
              placeholder={t.searchSongs}
              onChange={(event) => {
                setQuery(event.target.value);
                setMood(null);
              }}
            />
          </label>
          <div className="moods">
            <button
              className={mood === null ? "selected" : ""}
              aria-pressed={mood === null}
              onClick={() => {
                setMood(null);
                setQuery("");
              }}
            >
              <Music2 size={13} />
              {t.allSongs}
            </button>
            {t.moods.map((label, index) => {
              const Icon = moodIcons[index];
              return (
                <button
                  key={label}
                  className={mood === index ? "selected" : ""}
                  aria-pressed={mood === index}
                  onClick={() => {
                    setMood(index);
                    setQuery("");
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>
          <div className="song-list" role="group" aria-label={t.allSongs}>
            {selected.map((song) => {
              const video = song.youtubeId;
              const isSelected = currentVideoId === video;
              return (
                <div
                  className={"song " + (isSelected ? "selected-song" : "")}
                  key={song.spotifyId}
                >
                  <button
                    className="song-select"
                    aria-label={`${t.playSong} ${song.title} — ${song.artist}`}
                    aria-pressed={isSelected}
                    onClick={() => select(video)}
                  >
                    <span className={"song-art song-art-" + (song.index % 3)}>
                      <Play
                        size={17}
                        fill={isSelected ? "currentColor" : "none"}
                      />
                    </span>
                    <span className="song-info">
                      <strong>{song.title}</strong>
                      <small>{song.artist}</small>
                    </span>
                  </button>
                  <FavoriteButton id={`song-${song.index}`} />
                  <button
                    className="icon-button"
                    aria-label={`${t.songWhy}: ${song.title}`}
                    onClick={() => toast(t.songNotes[song.index])}
                  >
                    <Info size={17} />
                  </button>
                </div>
              );
            })}
            {!selected.length && (
              <p className="songs-empty" role="status">
                {t.songsEmpty}
              </p>
            )}
          </div>
          <div className="song-note">
            <span>“</span>
            <p>
              {
                t.songNotes[
                  activeTrack
                    ? songs.indexOf(activeTrack)
                    : selected[0]?.index || 0
                ]
              }
            </p>
          </div>
        </div>
      </div>
      {enabled && (
        <div id="youtube-player" className="youtube-embed">
          <p className="player-status" role="status">
            {status === "error"
              ? t.youtubeFallback
              : status === "loading"
                ? t.playerLoading
                : playing
                  ? t.nowPlaying
                  : t.playerReady}
            {activeTrack && (
              <strong>
                {activeTrack.title} · {activeTrack.artist}
              </strong>
            )}
          </p>
          <div ref={host} className="youtube-player-host" />
          {status === "error" && (
            <button className="outline-button player-retry" onClick={retry}>
              <RotateCcw size={15} />
              {t.retryPlayer}
            </button>
          )}
          {status === "ready" && !playing && (
            <p className="small">{t.playerHint}</p>
          )}
          <p className="small">{t.youtubeHelp}</p>
          <a
            className="text-link"
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.youtubeContinue}
            <ArrowUpRight size={15} />
          </a>
        </div>
      )}
      <span className="sr-only">{love.FAVORITE_SONG}</span>
    </Reveal>
  );
}
