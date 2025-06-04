import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "幽默回应生成器 - AI帮你机智回击",
  description: "输入对方的话，AI帮你生成幽默犀利的回复。支持不同强度的回击风格，让你在聊天中展现机智。",
  keywords: "幽默回应,AI回复,机智回击,聊天神器,幽默生成器",
  authors: [{ name: "幽默回应生成器" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "幽默回应生成器 - AI帮你机智回击",
    description: "输入对方的话，AI帮你生成幽默犀利的回复",
    type: "website",
    locale: "zh_CN",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="dns-prefetch" href="//openrouter.ai" />
        <link rel="preconnect" href="https://openrouter.ai" />
        {/* Plausible Analytics Script */}
        <script defer data-domain="luck3.kylintest.space" src="https://plausible.io/js/script.js"></script>
        {/* Microsoft Clarity Script */}
        <script type="text/javascript">
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "ru5xati9i5");
        </script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
