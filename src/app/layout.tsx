import type { Metadata } from "next";
import "@/style/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { pretendard } from "@/style/fonts/fonts";


export const metadata: Metadata = {
  title: "방과후 블로그",
  description: "블로그를 건설 중입니다...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.className} suppressHydrationWarning>
      <body className="max-w-screen-md min-w-[320px] mx-auto">
        <ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
          <main className="flex flex-col">
            <Header />
            {children}
          </main>
        
        </ThemeProvider>
        <Footer />

      </body>
    </html>
  );
}
