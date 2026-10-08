/** All personal details live here. Dates use local calendar time (YYYY-MM-DD). */
export const love = {
  HER_NAME: "Sayang",
  HER_NICKNAME: "beautiful",
  YOUR_NAME: "me",
  RELATIONSHIP_START_DATE: "2024-02-14",
  HER_BIRTHDAY: "1999-06-21",
  FAVORITE_COLOR: "#b77583",
  FAVORITE_FLOWER: "peony",
  FAVORITE_SONG: "Until I Found You",
  PLAYLIST_URL:
    process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL ||
    "https://open.spotify.com/playlist/4yjgdCG36M4nuIhDhFLvOQ",
  PART_2_URL: process.env.NEXT_PUBLIC_PART_2_URL || "",
  DEFAULT_LANGUAGE: "en" as "en" | "id",
  // Replace these atmospheric starter photos with your own /public/images files.
  PHOTOS: [
    "/images/sunset.jpg",
    "/images/coffee.jpg",
    "/images/forest.jpg",
    "/images/sea.jpg",
  ],
  // Optional personal overrides. Empty arrays use the bilingual editorial defaults.
  CONTENT: {
    en: {
      mainLetter: "",
      storyTitles: [] as string[],
      storyBodies: [] as string[],
      storyDates: [] as string[],
      memoryCaptions: [] as string[],
      memoryStories: [] as string[],
      letterBodies: [] as string[],
      reasons: [] as string[],
    },
    id: {
      mainLetter: "",
      storyTitles: [] as string[],
      storyBodies: [] as string[],
      storyDates: [] as string[],
      memoryCaptions: [] as string[],
      memoryStories: [] as string[],
      letterBodies: [] as string[],
      reasons: [] as string[],
    },
  },
};
export const songs = [
  {
    title: "Until I Found You",
    spotifyId: "0T5iIrXA4p5GsubkhuBIKV",
    artist: "Stephen Sanchez",
    moods: [0, 6],
  },
  {
    title: "Lover",
    spotifyId: "1dGr1c8CrMLDpV6mPbImSI",
    artist: "Taylor Swift",
    moods: [0, 7],
  },
  {
    title: "Those Eyes",
    spotifyId: "50x1Ic8CaXkYNvjmxe3WXy",
    artist: "New West",
    moods: [2, 1],
  },
  {
    title: "Best Part",
    spotifyId: "1RMJOxR6GRPsBHL8qeC2ux",
    artist: "Daniel Caesar ft. H.E.R.",
    moods: [3, 7],
  },
  {
    title: "Glue Song",
    spotifyId: "3iBgrkexCzVuPy4O9vx7Mf",
    artist: "beabadoobee",
    moods: [3, 4],
  },
  {
    title: "Perfect",
    spotifyId: "0tgVpDi06FyKpA1z0VMD4v",
    artist: "Ed Sheeran",
    moods: [0, 6],
  },
  {
    title: "Adore You",
    spotifyId: "3jjujdWJ72nww5eGnfs2E7",
    artist: "Harry Styles",
    moods: [4, 7],
  },
  {
    title: "I Like Me Better",
    spotifyId: "2P91MQbaiQOfbiz9VqhqKQ",
    artist: "Lauv",
    moods: [4, 2],
  },
  {
    title: "Daylight",
    spotifyId: "1fzAuUVbzlhZ1lJAx9PtY6",
    artist: "Taylor Swift",
    moods: [5, 6],
  },
  {
    title: "Can’t Help Falling in Love",
    spotifyId: "44AyOl4qVkzS48vBsbNXaC",
    artist: "Elvis Presley",
    moods: [1, 5],
  },
];
export function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function spotifyPlaylist() {
  try {
    const url = new URL(love.PLAYLIST_URL);
    const match = url.pathname.match(/^\/playlist\/([A-Za-z0-9]+)\/?$/);
    return url.hostname === "open.spotify.com" && match
      ? match[1]
      : "4yjgdCG36M4nuIhDhFLvOQ";
  } catch {
    return "4yjgdCG36M4nuIhDhFLvOQ";
  }
}
