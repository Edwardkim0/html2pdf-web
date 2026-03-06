import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSansKR = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HTML → PDF 변환기",
  description:
    "HTML 파일을 브라우저 인쇄 기능을 활용하여 고품질 PDF로 변환하는 무료 온라인 도구입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${ibmPlexSansKR.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
