import { ImageResponse } from "next/og";
export const runtime = "nodejs";
export const alt = "A little world, made for you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f2e9",
        color: "#424b3c",
        border: "25px solid #eee4db",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 18,
          letterSpacing: 8,
          color: "#a76b79",
          marginBottom: 36,
        }}
      >
        A SMALL PLACE. A VERY BIG LOVE.
      </div>
      <div style={{ display: "flex", fontSize: 93, fontFamily: "serif" }}>
        A little world,
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 93,
          fontFamily: "serif",
          fontStyle: "italic",
          color: "#a76b79",
        }}
      >
        made for you.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 22,
          color: "#7d7f70",
          marginTop: 40,
        }}
      >
        Somewhere between a website and a love letter.
      </div>
    </div>,
    { ...size },
  );
}
