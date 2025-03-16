import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/app/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "我的主页",
  description: "个人网站导航，快速访问常用站点",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>

        {/* 客户端滚动脚本 */}
        <Script id="scroll-handler" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', () => {
              const scrollButtons = document.querySelectorAll('[data-scroll-to]');
              scrollButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                  e.preventDefault();
                  const targetId = button.getAttribute('data-scroll-to');
                  const targetElement = document.getElementById(targetId + '-section');
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                  }
                });
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
