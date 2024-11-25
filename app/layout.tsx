import './globals.css'
import { Inter } from 'next/font/google'
import { SkillProvider } from './contexts/SkillContext'
import { TokenProvider } from './contexts/TokenContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Skill Master',
  description: 'Develop your skills with AI-generated tasks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TokenProvider>
          <SkillProvider>
            {children}
          </SkillProvider>
        </TokenProvider>
      </body>
    </html>
  )
}

