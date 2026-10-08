"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeApi, type YouTubePlayer } from "./youtube";
type Status = "idle" | "loading" | "ready" | "error";
export function useYouTubePlayer(suspended: boolean) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<YouTubePlayer | null>(null);
  const desired = useRef<string | null>(null);
  const loaded = useRef<string | null>(null);
  const ready = useRef(false);
  const pausedForScene = useRef(suspended);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [playing, setPlaying] = useState(false);
  const fail = useCallback(() => {
    ready.current = false;
    try {
      controller.current?.pauseVideo();
    } catch {
      /* Player may be unavailable. */
    }
    setPlaying(false);
    setStatus("error");
  }, []);
  const playSelection = useCallback(() => {
    const player = controller.current;
    const selection = desired.current;
    if (!player || !selection || !ready.current) return;
    try {
      if (loaded.current !== selection) {
        loaded.current = selection;
        if (pausedForScene.current) player.cueVideoById(selection);
        else player.loadVideoById(selection);
      } else if (!pausedForScene.current) player.playVideo();
    } catch {
      fail();
    }
  }, [fail]);
  useEffect(() => {
    pausedForScene.current = suspended;
    if (suspended && ready.current) controller.current?.pauseVideo();
  }, [suspended]);
  useEffect(() => {
    if (!enabled || !host.current) return;
    let disposed = false;
    let instance: YouTubePlayer | undefined;
    const container = host.current;
    const target = document.createElement("div");
    container.replaceChildren(target);
    const timeout = setTimeout(() => {
      if (!disposed && !ready.current) fail();
    }, 15000);
    void loadYouTubeApi()
      .then((api) => {
        if (disposed || !desired.current) return;
        loaded.current = desired.current;
        instance = new api.Player(target, {
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          videoId: desired.current,
          playerVars: {
            origin: location.origin,
            playsinline: 1,
            autoplay: 0,
            rel: 0,
          },
          events: {
            onReady: ({ target: player }) => {
              if (disposed) {
                player.destroy();
                return;
              }
              clearTimeout(timeout);
              controller.current = player;
              ready.current = true;
              setStatus("ready");
              playSelection();
            },
            onStateChange: ({ data, target: player }) => {
              if (disposed || !ready.current) return;
              const current = new URL(player.getVideoUrl()).searchParams.get(
                "v",
              );
              if (current !== desired.current) return;
              if (pausedForScene.current && data === 1) {
                player.pauseVideo();
                return;
              }
              setPlaying(data === 1);
            },
            onError: () => {
              if (!disposed) {
                clearTimeout(timeout);
                fail();
              }
            },
            onAutoplayBlocked: () => {
              if (!disposed) setPlaying(false);
            },
          },
        });
      })
      .catch(() => {
        if (!disposed) {
          clearTimeout(timeout);
          fail();
        }
      });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      ready.current = false;
      controller.current = null;
      loaded.current = null;
      try {
        instance?.destroy();
      } finally {
        container.replaceChildren();
      }
    };
  }, [enabled, attempt, fail, playSelection]);
  const select = (next: string) => {
    desired.current = next;
    setVideoId(next);
    if (videoId !== next) setPlaying(false);
    if (ready.current && status === "ready") playSelection();
    else {
      setStatus("loading");
      setEnabled(true);
      if (status === "error") setAttempt((v) => v + 1);
    }
  };
  const toggle = () => {
    const player = controller.current;
    if (!ready.current || !player) return;
    try {
      if (player.getPlayerState() === 1) player.pauseVideo();
      else player.playVideo();
    } catch {
      fail();
    }
  };
  const retry = () => {
    ready.current = false;
    setPlaying(false);
    setStatus("loading");
    setAttempt((v) => v + 1);
  };
  return { host, videoId, enabled, status, playing, select, toggle, retry };
}
