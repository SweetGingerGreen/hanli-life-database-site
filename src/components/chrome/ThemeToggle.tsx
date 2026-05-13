"use client";

import { useEffect, useState } from "react";

type ColorMode = "paper" | "ink";
type FontMode = "song" | "hei";

function persist(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function ThemeToggle({
  initialColorMode,
  initialFont,
}: {
  initialColorMode: ColorMode;
  initialFont: FontMode;
}) {
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const [font, setFont] = useState<FontMode>(initialFont);

  useEffect(() => {
    const savedColor = readCookie("theme");
    const savedFont = readCookie("font");
    if (savedColor === "paper" || savedColor === "ink") setColorMode(savedColor);
    if (savedFont === "song" || savedFont === "hei") setFont(savedFont);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.colorMode = colorMode;
    document.documentElement.dataset.font = font;
  }, [colorMode, font]);

  return (
    <div className="theme-toggle" aria-label="显示设置">
      <button
        className={`kbd swatch-paper ${colorMode === "paper" ? "is-active" : ""}`}
        onClick={() => {
          setColorMode("paper");
          persist("theme", "paper");
        }}
        title="宣纸主题"
        type="button"
      >
        朱
      </button>
      <button
        className={`kbd swatch-ink ${colorMode === "ink" ? "is-active" : ""}`}
        onClick={() => {
          setColorMode("ink");
          persist("theme", "ink");
        }}
        title="墨色主题"
        type="button"
      >
        墨
      </button>
      <button
        className={`kbd ${font === "song" ? "is-active" : ""}`}
        onClick={() => {
          setFont("song");
          persist("font", "song");
        }}
        title="宋体"
        type="button"
      >
        宋
      </button>
      <button
        className={`kbd ${font === "hei" ? "is-active" : ""}`}
        onClick={() => {
          setFont("hei");
          persist("font", "hei");
        }}
        title="黑体"
        type="button"
      >
        黑
      </button>
    </div>
  );
}
