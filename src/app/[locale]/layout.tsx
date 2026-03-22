// app/[locale]/layout.tsx
import { PrismaClient } from '@prisma/client';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const prisma = new PrismaClient();

// 1. generateMetadata：params 改成 Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;   // ← Promise！
}): Promise<Metadata> {
  const { locale } = await params;        // ← await 一下
  const isZh = locale === 'zh';

  let settings: any = null;
  try {
    settings = await prisma.setting.findUnique({ where: { id: 'global' } });
  } catch {
    // ignore
  }

  const siteName = settings?.siteName || 'AI Directory';
  const domainRaw = (settings?.domain || 'yourdomain.com')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
  const baseUrl = `https://${domainRaw}`;

  const title = isZh ? `${siteName} - 全球顶尖 AI 资产导航` : `${siteName} - Discover the Best AI Tools`;
  const description = isZh
    ? (settings?.seoDescZh || '全自动发现、收录全球最新最好用的 AI 生产力工具。')
    : (settings?.seoDescEn || 'Daily updated AI directory to help you find the best tools.');

  const canonical = `${baseUrl}/${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en`,
        zh: `${baseUrl}/zh`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName,
      locale: isZh ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// 2. layout 组件：同样改成 async + await
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;   // ← Promise！
}) {
  const { locale } = await params;       // ← await
  const lang = locale === 'zh' ? 'zh-CN' : 'en';

  return (
    <html lang={lang} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
