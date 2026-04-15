import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Circle Kettle",
    template: "%s · Circle Kettle",
  },
  description:
    "Circle Kettle at UIUC: book a 30-minute slot, choose a coffee (or let us choose), and explore our menu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('ck-theme');if(t==='light')document.documentElement.dataset.theme='light';}catch(e){}",
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('ck-locale');if(l==='zh'){document.documentElement.lang='zh-CN';document.documentElement.dataset.locale='zh';}else{document.documentElement.lang='en';delete document.documentElement.dataset.locale;}}catch(e){}",
          }}
        />
        <LocaleProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
