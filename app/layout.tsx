// 全局样式
import './globals.css'

// 字体配置
import { Inter } from 'next/font/google'

// 上下文提供者 （React Context API 管理状态）

import { Providers } from './components/Providers';

const inter = Inter({ subsets: ['latin'] })

// 应用的元数据
export const metadata = {
  title: 'TaskCraft AI',
  description: 'Develop your skills with AI-generated tasks',
}

// 根布局组件
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

