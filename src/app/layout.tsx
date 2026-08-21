import type { Metadata } from "next";
import "@/style/globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { jetBrainsMono, maruBuri, pretendard } from "@/style/fonts/fonts";
import GoogleAnalytics from "@/lib/google-analytics"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${pretendard.className} ${pretendard.variable} ${maruBuri.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleAnalytics />
          <div className="flex min-h-screen w-full min-w-0 flex-col">
            <Header />
            <main className="mx-auto flex w-full max-w-screen-md flex-1 flex-col">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}


export const metadata: Metadata = {
  title: "방과후 블로그",
  description: "모든게 시작되는 시간",
  metadataBase: new URL("https://houkago.moe"),
  openGraph: {
    title: "방과후 블로그",
    description: "모든게 시작되는 시간",
    url: "https://houkago.moe",
    siteName: "방과후 블로그",
    images: [
      {
        url: "/home/main.jpg",
        width: 1200,
        height: 630,
        alt: "방과후 블로그",
      }
    ],
    locale: "ko_KR",
    type: "website",
  },
};
