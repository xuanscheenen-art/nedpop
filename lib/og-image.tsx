import { ImageResponse } from "next/og";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const ogImageContentType = "image/png";

export function createNedPopOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#12315f",
          padding: "64px 72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 32,
              background: "#fff0e3",
              color: "#ff963f",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            N
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 900 }}>NedPop</span>
            <span style={{ marginTop: 2, color: "#6482ad", fontSize: 20, fontWeight: 700 }}>内德泡泡</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <span style={{ color: "#ff963f", fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>
            LEARN DUTCH WITH UNDERSTANDING
          </span>
          <span style={{ marginTop: 18, fontSize: 68, fontWeight: 900, lineHeight: 1.12 }}>
            先搞懂，再记住。
          </span>
          <span style={{ marginTop: 22, color: "#486b9b", fontSize: 30, fontWeight: 700 }}>
            发音解码 → 语法规则 → 每日单词泡泡
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6482ad", fontSize: 22, fontWeight: 700 }}>A0–B1 荷兰语学习平台</span>
          <span
            style={{
              display: "flex",
              borderRadius: 24,
              background: "#12315f",
              color: "#ffffff",
              padding: "12px 22px",
              fontSize: 21,
              fontWeight: 800,
            }}
          >
            nedpop.com
          </span>
        </div>
      </div>
    ),
    ogImageSize,
  );
}
