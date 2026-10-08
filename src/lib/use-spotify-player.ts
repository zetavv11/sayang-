"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpotifyApi, type SpotifyController } from "./spotify";

type Status = "idle" | "loading" | "ready" | "error";
export function useSpotifyPlayer() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyController | null>(null);
  const desiredUri = useRef<string | null>(null);
  const loadedUri = useRef<string | null>(null);
  const ready = useRef(false);
  const [uri, setUri] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [playing, setPlaying] = useState(false);

  const fail = useCallback(() => {
    ready.current = false;
    setPlaying(false);
    setStatus("error");
  }, []);

  // Read the latest choice, including choices made while the API was loading.
  const playSelection = useCallback(() => {
    const current = controller.current;
    const selection = desiredUri.current;
    if (!current || !selection || !ready.current) return;
    try {
      if (loadedUri.current !== selection) {
        loadedUri.current = selection;
        if (current.loadEntity) current.loadEntity(selection);
        else current.loadUri(selection);
      }
      current.play();
    } catch {
      fail();
    }
  }, [fail]);

  useEffect(() => {
    if (!enabled || !host.current) return;
    let disposed = false;
    let instance: SpotifyController | undefined;
    const container = host.current;
    // Spotify replaces its target. Keep that target outside React's children.
    const target = document.createElement("div");
    container.replaceChildren(target);
    const timeout = setTimeout(() => {
      if (!disposed && !ready.current) fail();
    }, 15000);
    void loadSpotifyApi()
      .then((api) => {
        if (disposed || !desiredUri.current) return;
        const initialUri = desiredUri.current;
        loadedUri.current = initialUri;
        api.createController(
          target,
          { uri: initialUri, width: "100%", height: 352 },
          (created) => {
            if (disposed) {
              created.destroy();
              return;
            }
            instance = created;
            controller.current = created;
            created.addListener("ready", () => {
              if (disposed) return;
              clearTimeout(timeout);
              ready.current = true;
              setStatus("ready");
              playSelection();
            });
            created.addListener("playback_update", ({ data }) => {
              if (disposed || !ready.current) return;
              // A late event from the previous track must not light up the new one.
              if (
                desiredUri.current?.startsWith("spotify:track:") &&
                data.playingURI &&
                data.playingURI !== desiredUri.current
              )
                return;
              setPlaying(!data.isPaused && !data.isBuffering);
            });
          },
        );
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
      loadedUri.current = null;
      try {
        instance?.destroy();
      } catch {
        // Still release our host if the third-party controller cannot tear down.
      } finally {
        container.replaceChildren();
      }
    };
  }, [enabled, attempt, fail, playSelection]);

  const select = (nextUri: string) => {
    desiredUri.current = nextUri;
    setUri(nextUri);
    if (uri !== nextUri) setPlaying(false);
    if (ready.current && status === "ready") {
      playSelection();
    } else {
      setStatus("loading");
      setEnabled(true);
      if (status === "error") setAttempt((value) => value + 1);
    }
  };
  const toggle = () => {
    if (!ready.current || !controller.current) return;
    try {
      controller.current.togglePlay();
    } catch {
      fail();
    }
  };
  const retry = () => {
    ready.current = false;
    setStatus("loading");
    setPlaying(false);
    setAttempt((value) => value + 1);
  };
  return { host, uri, enabled, status, playing, select, toggle, retry };
}
