import localFont from "next/font/local";

const pretendard = localFont({
  src: "./PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});

const maruBuri = localFont({
  src: [
    {
      path: "./MaruBuri-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./MaruBuri-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-maru-buri",
  fallback: ["Noto Serif KR", "serif"],
});

const jetBrainsMono = localFont({
  src: [
    {
      path: "./JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./JetBrainsMono-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export { jetBrainsMono, maruBuri, pretendard };
