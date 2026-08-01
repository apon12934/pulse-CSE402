import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/shell/Header'
import { Sidebar } from '@/components/shell/Sidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { cn } from '@pulse/ui'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Pulse',
  description: 'AI Core Pulse',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("h-full", inter.variable, jetbrainsMono.variable)}>
      <body className="flex h-full flex-col bg-[#000000] text-[#EDEDED] font-sans antialiased overflow-hidden">
        <ProtectedRoute>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 bg-black">
              {children}
            </main>
          </div>
        </ProtectedRoute>
      </body>
    </html>
  )
}
