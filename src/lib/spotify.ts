/** Public Spotify iFrame API. No OAuth token, Client ID or secret is used. */
export type PlaybackUpdate = {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    playingURI?: string;
  };
};
export type SpotifyController = {
  addListener(event: "ready", listener: () => void): void;
  addListener(
    event: "playback_update",
    listener: (event: PlaybackUpdate) => void,
  ): void;
  loadEntity?: (uri: string) => void;
  loadUri: (uri: string) => void;
  play: () => void;
  togglePlay: () => void;
  destroy: () => void;
};
export type SpotifyApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: SpotifyController) => void,
  ) => void;
};
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
    SpotifyIframeApi?: SpotifyApi;
  }
}
let pending: Promise<SpotifyApi> | undefined;
export function loadSpotifyApi(): Promise<SpotifyApi> {
  if (window.SpotifyIframeApi) return Promise.resolve(window.SpotifyIframeApi);
  if (pending) return pending;
  pending = new Promise<SpotifyApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "spotify-api";
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script.remove();
      if (window.onSpotifyIframeApiReady === ready)
        delete window.onSpotifyIframeApiReady;
      reject(new Error("Spotify iFrame API unavailable"));
    };
    const ready = (api: SpotifyApi) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script.onerror = null;
      window.SpotifyIframeApi = api;
      resolve(api);
    };
    const timeout = setTimeout(fail, 12000);
    window.onSpotifyIframeApiReady = ready;
    script.onerror = fail;
    document.getElementById(script.id)?.remove();
    document.body.append(script);
  }).catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
