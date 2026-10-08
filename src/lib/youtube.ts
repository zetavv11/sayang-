/** Official YouTube IFrame Player API. Loads only after a playback request. */
export type YouTubePlayer = {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getVideoUrl: () => string;
  getDuration: () => number;
  destroy: () => void;
};
export type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      host: string;
      width: string;
      height: string;
      videoId: string;
      playerVars: {
        origin: string;
        playsinline: number;
        autoplay: number;
        rel: number;
      };
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number; target: YouTubePlayer }) => void;
        onError: () => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayer;
};
declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let pending: Promise<YouTubeApi> | undefined;
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "youtube-player-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    const previous = window.onYouTubeIframeAPIReady;
    const cleanup = () => {
      clearTimeout(timeout);
      script.onerror = null;
      if (window.onYouTubeIframeAPIReady === ready)
        window.onYouTubeIframeAPIReady = previous;
    };
    const fail = () => {
      cleanup();
      script.remove();
      reject(new Error("YouTube player API unavailable"));
    };
    const ready = () => {
      if (!window.YT?.Player) {
        fail();
        return;
      }
      cleanup();
      resolve(window.YT);
      previous?.();
    };
    const timeout = setTimeout(fail, 12000);
    window.onYouTubeIframeAPIReady = ready;
    script.onerror = fail;
    document.getElementById(script.id)?.remove();
    document.body.append(script);
  }).catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
