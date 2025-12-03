import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Sudoku Daily - Daily Sudoku puzzle with emoji grid showing solving progress";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAFA",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#000000",
              marginBottom: "20px",
              fontFamily: "serif",
              display: "flex",
            }}
          >
            Sudoku Daily
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#666666",
              marginBottom: "50px",
              display: "flex",
            }}
          >
            Pure Daily Sudoku Challenge
          </div>
          <div
            style={{
              fontSize: "32px",
              lineHeight: "1.2",
              letterSpacing: "6px",
              margin: "20px 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>🟩🟩⬜🟨⬜⬜🟩⬜⬜</div>
            <div style={{ display: "flex" }}>🟩⬜⬜⬜🟨⬜⬜🟩⬜</div>
            <div style={{ display: "flex" }}>⬜🟨⬜⬜⬜🟩⬜⬜🟩</div>
            <div style={{ display: "flex" }}>🟩⬜⬜🟩⬜⬜🟨⬜⬜</div>
            <div style={{ display: "flex" }}>⬜⬜🟩⬜🟨⬜⬜⬜🟩</div>
            <div style={{ display: "flex" }}>⬜🟩⬜⬜⬜🟨🟩⬜⬜</div>
            <div style={{ display: "flex" }}>🟨⬜🟩⬜⬜⬜⬜🟩⬜</div>
            <div style={{ display: "flex" }}>⬜⬜⬜🟩🟨⬜🟩⬜⬜</div>
            <div style={{ display: "flex" }}>⬜🟩⬜⬜🟩⬜⬜⬜🟨</div>
          </div>
          <div
            style={{
              width: "300px",
              height: "4px",
              backgroundColor: "#3B82F6",
              marginTop: "30px",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
